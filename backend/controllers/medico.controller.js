import { getMedicos } from "../models/medico.model.js";

export const obtenerMedicos = async (req, res) => {
  try {
    // Se extrae el 'locationId' de los query params de la URL (ej: /api/v1/medicos?locationId=1)
    const { locationId } = req.query;
    
    // Se pasa el locationId (que puede ser undefined) a la función del modelo.
    const medicos = await getMedicos(locationId);
    
    res.status(200).json(medicos);
  } catch (error) {
    console.error("Error detallado en obtenerMedicos controller:", error);
    res.status(500).json({ 
      error: "Error al obtener la lista de médicos",
      details: error.message 
    });
  }
};