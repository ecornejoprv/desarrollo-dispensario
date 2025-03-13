import { db } from '../database/databasePostgres.js'; // Importa la conexión a PostgreSQL

// Obtener todas las citas
export const getCitas = async () => {
  const query = 'SELECT * FROM dispensario.dmcita';
  const result = await db.query(query);
  return result.rows;
};

// Obtener una cita por su ID
export const getCitaById = async (cita_cod_cita) => {
  const query = 'SELECT * FROM dispensario.dmcita WHERE cita_cod_cita = $1';
  const result = await db.query(query, [cita_cod_cita]);
  return result.rows[0];
};

// Crear una nueva cita
export const createCita = async (cita) => {
  const {
    cita_cod_pacie,
    cita_cod_sucu,
    cita_cod_espe,
    cita_hor_cita,
    cita_fec_cita,
    cita_nom_medi,
    cita_tie_est,
    cita_est_cita,
    cita_obs_cita,
  } = cita;

  const query = `
    INSERT INTO dispensario.dmcita (
      cita_cod_pacie,
      cita_cod_sucu,
      cita_cod_espe,
      cita_hor_cita,
      cita_fec_cita,
      cita_nom_medi,
      cita_tie_est,
      cita_est_cita,
      cita_obs_cita
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    cita_cod_pacie,
    cita_cod_sucu,
    cita_cod_espe,
    cita_hor_cita,
    cita_fec_cita,
    cita_nom_medi,
    cita_tie_est,
    cita_est_cita || 'PE',
    cita_obs_cita || null, // Si está vacío, insertar NULL
  ];

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error al crear la cita:', error);
    throw new Error('Error al guardar la cita');
  }
};

// Actualizar una cita existente
export const updateCita = async (cita_cod_cita, cita) => {
  const {
    cita_cod_pacie,
    cita_cod_sucu,
    cita_cod_espe,
    cita_hor_cita,
    cita_fec_cita,
    cita_nom_medi,
    cita_tie_est,
    cita_est_cita,
    cita_obs_cita,
  } = cita;

  const query = `
    UPDATE dispensario.dmcita
    SET
      cita_cod_pacie = $1,
      cita_cod_sucu, = $2
      cita_cod_espe = $3,
      cita_hor_cita = $4,
      cita_fec_cita = $5,
      cita_nom_medi = $6,
      cita_tie_est = $7,
      cita_est_cita = $8,
      cita_obs_cita = $9
    WHERE cita_cod_cita = $10
    RETURNING *;
  `;

  const values = [
    cita_cod_pacie,
    cita_cod_sucu,
    cita_cod_espe,
    cita_hor_cita,
    cita_fec_cita,
    cita_nom_medi,
    cita_tie_est,
    cita_est_cita,
    cita_obs_cita || null, // Si está vacío, insertar NULL
    cita_cod_cita,
  ];

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error al actualizar la cita:', error);
    throw new Error('Error al actualizar la cita');
  }
};

// Eliminar una cita
export const deleteCita = async (cita_cod_cita) => {
  const query = 'DELETE FROM dispensario.dmcita WHERE cita_cod_cita = $1 RETURNING *';
  try {
    const result = await db.query(query, [cita_cod_cita]);
    return result.rows[0];
  } catch (error) {
    console.error('Error al eliminar la cita:', error);
    throw new Error('Error al eliminar la cita');
  }
};