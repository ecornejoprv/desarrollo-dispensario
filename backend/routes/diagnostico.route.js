import express from 'express';
import { obtenerDiagnosticosPorAtencion } from '../controllers/diagnostico.controller.js';

const router = express.Router();

router.get('/atencion/:atencionId', obtenerDiagnosticosPorAtencion);

export default router;