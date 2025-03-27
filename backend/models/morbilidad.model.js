import { db } from '../database/databasePostgres.js';

export const registrarMorbilidad = async (morbilidadData) => {
  const query = `
    INSERT INTO dispensario.dmmorbi (
      morb_cod_aten,
      morb_tip_morb
    ) VALUES ($1, $2)
    RETURNING *;
  `;

  const { rows } = await db.query(query, [
    morbilidadData.morb_cod_aten,
    morbilidadData.morb_tip_morb
  ]);
  return rows[0];
};

export const registrarSistemasAfectados = async (sistemas, morb_cod_morb) => {
  const query = `
    INSERT INTO dispensario.dmsiste (
      sist_cod_morb,
      sist_nom_sist
    ) VALUES ($1, $2)
    RETURNING *;
  `;

  const registros = [];
  for (const sistema of sistemas) {
    const { rows } = await db.query(query, [morb_cod_morb, sistema]);
    registros.push(rows[0]);
  }
  return registros;
};