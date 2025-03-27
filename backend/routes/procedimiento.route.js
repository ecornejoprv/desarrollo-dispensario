import express from 'express';
import { obtenerProcedimientosPorDiagnostico } from '../controllers/procedimiento.controller.js';
import { registrarProcedimientoController } from "../controllers/procedimiento.controller.js";
import { buscarProcedimientosController } from '../controllers/procedimiento.controller.js';

const router = express.Router();

router.get('/diagnostico/:diagnosticoId', obtenerProcedimientosPorDiagnostico);
router.post("/registrar-procedimiento", registrarProcedimientoController);
router.get('/buscar', buscarProcedimientosController);

export default router;