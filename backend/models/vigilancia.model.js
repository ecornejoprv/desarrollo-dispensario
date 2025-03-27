import { db } from '../database/databasePostgres.js';

export const registrarVigilancia = async (vigilanciaData) => {
  const query = `
    INSERT INTO dispensario.dmvigil (
      vigi_cod_aten,
      vigi_tip_vigi
    ) VALUES ($1, $2)
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    vigilanciaData.vigi_cod_aten,
    vigilanciaData.vigi_tip_vigi
  ]);
  return rows[0];
};

export const registrarVigilancias = async (vigilancias) => {
  const registros = [];
  for (const vigilancia of vigilancias) {
    const registro = await registrarVigilancia(vigilancia);
    registros.push(registro);
  }
  return registros;
};