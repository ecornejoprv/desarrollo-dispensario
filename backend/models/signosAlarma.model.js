// models/signosAlarma.model.js (Código Completo)
// ==============================================================================
// @summary: Modelo para gestionar las operaciones CRUD de los signos de alarma
//           en la base de datos.
// ==============================================================================

import { db } from '../database/databasePostgres.js';

export const registrarSignoAlarma = async (signoAlarmaData) => {
  const query = `
    INSERT INTO dispensario.dmsigna (
      signa_cod_aten,
      signa_des_signa
    ) VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    signoAlarmaData.signa_cod_aten,
    signoAlarmaData.signa_des_signa
  ]);
  return rows[0];
};

export const getSignosAlarmaByAtencionId = async (atencionId) => {
    const query = `
      SELECT * FROM dispensario.dmsigna 
      WHERE signa_cod_aten = $1;
    `;
    const { rows } = await db.query(query, [atencionId]);
    return rows;
  };