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
  obtenerPreventivaPorAtencion,
  obtenerVigilanciasPorAtencion,
  obtenerMorbilidadPorAtencion,
  obtenerPrescripcionesPorAtencion,
  obtenerIndicacionesPorAtencion,
  obtenerReferenciasPorAtencion,
  obtenerTriajePorAtencion,
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

router.get('/:atencionId/preventiva', verifyToken, obtenerPreventivaPorAtencion);
router.get('/:atencionId/vigilancias', verifyToken, obtenerVigilanciasPorAtencion);
router.get('/:atencionId/morbilidad', verifyToken, obtenerMorbilidadPorAtencion);
router.get('/:atencionId/prescripciones', verifyToken, obtenerPrescripcionesPorAtencion);
router.get('/:atencionId/indicaciones', verifyToken, obtenerIndicacionesPorAtencion);
router.get('/:atencionId/referencias', verifyToken, obtenerReferenciasPorAtencion);
router.get('/:atencionId/triaje', verifyToken, obtenerTriajePorAtencion);

export default router;