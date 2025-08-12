import { db } from '../database/databasePostgres.js';

export const getEstadisticasSistemas = async (sistema, fechaDesde, fechaHasta) => {
  let connection = null;
  
  try {
    connection = await db.connect();
    let query = `
      SELECT 
        s.sist_nom_sist AS nombre_sistema,
        COUNT(*) AS total_atenciones
      FROM dispensario.dmsiste s
      JOIN dispensario.dmmorbi m ON s.sist_cod_morb = m.morb_cod_morb
      JOIN dispensario.dmatenc a ON m.morb_cod_aten = a.aten_cod_aten
    `;

    const conditions = [];
    const params = [];
    
    if (sistema) {
      conditions.push(`s.sist_nom_sist = $${params.length + 1}`);
      params.push(sistema);
    }

    if (fechaDesde) {
      conditions.push(`a.aten_fec_aten >= $${params.length + 1}`);
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      conditions.push(`a.aten_fec_aten <= $${params.length + 1}`);
      params.push(fechaHasta);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY s.sist_nom_sist
      ORDER BY total_atenciones DESC
    `;

    const { rows } = await connection.query(query, params);
    return rows;

  } finally {
    if (connection) await connection.release();
  }
};

export const getOpcionesSistemas = async () => {
  let connection = null;
  
  try {
    connection = await db.connect();
    const query = `
      SELECT DISTINCT sist_nom_sist 
      FROM dispensario.dmsiste 
      ORDER BY sist_nom_sist
    `;
    
    const { rows } = await connection.query(query);
    return rows.map(row => row.sist_nom_sist);
  } finally {
    if (connection) await connection.release();
  }
};