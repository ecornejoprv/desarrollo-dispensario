import express from 'express';
import {
  crearAntecedentePersonalController,
  obtenerAntecedentesPersonalesController,
  crearAntecedenteGinecoController,
  obtenerAntecedentesGinecoController,
  crearAntecedenteTrabajoController,
  obtenerAntecedentesTrabajoController,
  crearHistorialToxicoController,
  obtenerHistorialToxicoController,
  crearAccidenteEnfermedadController,
  obtenerAccidentesEnfermedadesController,
  crearActividadExtralaboralController,
  obtenerActividadesExtralaboralesController
} from '../controllers/antecedentes.controller.js';

const router = express.Router();

// Antecedentes Personales
router.post('/personales', crearAntecedentePersonalController);
router.get('/personales/:pacienteId', obtenerAntecedentesPersonalesController);

// Antecedentes Gineco-Obstétricos
router.post('/gineco', crearAntecedenteGinecoController);
router.get('/gineco/:pacienteId', obtenerAntecedentesGinecoController);

// Antecedentes de Trabajo
router.post('/trabajo', crearAntecedenteTrabajoController);
router.get('/trabajo/:pacienteId', obtenerAntecedentesTrabajoController);

// Historial Tóxico y Estilo de Vida
router.post('/toxico', crearHistorialToxicoController);
router.get('/toxico/:pacienteId', obtenerHistorialToxicoController);

// Accidentes y Enfermedades
router.post('/accidentes', crearAccidenteEnfermedadController);
router.get('/accidentes/:pacienteId', obtenerAccidentesEnfermedadesController);

// Actividades Extralaborales
router.post('/extralaborales', crearActividadExtralaboralController);
router.get('/extralaborales/:pacienteId', obtenerActividadesExtralaboralesController);

export default router;