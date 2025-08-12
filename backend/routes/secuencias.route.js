// routes/secuencias.route.js (Código Completo)

import { Router } from 'express';
import { obtenerSecuencialReceta } from '../controllers/secuencias.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; // Asegúrate que la ruta sea correcta

const router = Router();

router.post('/receta', protect, obtenerSecuencialReceta);

export default router;