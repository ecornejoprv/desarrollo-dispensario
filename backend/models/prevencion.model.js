import { db } from '../database/databasePostgres.js';
import { informixDb } from '../database/databaseInformix.js';

export const getEstadisticasPrevencion = async (genero, departamento) => {
  let connectionPostgres = null;
  let connectionInformix = null;
  
  try {
    // 1. Obtener códigos de empleados si hay departamento (Informix)
    let codigosEmpleados = [];
    if (departamento) {
      connectionInformix = await informixDb.pool.connect();
      const result = await connectionInformix.query(
        `SELECT codigo_empleado FROM "informix".v_empleados_departamento WHERE nombre_departamento = ?`,
        [departamento]
      );
      codigosEmpleados = result.map(e => e.codigo_empleado?.toString().trim());
    }

    // 2. Consulta principal en PostgreSQL
    connectionPostgres = await db.connect();
    let query = `
      SELECT 
        p.prev_tip_prev AS tipo_prevencion,
        g.idgen_nom_idgen AS genero,
        COUNT(*) AS total
      FROM dispensario.dmpreven p
      JOIN dispensario.dmatenc a ON p.prev_cod_aten = a.aten_cod_aten
      JOIN dispensario.dmpacie pac ON a.aten_cod_paci = pac.pacie_cod_pacie
      JOIN dispensario.dmidgen g ON pac.pacie_cod_gener = g.idgen_cod_idgen
    `;

    const conditions = [];
    const params = [];

    if (genero) {
      conditions.push(`pac.pacie_cod_gener = $${params.length + 1}`);
      params.push(genero);
    }

    if (departamento && codigosEmpleados.length > 0) {
      conditions.push(`a.aten_cod_medi = ANY($${params.length + 1})`);
      params.push(codigosEmpleados);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY p.prev_tip_prev, g.idgen_nom_idgen
      ORDER BY total DESC
    `;

    const { rows } = await connectionPostgres.query(query, params);
    return rows;

  } finally {
    if (connectionPostgres) await connectionPostgres.release();
    if (connectionInformix) await connectionInformix.close();
  }
};