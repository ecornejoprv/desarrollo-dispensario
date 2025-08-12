// ===================================================================================
// == Archivo Completo: routes/odontograma.route.js ==
// ===================================================================================
// @summary Se añade la nueva ruta POST para guardar los datos periodontales.

import express from 'express';
import {
  actualizarOdontogramaController,
  upsertDetalleDentalController,
  eliminarDetalleDentalController,
  setEstadoDienteCompletoController,
  aplicarEstadoEnRangoController,
  obtenerDientesController,
  obtenerEstadosDentalesController,
  obtenerSuperficiesDentalesController,
  listarOdontogramasPorPacienteController,
  obtenerOdontogramaPorIdController,
  crearNuevoOdontogramaController,
  upsertPerioDataController,
  aplicarProtesisTotalArcadaController,
  eliminarProtesisCompletaController, 
  guardarIhosController,
} from '../controllers/odontograma.controller.js';

const router = express.Router();

router.get('/dientes', obtenerDientesController);
router.get('/estados', obtenerEstadosDentalesController);
router.get('/superficies', obtenerSuperficiesDentalesController);
router.get('/paciente/:pacienteId/lista', listarOdontogramasPorPacienteController);
router.post('/paciente/:pacienteId', crearNuevoOdontogramaController);
router.get('/:odontogramaId', obtenerOdontogramaPorIdController);
router.put('/:odontogramaId', actualizarOdontogramaController);
router.post('/:odontogramaId/detalles', upsertDetalleDentalController);
router.post('/:odontogramaId/diente/:dienteId/estado', setEstadoDienteCompletoController);
router.delete('/detalles/:detalleId', eliminarDetalleDentalController);
router.post('/:odontogramaId/rango', aplicarEstadoEnRangoController);
router.post('/:odontogramaId/diente/:dienteId/perio', upsertPerioDataController);
router.post('/:odontogramaId/arcada-total', aplicarProtesisTotalArcadaController);
router.delete('/:odontogramaId/protesis/:dienteId', eliminarProtesisCompletaController);
router.post('/:odontogramaId/ihos', guardarIhosController);

export default router;