import { Router } from 'express';
import {
    obtenerAtencionesPorPaciente,
    obtenerAtencionPorId,
    obtenerAtencionesPorPacienteYEspecialidad,
    validarCitaYMostrarPaciente,
    registrarAtencionController,
    obtenerCitasPendientesPorMedico,
  } from '../controllers/atencion.controller.js';
import { verifyToken } from '../middlewares/jwt.middleware.js'; // Asegúrate de que el token esté verificado

const router = Router();

// Ruta para obtener las atenciones de un paciente
router.get('/paciente/:pacienteId', verifyToken, obtenerAtencionesPorPaciente);
router.get('/:atencionId', verifyToken, obtenerAtencionPorId);
router.get('/paciente/:pacienteId/especialidad/:especialidad', verifyToken, obtenerAtencionesPorPacienteYEspecialidad);

// Ruta para validar cita y mostrar datos del paciente
router.get('/validar-cita/:pacienteId', verifyToken, validarCitaYMostrarPaciente);

// Ruta para registrar una atención
router.post('/registrar-atencion', verifyToken, registrarAtencionController);

// Ruta para obtener citas pendientes por médico
router.get('/citas-pendientes/:medicoId', verifyToken, obtenerCitasPendientesPorMedico);

export default router;