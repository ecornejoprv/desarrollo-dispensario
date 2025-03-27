import { db } from '../database/databasePostgres.js';

export const registrarIndicacionGeneral = async (indicacionData) => {
  const query = `
    INSERT INTO dispensario.dmindic (
      indi_cod_aten,
      indi_des_indi
    ) VALUES ($1, $2)
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    indicacionData.indi_cod_aten,
    indicacionData.indi_des_indi
  ]);

  return rows[0];
};

export const getIndicacionesByatencionId = async (atencionId) => {
    const query = `
      SELECT * FROM dispensario.dmindic 
      WHERE indi_cod_aten = $1;
    `;
    const { rows } = await db.query(query, [atencionId]);
    return rows;
  };