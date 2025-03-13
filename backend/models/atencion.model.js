import { db } from '../database/databasePostgres.js';

// Obtener todas las atenciones de un paciente
export const getAtencionesByPacienteId = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmatenc 
    WHERE aten_cod_paci = $1
    ORDER BY aten_fec_aten DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};

// Obtener una atención por su ID
export const getAtencionById = async (atencionId) => {
  const query = `
    SELECT * FROM dispensario.dmatenc 
    WHERE aten_cod_aten = $1;
  `;
  const { rows } = await db.query(query, [atencionId]);
  return rows[0];
};

// Obtener atenciones de un paciente por especialidad con paginación
export const getAtencionesByPacienteIdAndEspecialidad = async (pacienteId, especialidad, limit, offset) => {
  let query;
  let params;

  if (especialidad === "Todas") {
    query = `
      SELECT * FROM dispensario.dmatenc 
      WHERE aten_cod_paci = $1
      ORDER BY aten_fec_aten DESC
      LIMIT $2 OFFSET $3;
    `;
    params = [pacienteId, limit, offset];
  } else {
    query = `
      SELECT * FROM dispensario.dmatenc 
      WHERE aten_cod_paci = $1 AND aten_esp_aten = $2
      ORDER BY aten_fec_aten DESC
      LIMIT $3 OFFSET $4;
    `;
    params = [pacienteId, especialidad, limit, offset];
  }

  const { rows } = await db.query(query, params);
  return rows;
};

// Obtener el total de atenciones para un paciente y especialidad
export const getTotalAtencionesByPacienteIdAndEspecialidad = async (pacienteId, especialidad) => {
  let query;
  let params;

  if (especialidad === "Todas") {
    query = `
      SELECT COUNT(*) as total FROM dispensario.dmatenc 
      WHERE aten_cod_paci = $1;
    `;
    params = [pacienteId];
  } else {
    query = `
      SELECT COUNT(*) as total FROM dispensario.dmatenc 
      WHERE aten_cod_paci = $1 AND aten_esp_aten = $2;
    `;
    params = [pacienteId, especialidad];
  }

  const { rows } = await db.query(query, params);
  return rows[0].total;
};