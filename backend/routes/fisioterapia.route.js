import express from 'express';
import { 
  registrarTerapiasController,
  obtenerTerapiasPorDiagnostico
} from '../controllers/fisioterapia.controller.js';
import { verifyToken } from '../middlewares/jwt.middleware.js';

const router = express.Router();

// Registrar terapias para un diagnóstico
router.post('/registrar-terapias', verifyToken, registrarTerapiasController);

// Obtener terapias por diagnóstico
router.get('/diagnostico/:diagnosticoId', verifyToken, obtenerTerapiasPorDiagnostico);

export default router;