// routes/triaje.route.js (Código Completo y Corregido)
// ==============================================================================
// @summary: Se corrige la ruta para crear un nuevo triaje. Se cambia de
//           '/triaje' a '/' para que coincida con el punto de montaje
//           '/api/v1/triajes' definido en server.js.
// ==============================================================================

import express from 'express';
import {
  obtenerTriajesPorCita,
  obtenerTriajePorId,
  crearTriaje,
  actualizarTriaje,
  eliminarTriaje,
  obtenerPrescripciones, 
  obtenerDetallesCita 
} from '../controllers/triaje.controller.js';

const router = express.Router();

// --- RUTAS ESPECÍFICAS (Se definen primero) ---
// Estas rutas tienen nombres fijos y van antes que las dinámicas.
router.get('/cita/:citaId', obtenerTriajesPorCita);
router.get('/prescripciones/:citaId', obtenerPrescripciones);
router.get('/detalles-cita/:citaId', obtenerDetallesCita);

// --- RUTAS DINÁMICAS Y RAÍZ (Se definen al final) ---

// CAMBIO CLAVE: La ruta para crear un nuevo triaje ahora es la raíz del módulo.
// ANTES: router.post('/triaje', crearTriaje);
// AHORA: router.post('/', crearTriaje);
router.post('/', crearTriaje);

// El resto de las rutas dinámicas para un triaje específico.
router.get('/:triajeId', obtenerTriajePorId);
router.put('/:triajeId', actualizarTriaje);
router.delete('/:triajeId', eliminarTriaje);

export default router;