import { getDiagnosticosByAtencionId } from '../models/diagnostico.model.js';
import { registrarDiagnostico } from "../models/diagnostico.model.js";

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

// Registrar un diagnóstico
export const registrarDiagnosticoController = async (req, res) => {
  const diagnosticoData = req.body;

  try {
    const diagnosticoId = await registrarDiagnostico(diagnosticoData);
    res.status(201).json({ diagnosticoId, message: "Diagnóstico registrado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el diagnóstico: " + error.message });
  }
};