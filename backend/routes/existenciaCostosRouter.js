import express from 'express';
import { ExistenciaCostosController } from '../controllers/existenciaCostosController.js';

const router = express.Router();

// Definir la ruta POST para /existencia-costos
router.post('/existencia-costos', ExistenciaCostosController.getExistenciaCostos);

export default router;