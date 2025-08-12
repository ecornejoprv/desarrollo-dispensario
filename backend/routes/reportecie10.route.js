import express from 'express';
import { 
    mostrarReporteDiagnosticos, 
    exportarReporteJSON,
    obtenerGeneros,
    obtenerDiagnosticosPorAreaGenero 
} from '../controllers/reportecie10.controller.js';

const router = express.Router();

// Ruta para la vista del reporte
router.get('/diagnosticos-genero', mostrarReporteDiagnosticos);

// Ruta para exportar los datos (API)
router.get('/api/diagnosticos-genero', exportarReporteJSON);
router.get('/api/generos', obtenerGeneros);
router.get('/diagnosticos-area-genero', obtenerDiagnosticosPorAreaGenero)

export default router;