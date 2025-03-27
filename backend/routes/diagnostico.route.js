import express from 'express';
import { obtenerDiagnosticosPorAtencion } from '../controllers/diagnostico.controller.js';
import { registrarDiagnosticoController } from "../controllers/diagnostico.controller.js";

const router = express.Router();

router.get('/atencion/:atencionId', obtenerDiagnosticosPorAtencion);
router.post("/registrar-diagnostico", registrarDiagnosticoController);

export default router;