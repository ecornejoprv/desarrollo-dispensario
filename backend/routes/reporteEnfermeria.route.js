// src/routes/reporteEnfermeria.route.js (NUEVO ARCHIVO)

import { Router } from 'express';
import { generarReporteEnfermeria } from '../controllers/atencion.controller.js';

const router = Router();

// Se define la ruta raíz GET ('/') que será el endpoint principal del reporte.
router.get('/', generarReporteEnfermeria);

export default router;