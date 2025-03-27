import express from 'express';
import { registrarPrescripcionController } from '../controllers/prescripciones.controller.js';

const router = express.Router();

// Ruta para registrar una nueva prescripción
router.post('/prescripciones', registrarPrescripcionController);

export default router;