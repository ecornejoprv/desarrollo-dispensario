import { getProcedimientosByDiagnosticoId } from '../models/procedimiento.model.js';
import { registrarProcedimiento } from "../models/procedimiento.model.js";
import { buscarProcedimientos } from '../models/procedimiento.model.js';
import { obtenerTodosProcedimientos } from '../models/procedimiento.model.js';

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

// Registrar un procedimiento
export const registrarProcedimientoController = async (req, res) => {
  const procedimientoData = req.body;

  try {
    const procedimientoId = await registrarProcedimiento(procedimientoData);
    res.status(201).json({ procedimientoId, message: "Procedimiento registrado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el procedimiento: " + error.message });
  }
};

// Buscar procedimientos
export const buscarProcedimientosController = async (req, res) => {
  const { query } = req.query;

  try {
    // Si no hay query, devolvemos todos los procedimientos
    if (!query) {
      const resultados = await obtenerTodosProcedimientos();
      return res.status(200).json(resultados);
    }
    
    // Si hay query, filtramos
    const resultados = await buscarProcedimientos(query);
    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar procedimientos: " + error.message });
  }
};


export const obtenerTodosProcedimientosController = async (req, res) => {
  try {
    const procedimientos = await obtenerTodosProcedimientos();
    res.status(200).json(procedimientos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener todos los procedimientos: " + error.message });
  }
};
