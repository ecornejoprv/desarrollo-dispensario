// routes/receta.route.js (Código Completo)

import { Router } from 'express';
import { obtenerDatosRecetaPorAtencionId } from '../controllers/receta.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:atencionId', protect, obtenerDatosRecetaPorAtencionId);

export default router;