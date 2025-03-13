import { getProcedimientosByDiagnosticoId } from '../models/procedimiento.model.js';

// Obtener todos los procedimientos de un diagnóstico
export const obtenerProcedimientosPorDiagnostico = async (req, res) => {
  const { diagnosticoId } = req.params;
  try {
    const procedimientos = await getProcedimientosByDiagnosticoId(diagnosticoId);
    res.json(procedimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};