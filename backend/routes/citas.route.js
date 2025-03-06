import express from 'express';
import {
  obtenerCitas,
  obtenerCitaPorId,
  crearCita,
  actualizarCita,
  eliminarCita,
} from '../controllers/citas.controller.js';

const router = express.Router();

// Rutas para las citas
router.get('/citas', obtenerCitas); // Obtener todas las citas
router.get('/citas/:id', obtenerCitaPorId); // Obtener una cita por su ID
router.post('/citas', crearCita); // Crear una nueva cita
router.put('/citas/:id', actualizarCita); // Actualizar una cita existente
router.delete('/citas/:id', eliminarCita); // Eliminar una cita

export default router;