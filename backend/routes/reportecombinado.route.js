import { Router } from 'express';
import { getTop10DiagnosticosCombinados, obtenerTodosLosGeneros } from '../controllers/reportecombinado.controller.js';

const router = Router();

// Route con filtros por query string: 
// Ejemplo: /api/top10-diagnosticos?genero=1&departamento=Cardiología&empresa=EMP001&fechaInicio=2025-06-01&fechaFin=2025-06-30
router.get('/top10-diagnosticos', getTop10DiagnosticosCombinados);

// Otros filtros
router.get('/generos', obtenerTodosLosGeneros);

export default router;