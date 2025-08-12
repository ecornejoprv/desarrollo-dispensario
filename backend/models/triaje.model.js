import { db } from '../database/databasePostgres.js'; // Importa la conexión a PostgreSQL

// Obtener todos los triajes de una cita específica
export const getTriajesByCitaId = async (citaId) => {
  const query = `
    SELECT * FROM dispensario.dmtriaj
    WHERE triaj_cod_cita = $1
    ORDER BY triaj_fec_triaj DESC;
  `;
  const { rows } = await db.query(query, [citaId]);
  return rows;
};

// Obtener un triaje por su ID
export const getTriajeById = async (triajeId) => {
  const query = `
    SELECT * FROM dispensario.dmtriaj
    WHERE triaj_cod_triaj = $1;
  `;
  const { rows } = await db.query(query, [triajeId]);
  return rows[0];
};

// Crear un nuevo registro de triaje
export const createTriaje = async (triajeData) => {
  const query = `
    INSERT INTO dispensario.dmtriaj (
      triaj_cod_cita,
      triaj_fec_triaj,
      triaj_par_triaj,
      triaj_niv_urge,
      triaj_tem_triaj,
      triaj_obs_triaj,
      triaj_fca_triaj,
      triaj_sat_triaj,
      triaj_fre_triaj,
      triaj_pes_triaj,
      triaj_tal_triaj,
      triaj_imc_triaj,
      triaj_pab_triaj,
      triaj_exl_triaj,  
      triaj_exi_triaj  
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    triajeData.triaj_cod_cita,
    triajeData.triaj_fec_triaj || new Date(), // Si no se proporciona, usa la fecha actual
    triajeData.triaj_par_triaj || null, // Puede ser NULL
    triajeData.triaj_niv_urge || null, // Puede ser NULL
    triajeData.triaj_tem_triaj || null, // Puede ser NULL
    triajeData.triaj_obs_triaj || null, // Puede ser NULL
    triajeData.triaj_fca_triaj || null, // Puede ser NULL
    triajeData.triaj_sat_triaj || null, // Puede ser NULL
    triajeData.triaj_fre_triaj || null, // Puede ser NULL
    triajeData.triaj_pes_triaj || null, // Puede ser NULL
    triajeData.triaj_tal_triaj || null, // Puede ser NULL
    triajeData.triaj_imc_triaj || null, // Puede ser NULL
    triajeData.triaj_pab_triaj || null, // Puede ser NULL
    triajeData.triaj_exl_triaj || 0, // Si no se proporciona, se guarda como 0
    triajeData.triaj_exi_triaj || 0, // Si no se proporciona, se guarda como 0
  ]);
  return rows[0];
};

// Actualizar un registro de triaje
export const updateTriaje = async (triajeId, triajeData) => {
  const query = `
    UPDATE dispensario.dmtriaj
    SET
      triaj_cod_cita = $1,
      triaj_fec_triaj = $2,
      triaj_par_triaj = $3,
      triaj_niv_urge = $4,
      triaj_tem_triaj = $5,
      triaj_obs_triaj = $6,
      triaj_fca_triaj = $7,
      triaj_sat_triaj = $8,
      triaj_fre_triaj = $9,
      triaj_pes_triaj = $10,
      triaj_tal_triaj = $11,
      triaj_imc_triaj = $12,
      triaj_pab_triaj = $13,
      triaj_exl_triaj = $14,  
      triaj_exi_triaj = $15   
    WHERE triaj_cod_triaj = $16
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    triajeData.triaj_cod_cita,
    triajeData.triaj_fec_triaj,
    triajeData.triaj_par_triaj || null,
    triajeData.triaj_niv_urge || null,
    triajeData.triaj_tem_triaj || null,
    triajeData.triaj_obs_triaj || null,
    triajeData.triaj_fca_triaj || null,
    triajeData.triaj_sat_triaj || null,
    triajeData.triaj_fre_triaj || null,
    triajeData.triaj_pes_triaj || null,
    triajeData.triaj_tal_triaj || null,
    triajeData.triaj_imc_triaj || null,
    triajeData.triaj_pab_triaj || null,
    triajeData.triaj_exl_triaj || 0,
    triajeData.triaj_exi_triaj || 0,
    triajeId,
  ]);
  return rows[0];
};

