import { Router } from "express";
import { 
  obtenerEstadisticasSistemas,
  obtenerOpcionesSistemas
} from '../controllers/morbi.controller.js';

const router = Router()

router.get('/sistemas/reporte', (req, res, next) => {
  console.log("Entró a /api/v1/sistemas/reporte");
  return obtenerEstadisticasSistemas(req, res, next);
});
router.get('/sistemas/opciones', (req, res, next) => {
  console.log("Entró a /api/v1/sistemas/opciones");
  return obtenerOpcionesSistemas(req, res, next);
});

export default router;