import express from 'express';
import { obtenerProcedimientosPorDiagnostico } from '../controllers/procedimiento.controller.js';

const router = express.Router();

router.get('/diagnostico/:diagnosticoId', obtenerProcedimientosPorDiagnostico);

export default router;