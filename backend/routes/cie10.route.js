import express from 'express';
import { buscarCie10Controller } from '../controllers/cie10.controller.js';

const router = express.Router();

router.get('/buscar', buscarCie10Controller);

export default router;