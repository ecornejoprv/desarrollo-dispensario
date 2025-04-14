import { db } from '../database/databasePostgres.js';

// Registrar una nueva prescripción
export const registrarPrescripcion = async (prescripcionData) => {
  const query = `
    INSERT INTO dispensario.dmpresc (
      pres_cod_aten,
      pres_cod_empr,
      pres_tip_pres,
      pres_cod_prod,
      pres_nom_prod,
      pres_can_pres,
      pres_cod_unid,
      pres_dos_pres,
      pres_adm_pres,
      pres_fre_pres,
      pres_dur_pres,
      pres_ind_pres,
      pres_cod_bode
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;

  const params = [
    prescripcionData.pres_cod_aten,
    prescripcionData.pres_cod_empr,
    prescripcionData.pres_tip_pres,
    prescripcionData.pres_cod_prod,
    prescripcionData.pres_nom_prod,
    prescripcionData.pres_can_pres,
    prescripcionData.pres_cod_unid,
    prescripcionData.pres_dos_pres,
    prescripcionData.pres_adm_pres,
    prescripcionData.pres_fre_pres,
    prescripcionData.pres_dur_pres,
    prescripcionData.pres_ind_pres,
    prescripcionData.pres_cod_bode,
  ];

  try {
    const result = await db.query(query, params);
    return result.rows[0]; // Retorna la prescripción registrada
  } catch (error) {
    console.error('Error al registrar la prescripción:', error);
    throw new Error('Error al registrar la prescripción');
  }
};