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
      triaj_exl_triaj,  -- Nuevo campo
      triaj_exi_triaj   -- Nuevo campo
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
      triaj_exl_triaj = $14,  -- Nuevo campo
      triaj_exi_triaj = $15   -- Nuevo campo
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