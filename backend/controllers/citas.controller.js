import {
    getCitas,
    getCitaById,
    createCita,
    updateCita,
    deleteCita,
  } from '../models/citas.model.js';
  
  // Obtener todas las citas
  export const obtenerCitas = async (req, res) => {
    try {
      const citas = await getCitas();
      res.status(200).json(citas);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las citas', error });
    }
  };
  
  // Obtener una cita por su ID
  export const obtenerCitaPorId = async (req, res) => {
    const { id } = req.params;
    try {
      const cita = await getCitaById(id);
      if (cita) {
        res.status(200).json(cita);
      } else {
        res.status(404).json({ message: 'Cita no encontrada' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la cita', error });
    }
  };
  
  // Crear una nueva cita
  export const crearCita = async (req, res) => {
    const nuevaCita = req.body;
    try {
      const citaCreada = await createCita(nuevaCita);
      res.status(201).json(citaCreada);
    } catch (error) {
      res.status(500).json({ message: 'Error al crear la cita', error });
    }
  };
  
  // Actualizar una cita existente
  export const actualizarCita = async (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;
    try {
      const citaActualizada = await updateCita(id, datosActualizados);
      if (citaActualizada) {
        res.status(200).json(citaActualizada);
      } else {
        res.status(404).json({ message: 'Cita no encontrada' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la cita', error });
    }
  };
  
  // Eliminar una cita
  export const eliminarCita = async (req, res) => {
    const { id } = req.params;
    try {
      const citaEliminada = await deleteCita(id);
      if (citaEliminada) {
        res.status(200).json({ message: 'Cita eliminada correctamente' });
      } else {
        res.status(404).json({ message: 'Cita no encontrada' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la cita', error });
    }
  };