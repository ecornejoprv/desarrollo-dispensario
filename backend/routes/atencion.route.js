import { Router } from 'express';
import {
  obtenerAtencionesPorPaciente,
  obtenerAtencionPorId,
  obtenerAtencionesPorPacienteYEspecialidad,
  validarCitaYMostrarPaciente,
  registrarAtencionController,
  obtenerCitasPendientesPorMedico,
  obtenerAtencionesPorMedicoYFechas,
  obtenerAtencionesPorFechas,
} from '../controllers/atencion.controller.js';
import { verifyToken } from '../middlewares/jwt.middleware.js';

const router = Router();

// Rutas específicas primero (más específicas a más generales)
router.get('/medico/:medicoId/reporte', verifyToken, obtenerAtencionesPorMedicoYFechas);
router.get('/reporte-atenciones', verifyToken, obtenerAtencionesPorFechas);
router.get('/paciente/:pacienteId/especialidad/:especialidad', verifyToken, obtenerAtencionesPorPacienteYEspecialidad);
router.get('/validar-cita/:pacienteId', verifyToken, validarCitaYMostrarPaciente);
router.get('/citas-pendientes/:medicoId', verifyToken, obtenerCitasPendientesPorMedico);
router.get('/paciente/:pacienteId', verifyToken, obtenerAtencionesPorPaciente);

// Ruta general para obtener atención por ID (debe ir al final)
router.get('/:atencionId', verifyToken, obtenerAtencionPorId);

// Ruta para registrar atención
router.post('/registrar-atencion', verifyToken, registrarAtencionController);

export default router;