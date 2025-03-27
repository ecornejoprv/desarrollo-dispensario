import { db } from '../database/databasePostgres.js';

export const registrarReferencia = async (referenciaData) => {
  const query = `
    INSERT INTO dispensario.dmrefer (
      refe_cod_aten,
      refe_des_refe
    ) VALUES ($1, $2)
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    referenciaData.refe_cod_aten,
    referenciaData.refe_des_refe
  ]);

  return rows[0];
};

export const getReferenciasByAtencionId = async (atencionId) => {
    const query = `
      SELECT * FROM dispensario.dmrefer 
      WHERE refe_cod_aten = $1;
    `;
    const { rows } = await db.query(query, [atencionId]);
    return rows;
  };