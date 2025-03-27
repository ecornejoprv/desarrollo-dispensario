import { db } from '../database/databasePostgres.js';

export const registrarTerapia = async (terapiaData) => {
  const query = `
    INSERT INTO dispensario.dmterap (
      tera_cod_diag,
      tera_tipo,
      tera_categoria,
      tera_fecha
    ) VALUES ($1, $2, $3, $4)
    RETURNING tera_cod_tera;
  `;
  
  const { rows } = await db.query(query, [
    terapiaData.tera_cod_diag,
    terapiaData.tera_tipo,
    terapiaData.tera_categoria,
    terapiaData.tera_fecha
  ]);
  
  return rows[0];
};

export const obtenerTerapiasPorDiagnostico = async (diagnosticoId) => {
  const query = `
    SELECT * FROM dispensario.dmterap
    WHERE tera_cod_diag = $1
    ORDER BY tera_fecha DESC;
  `;
  
  const { rows } = await db.query(query, [diagnosticoId]);
  return rows;
};