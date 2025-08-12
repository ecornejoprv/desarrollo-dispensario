// models/alergias.model.js (Código Absolutamente Completo y Corregido)
// ==============================================================================
// @summary: Se corrige la función findByPaciente para que filtre los resultados
//           y devuelva únicamente las alergias con estado 'activa'. Esto asegura
//           que el "borrado lógico" (cambiar el estado a 'inactiva') se refleje
//           correctamente en la interfaz de usuario.
// ==============================================================================

import { db } from '../database/databasePostgres.js';

const Alergia = {
  // Crear una nueva alergia
  async create(alergiaData, userId) {
    const query = `
      INSERT INTO dispensario.dmaler (
        aler_cod_pacie, aler_nom_aler, aler_tipo_aler, aler_grav_aler, 
        aler_fec_aler, aler_sin_aler, aler_tra_aler, aler_est_aler, 
        aler_obs_aler, aler_usu_aler
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`;
    
    const values = [
      alergiaData.pacienteId,
      alergiaData.nombre,
      alergiaData.tipo,
      alergiaData.gravedad,
      alergiaData.fechaDiagnostico,
      alergiaData.sintomas,
      alergiaData.tratamiento,
      alergiaData.estado || 'activa',
      alergiaData.observaciones,
      userId
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Obtener todas las alergias ACTIVAS de un paciente
  async findByPaciente(pacienteId) {
    // --- CAMBIO CLAVE AQUÍ ---
    // Se añade la condición "AND aler_est_aler = 'activa'" para filtrar
    // los registros que han sido marcados como inactivos (borrado lógico).
    const query = `
      SELECT * FROM dispensario.dmaler 
      WHERE aler_cod_pacie = $1 AND aler_est_aler = 'activa'
      ORDER BY aler_fec_aler DESC
    `;
    const { rows } = await db.query(query, [pacienteId]);
    return rows;
  },

  // Actualizar una alergia
  async update(id, alergiaData, userId) {
    const query = `
      UPDATE dispensario.dmaler SET
        aler_nom_aler = $1, aler_tipo_aler = $2, aler_grav_aler = $3,
        aler_fec_aler = $4, aler_sin_aler = $5, aler_tra_aler = $6,
        aler_est_aler = $7, aler_obs_aler = $8, aler_fmo_aler = CURRENT_TIMESTAMP,
        aler_umo_aler = $9
      WHERE aler_cod_aler = $10
      RETURNING *`;
    
    const values = [
      alergiaData.nombre, alergiaData.tipo, alergiaData.gravedad,
      alergiaData.fechaDiagnostico, alergiaData.sintomas, alergiaData.tratamiento,
      alergiaData.estado, alergiaData.observaciones, userId, id
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Eliminar una alergia (borrado lógico)
  async remove(id, userId) {
    const query = `
      UPDATE dispensario.dmaler 
      SET aler_est_aler = 'inactiva', 
          aler_fmo_aler = CURRENT_TIMESTAMP,
          aler_umo_aler = $1
      WHERE aler_cod_aler = $2 
      RETURNING *`;
      
    const { rows } = await db.query(query, [userId, id]);
    return rows[0];
  }
};

export default Alergia;