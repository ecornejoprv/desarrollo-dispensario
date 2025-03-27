import { registrarTerapias, getTerapiasByDiagnosticoId } from '../models/fisioterapia.model.js';

// Registrar terapias para un diagnóstico
export const registrarTerapiasController = async (req, res) => {
  try {
    const { diag_cod_diag, nombre, tecnicas } = req.body;
    
    if (!diag_cod_diag || !nombre || !tecnicas) {
      return res.status(400).json({ 
        error: "Todos los campos (diag_cod_diag, nombre, tecnicas) son requeridos." 
      });
    }
    
    const terapiaId = await registrarTerapias({ diag_cod_diag, nombre, tecnicas });
    res.status(201).json({ 
      message: "Terapias registradas correctamente.",
      terapiaId 
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al registrar las terapias: " + error.message 
    });
  }
};

// Obtener terapias por diagnóstico
export const obtenerTerapiasPorDiagnostico = async (req, res) => {
  try {
    const { diagnosticoId } = req.params;
    
    if (!diagnosticoId) {
      return res.status(400).json({ 
        error: "El ID del diagnóstico es requerido." 
      });
    }
    
    const terapias = await getTerapiasByDiagnosticoId(diagnosticoId);
    res.status(200).json(terapias);
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener las terapias: " + error.message 
    });
  }
};