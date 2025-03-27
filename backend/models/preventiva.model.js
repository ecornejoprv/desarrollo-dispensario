import { db } from '../database/databasePostgres.js';

export const registrarPreventiva = async (preventivaData) => {
  const query = `
    INSERT INTO dispensario.dmpreven (
      prev_cod_aten,
      prev_tip_prev
    ) VALUES ($1, $2)
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    preventivaData.prev_cod_aten,
    preventivaData.prev_tip_prev
  ]);
  return rows[0];
};