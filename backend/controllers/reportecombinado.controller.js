import { db } from '../database/databasePostgres.js';
import { informixDb } from '../database/databaseInformix.js';

// Top 10 Diagnósticos combinados, ahora con filtro y salida de empresa (nombre) y fecha
export const getTop10DiagnosticosCombinados = async (req, res) => {
  let connectionPostgres = null;
  
  try {
    const { genero, empresa, fechaInicio, fechaFin,incluirZ ,top10  } = req.query;

    connectionPostgres = await db.connect();
    let queryDiagnosticos = `
      SELECT 
        d.diag_cod_cie10,
        c.cie10_nom_cie10 AS diagnostico,
        COUNT(*) AS cantidad,
        STRING_AGG(DISTINCT d.diag_obs_diag, '; ') AS observaciones,  -- Agregamos todas las observaciones distintas
        g.idgen_nom_idgen AS genero,
        e.empr_nom_empr AS empresa,
        c.cie10_id_cie10,
        MIN(ci.cita_fec_cita) AS fecha_inicio_rango,
        MAX(ci.cita_fec_cita) AS fecha_fin_rango
      FROM dispensario.dmdiag d
      JOIN dispensario.dmatenc a ON d.diag_cod_aten = a.aten_cod_aten
      JOIN dispensario.dmpacie p ON a.aten_cod_paci = p.pacie_cod_pacie
      JOIN dispensario.dmidgen g ON p.pacie_cod_gener = g.idgen_cod_idgen
      JOIN dispensario.dmcie10 c ON d.diag_cod_cie10 = c.cie10_cod_cie10
      JOIN dispensario.dmcita ci ON a.aten_cod_cita = ci.cita_cod_cita
      LEFT JOIN dispensario.dmempr e ON p.pacie_cod_empr = e.empr_cod_empr
    `;

    const conditions = [];
    const params = [];

    // Filtro por género
    if (genero) {
      conditions.push(`p.pacie_cod_gener = $${params.length + 1}`);
      params.push(genero);
    }

    // Filtro por empresa (por código)
    if (empresa) {
      conditions.push(`p.pacie_cod_empr = $${params.length + 1}`);
      params.push(empresa);
    }

    // Filtro por fecha de cita
    if (fechaInicio) {
      conditions.push(`ci.cita_fec_cita >= $${params.length + 1}`);
      params.push(fechaInicio);
    }
    if (fechaFin) {
      conditions.push(`ci.cita_fec_cita <= $${params.length + 1}`);
      params.push(fechaFin);
    }
    // Siempre excluir códigos que empiezan con K (sin opción para incluirlos)
    conditions.push(`c.cie10_id_cie10 NOT LIKE 'K%'`);
    // Filtro para códigos Z
    if (incluirZ !== 'true') {
      conditions.push(`c.cie10_id_cie10 NOT LIKE 'Z%'`);
    }
    

    if (conditions.length > 0) {
      queryDiagnosticos += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    queryDiagnosticos += `
      GROUP BY d.diag_cod_cie10, c.cie10_nom_cie10, g.idgen_nom_idgen, d.diag_obs_diag, e.empr_nom_empr, ci.cita_fec_cita, c.cie10_id_cie10
    `;
     // Orden y límite
    if (top10 === 'true') {
      queryDiagnosticos += `
        ORDER BY cantidad DESC
        LIMIT 10
      `;
    } else {
      queryDiagnosticos += `
        ORDER BY cantidad DESC
      `;
    }

    const { rows: diagnosticos } = await connectionPostgres.query(queryDiagnosticos, params);

    // Obtener géneros y empresas para los filtros
    const [generos, empresas] = await Promise.all([
      obtenerTodosLosGeneros(),
      getAllEmpresas()
    ]);

    res.json({
      success: true,
      data: {
        diagnosticos,
        total: diagnosticos.reduce((sum, item) => sum + parseInt(item.cantidad), 0),
        filtros: { generos, empresas }
      }
    });

  } catch (error) {
    console.error('Error en getTop10DiagnosticosCombinados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte combinado',
      error: error.message
    });
  } finally {
    if (connectionPostgres) {
      try { await connectionPostgres.release(); } catch(e) {}
    }
  }
};

async function obtenerTodosLosGeneros() {
  const { rows } = await db.query(`
    SELECT idgen_cod_idgen, idgen_nom_idgen 
    FROM dispensario.dmidgen 
    ORDER BY idgen_nom_idgen
  `);
  return rows;
}

// Ahora traemos el código y el nombre de la empresa para los filtros
async function getAllEmpresas() {
  const { rows } = await db.query(`
    SELECT DISTINCT e.empr_cod_empr AS value, e.empr_nom_empr AS label
    FROM dispensario.dmpacie p
    LEFT JOIN dispensario.dmempr e ON p.pacie_cod_empr = e.empr_cod_empr
    WHERE p.pacie_cod_empr IS NOT NULL
    ORDER BY e.empr_nom_empr
  `);
  return rows;
}

export { obtenerTodosLosGeneros, getAllEmpresas };