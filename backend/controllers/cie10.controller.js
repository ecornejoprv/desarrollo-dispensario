import { buscarCie10 } from '../models/cie10.model.js';

// Buscar códigos CIE10
export const buscarCie10Controller = async (req, res) => {
  const { query, limit = 50 } = req.query; // Nuevo parámetro limit

  if (!query) {
    return res.status(400).json({ error: "El parámetro de búsqueda es requerido." });
  }

  try {
    const resultados = await buscarCie10(query, parseInt(limit));
    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar códigos CIE10: " + error.message });
  }
};