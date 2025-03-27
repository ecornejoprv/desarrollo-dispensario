import express from 'express';
import {
  obtenerTriajesPorCita,
  obtenerTriajePorId,
  crearTriaje,
  actualizarTriaje,
  eliminarTriaje,
} from '../controllers/triajeController.js';

const router = express.Router();

// Rutas para el triaje
router.get('/cita/:citaId', obtenerTriajesPorCita); // Obtener triajes por cita
router.get('/:triajeId', obtenerTriajePorId); // Obtener un triaje por ID
router.post('/', crearTriaje); // Crear un nuevo triaje
router.put('/:triajeId', actualizarTriaje); // Actualizar un triaje
router.delete('/:triajeId', eliminarTriaje); // Eliminar un triaje

export default router;