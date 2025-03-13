import { getDiagnosticosByAtencionId } from '../models/diagnostico.model.js';

// Obtener todos los diagnósticos de una atención
export const obtenerDiagnosticosPorAtencion = async (req, res) => {
  const { atencionId } = req.params;
  try {
    const diagnosticos = await getDiagnosticosByAtencionId(atencionId);
    res.json(diagnosticos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};