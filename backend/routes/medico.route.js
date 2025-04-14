import { Router } from 'express';
import { obtenerMedicos } from '../controllers/medico.controller.js';
import { verifyToken } from '../middlewares/jwt.middleware.js';

const router = Router();

router.get('/', verifyToken, obtenerMedicos);

export default router;