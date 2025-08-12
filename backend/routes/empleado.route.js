import { Router } from 'express';
import {
  obtenerDatosEmpleado
} from '../controllers/empleado.controller.js';
import { verifyToken } from '../middlewares/jwt.middleware.js';

const router = Router();

// Obtener datos completos de un empleado por cédula
router.get('/:cedula/empresa/:codEmpresa', obtenerDatosEmpleado);



export default router;