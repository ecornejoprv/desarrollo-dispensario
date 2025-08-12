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
  obtenerActividadesExtralaboralesController,
  actualizarAntecedentePersonalController,
  actualizarAntecedenteGinecoController,
  actualizarAntecedenteTrabajoController,
  actualizarHistorialToxicoController,
  actualizarAccidenteEnfermedadController,
  actualizarActividadExtralaboralController,
   eliminarAntecedentePersonalController,
  eliminarAntecedenteGinecoController,
  eliminarAntecedenteTrabajoController,
  eliminarHistorialToxicoController,
  eliminarAccidenteEnfermedadController,
  eliminarActividadExtralaboralController
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


//UPDATES 
// Antecedentes Personales
router.put('/personales/:id', actualizarAntecedentePersonalController);

// Antecedentes Gineco-Obstétricos
router.put('/gineco/:id', actualizarAntecedenteGinecoController);

// Antecedentes de Trabajo
router.put('/trabajo/:id', actualizarAntecedenteTrabajoController);

// Historial Tóxico y Estilo de Vida
router.put('/toxico/:id', actualizarHistorialToxicoController);

// Accidentes y Enfermedades
router.put('/accidentes/:id', actualizarAccidenteEnfermedadController);

// Actividades Extralaborales
router.put('/extralaborales/:id', actualizarActividadExtralaboralController);

// Antecedentes Personales
router.delete('/personales/:id', eliminarAntecedentePersonalController);

// Antecedentes Gineco-Obstétricos
router.delete('/gineco/:id', eliminarAntecedenteGinecoController);

// Antecedentes de Trabajo
router.delete('/trabajo/:id', eliminarAntecedenteTrabajoController);

// Historial Tóxico y Estilo de Vida
router.delete('/toxico/:id', eliminarHistorialToxicoController);

// Accidentes y Enfermedades
router.delete('/accidentes/:id', eliminarAccidenteEnfermedadController);

// Actividades Extralaborales
router.delete('/extralaborales/:id', eliminarActividadExtralaboralController);

export default router;