// Eliminar un registro de triaje
export const deleteTriaje = async (triajeId) => {
  const query = `
    DELETE FROM dispensario.dmtriaj
    WHERE triaj_cod_triaj = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [triajeId]);
  return rows[0];
};


// Obtener todas las prescripciones de una cita, separadas por tipo
export const getPrescripcionesByCitaId = async (citaId) => {
  const query = `
    SELECT
      p.pres_cod_pres AS codigo,
      p.pres_tip_pres AS tipo,
      p.pres_nom_prod AS producto,
      p.pres_can_pres AS cantidad,
      p.pres_dos_pres AS dosis,
      p.pres_adm_pres AS via,
      p.pres_fre_pres AS frecuencia,
      p.pres_dur_pres AS duracion,
      p.pres_ind_pres AS indicaciones
    FROM dispensario.dmpresc p
    JOIN dispensario.dmatenc a ON p.pres_cod_aten = a.aten_cod_aten
    WHERE a.aten_cod_cita = $1
    ORDER BY p.pres_tip_pres, p.pres_nom_prod;
  `;
  
  const { rows } = await db.query(query, [citaId]);
  
  // Separar por tipo de prescripción
  const resultado = {
    empresa: rows.filter(p => p.tipo === 'Empresa'),
    externa: rows.filter(p => p.tipo === 'Externa')
  };
  
  return resultado;
};

// Obtener todos los detalles de la cita (diagnósticos, prescripciones, etc.)
export const getDetallesCompletosByCitaId = async (citaId) => {
  const query = `
    SELECT
      a.aten_cod_aten AS codigo_atencion,
      ci.cita_cod_cita AS codigo_cita,
      ci.cita_fec_cita AS fecha_cita,
      ci.cita_hor_cita AS hora_cita,
      d.diag_cod_diag AS codigo_diagnostico,
      c.cie10_id_cie10 AS id_cie10,
      c.cie10_nom_cie10 AS nombre_cie10,
      d.diag_est_diag AS estado_diagnostico,
      d.diag_obs_diag AS observacion_diagnostico,
      p.pres_cod_pres AS codigo_prescripcion,
      p.pres_tip_pres AS tipo_prescripcion,
      p.pres_nom_prod AS nombre_producto,
      p.pres_can_pres AS cantidad,
      p.pres_dos_pres AS dosis,
      p.pres_adm_pres AS via_administracion,
      p.pres_fre_pres AS frecuencia,
      p.pres_dur_pres AS duracion_dias,
      p.pres_ind_pres AS indicaciones_prescripcion,
      r.refe_cod_refe AS codigo_referencia,
      r.refe_des_refe AS descripcion_referencia,
      i.indi_cod_indi AS codigo_indicacion,
      i.indi_des_indi AS descripcion_indicacion
    FROM
      dispensario.dmatenc a
    LEFT JOIN
      dispensario.dmcita ci ON a.aten_cod_cita = ci.cita_cod_cita
    LEFT JOIN
      dispensario.dmdiag d ON a.aten_cod_aten = d.diag_cod_aten
    LEFT JOIN
      dispensario.dmcie10 c ON d.diag_cod_cie10 = c.cie10_cod_cie10
    LEFT JOIN
      dispensario.dmpresc p ON a.aten_cod_aten = p.pres_cod_aten
    LEFT JOIN
      dispensario.dmrefer r ON a.aten_cod_aten = r.refe_cod_aten
    LEFT JOIN
      dispensario.dmindic i ON a.aten_cod_aten = i.indi_cod_aten
    WHERE
      ci.cita_cod_cita = $1;
  `;
  
  const { rows } = await db.query(query, [citaId]);
  return rows;
};