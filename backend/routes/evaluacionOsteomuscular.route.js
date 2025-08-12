import { Router } from 'express';
import {
    listarVersionesController,
    crearNuevaVersionController,
    obtenerEvaluacionController,
    actualizarEvaluacionController
} from '../controllers/evaluacionOsteomuscular.controller.js';
import { verifyToken } from '../middlewares/jwt.middleware.js';

const router = Router();

// Todas las rutas estarán protegidas por el token de autenticación
router.use(verifyToken);

// Obtener todas las versiones de evaluación para un paciente
router.get('/paciente/:pacienteId/versiones', listarVersionesController);

// Crear una nueva versión de evaluación para un paciente
router.post('/paciente/:pacienteId', crearNuevaVersionController);

// Obtener los datos completos de una versión de evaluación específica
router.get('/:evaluacionId', obtenerEvaluacionController);

// Actualizar una versión de evaluación específica
router.put('/:evaluacionId', actualizarEvaluacionController);

export default router;