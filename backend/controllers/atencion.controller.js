import {
  getAtencionesByPacienteId,
  getAtencionById,
  getAtencionesByPacienteIdAndEspecialidad,
  getTotalAtencionesByPacienteIdAndEspecialidad
} from '../models/atencion.model.js';

// Obtener todas las atenciones de un paciente
export const obtenerAtencionesPorPaciente = async (req, res) => {
  const { pacienteId } = req.params;
  try {
    const atenciones = await getAtencionesByPacienteId(pacienteId);
    res.json(atenciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una atención por su ID
export const obtenerAtencionPorId = async (req, res) => {
  const { atencionId } = req.params;
  try {
    const atencion = await getAtencionById(atencionId);
    if (atencion) {
      res.json(atencion);
    } else {
      res.status(404).json({ error: 'Atención no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener atenciones de un paciente por especialidad con paginación
export const obtenerAtencionesPorPacienteYEspecialidad = async (req, res) => {
  const { pacienteId, especialidad } = req.params;
  const { limit = 10, offset = 0 } = req.query; // Parámetros de paginación

  try {
    const atenciones = await getAtencionesByPacienteIdAndEspecialidad(pacienteId, especialidad, limit, offset);
    const total = await getTotalAtencionesByPacienteIdAndEspecialidad(pacienteId, especialidad);
    res.json({ atenciones, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};