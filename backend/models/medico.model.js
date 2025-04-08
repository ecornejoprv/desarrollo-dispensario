import { db } from '../database/databasePostgres.js';

export const getMedicos = async () => {
  const query = `
    SELECT 
      m.medic_cod_medic,
      m.medic_nom_medic,
      m.medic_ced_medic,
      e.espe_nom_espe
    FROM dispensario.dmmedic m
    LEFT JOIN dispensario.dmespec e ON m.medic_cod_espe = e.espe_cod_espe
    WHERE m.medic_est_medic = 'AC'
    ORDER BY m.medic_nom_medic;
  `;
  
  const { rows } = await db.query(query);
  return rows;
};