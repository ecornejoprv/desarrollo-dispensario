import {
    getTriajesByCitaId,
    getTriajeById,
    createTriaje,
    updateTriaje,
    deleteTriaje
  } from '../models/triaje.model.js';
  
  // Obtener todos los triajes de una cita
  export const obtenerTriajesPorCita = async (req, res) => {
    try {
      const { citaId } = req.params;
      const triajes = await getTriajesByCitaId(citaId);
      res.status(200).json(triajes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Obtener un triaje por su ID
  export const obtenerTriajePorId = async (req, res) => {
    try {
      const { triajeId } = req.params;
      const triaje = await getTriajeById(triajeId);
      if (triaje) {
        res.status(200).json(triaje);
      } else {
        res.status(404).json({ error: 'Triaje no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Crear un nuevo triaje
  export const crearTriaje = async (req, res) => {
    try {
      console.log('Datos recibidos:', req.body); // Agrega este log
      const nuevoTriaje = await createTriaje(req.body);
      console.log('Triaje creado:', nuevoTriaje); // Agrega este log
      res.status(201).json(nuevoTriaje);
    } catch (error) {
      console.error('Error al crear triaje:', error); // Agrega este log
      res.status(400).json({ error: error.message });
    }
  };
  
  // Actualizar un triaje existente
  export const actualizarTriaje = async (req, res) => {
    try {
      const { triajeId } = req.params;
      const triajeActualizado = await updateTriaje(triajeId, req.body);
      if (triajeActualizado) {
        res.status(200).json(triajeActualizado);
      } else {
        res.status(404).json({ error: 'Triaje no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Eliminar un triaje
  export const eliminarTriaje = async (req, res) => {
    try {
      const { triajeId } = req.params;
      const triajeEliminado = await deleteTriaje(triajeId);
      if (triajeEliminado) {
        res.status(204).json({ message: 'Triaje eliminado' });
      } else {
        res.status(404).json({ error: 'Triaje no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };