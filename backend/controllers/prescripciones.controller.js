import { registrarPrescripcion } from '../models/prescripciones.model.js';

// Registrar una nueva prescripción
export const registrarPrescripcionController = async (req, res) => {
  const prescripcionData = req.body;

  if (!prescripcionData) {
    return res.status(400).json({ error: "Los datos de la prescripción son requeridos." });
  }

  try {
    const nuevaPrescripcion = await registrarPrescripcion(prescripcionData);
    res.status(201).json(nuevaPrescripcion);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar la prescripción: " + error.message });
  }
};