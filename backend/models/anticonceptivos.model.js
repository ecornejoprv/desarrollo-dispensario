import { db } from '../database/databasePostgres.js';

// Métodos Anticonceptivos
export const crearAnticonceptivo = async (data) => {
  const query = `
    INSERT INTO dispensario.dmantic (
      antic_cod_pacie, 
      antic_fum_antic, 
      antic_obs_antic,
      antic_tipo_antic,
      antic_fap_antic,
      antic_prox_antic,
      antic_est_antic
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.pacienteId,
    data.fum,
    data.observaciones,
    data.tipoAnticonceptivo,
    data.fechaAplicacion,
    data.proximaRenovacion,
    data.estado || 'ACTIVO' // Valor por defecto
  ]);
  return rows[0];
};

export const obtenerAnticonceptivosPorPaciente = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmantic 
    WHERE antic_cod_pacie = $1
    ORDER BY antic_fap_antic DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};

export const actualizarAnticonceptivo = async (id, data) => {
  const query = `
    UPDATE dispensario.dmantic 
    SET 
      antic_fum_antic = COALESCE($1, antic_fum_antic),
      antic_obs_antic = COALESCE($2, antic_obs_antic),
      antic_tipo_antic = COALESCE($3, antic_tipo_antic),
      antic_prox_antic = COALESCE($4, antic_prox_antic),
      antic_est_antic = COALESCE($5, antic_est_antic)
    WHERE antic_cod_antic = $6
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.fum,
    data.observaciones,
    data.tipoAnticonceptivo,
    data.proximaRenovacion,
    data.estado,
    id
  ]);
  return rows[0];
};

export const eliminarAnticonceptivo = async (id) => {
  const query = `
    DELETE FROM dispensario.dmantic 
    WHERE antic_cod_antic = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export const obtenerAnticonceptivoPorId = async (id) => {
  const query = `
    SELECT * FROM dispensario.dmantic 
    WHERE antic_cod_antic = $1;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
};

// Métodos adicionales
export const obtenerAnticonceptivosActivos = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmantic 
    WHERE antic_cod_pacie = $1 AND antic_est_antic = 'ACTIVO'
    ORDER BY antic_fap_antic DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};

export const obtenerHistorialAnticonceptivos = async (pacienteId, limit = 10) => {
  const query = `
    SELECT * FROM dispensario.dmantic 
    WHERE antic_cod_pacie = $1
    ORDER BY antic_fap_antic DESC
    LIMIT $2;
  `;
  const { rows } = await db.query(query, [pacienteId, limit]);
  return rows;
};

// Nuevo método para cambiar estado
export const cambiarEstadoAnticonceptivo = async (id, nuevoEstado) => {
  const estadosValidos = ['ACTIVO', 'SUSPENDIDO', 'FINALIZADO'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw new Error('Estado no válido');
  }

  const query = `
    UPDATE dispensario.dmantic 
    SET antic_est_antic = $1
    WHERE antic_cod_antic = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [nuevoEstado, id]);
  return rows[0];
};