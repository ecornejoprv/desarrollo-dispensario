import { Router } from 'express';
import {
    obtenerAtencionesPorPaciente,
    obtenerAtencionPorId,
    obtenerAtencionesPorPacienteYEspecialidad,
  } from '../controllers/atencion.controller.js';
import { verifyToken } from '../middlewares/jwt.middleware.js'; // Asegúrate de que el token esté verificado

const router = Router();

// Ruta para obtener las atenciones de un paciente
router.get('/paciente/:pacienteId', verifyToken, obtenerAtencionesPorPaciente);
router.get('/:atencionId', verifyToken, obtenerAtencionPorId);
router.get('/paciente/:pacienteId/especialidad/:especialidad', verifyToken, obtenerAtencionesPorPacienteYEspecialidad);

export default router;
