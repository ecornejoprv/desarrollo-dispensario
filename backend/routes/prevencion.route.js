import { Router } from 'express';
import { getReportePrevencion } from '../controllers/prevencion.controller.js';

const router = Router();

router.get('/estadisticas-prevencion', getReportePrevencion);

export default router;