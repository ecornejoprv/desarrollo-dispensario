import { getMedicos } from "../models/medico.model.js";

export const obtenerMedicos = async (req, res) => {
  try {
    const medicos = await getMedicos();
    res.status(200).json(medicos);
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener la lista de médicos",
      details: error.message 
    });
  }
};