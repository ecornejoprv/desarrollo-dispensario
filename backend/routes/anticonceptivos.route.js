import express from 'express';
import { body, param } from 'express-validator'; // Importa las funciones necesarias
import {
  crearAnticonceptivoHandler,
  obtenerAnticonceptivosPacienteHandler,
  actualizarAnticonceptivoHandler,
  eliminarAnticonceptivoHandler,
  obtenerAnticonceptivoHandler,
  obtenerAnticonceptivosActivosHandler,
  cambiarEstadoAnticonceptivoHandler
} from '../controllers/anticonceptivos.controller.js';

const router = express.Router();

// Validaciones para crear anticonceptivo
const validarCrearAnticonceptivo = [
  body('pacienteId').isInt().withMessage('El ID del paciente debe ser un número entero'),
  body('fum').optional().isDate().withMessage('La FUM debe ser una fecha válida'),
  body('tipoAnticonceptivo').isString().withMessage('El tipo de anticonceptivo debe ser texto'),
  body('fechaAplicacion').isDate().withMessage('La fecha de aplicación debe ser una fecha válida'),
  body('proximaRenovacion').optional().isDate().withMessage('La próxima renovación debe ser una fecha válida'),
  body('estado').optional().isIn(['ACTIVO', 'SUSPENDIDO', 'FINALIZADO']).withMessage('Estado no válido'),
  body('observaciones').isString().withMessage('Las observaciones son requeridas')
];

// Validaciones para actualizar anticonceptivo
const validarActualizarAnticonceptivo = [
  param('id').isInt().withMessage('El ID debe ser un número entero'),
  body('fum').optional().isDate().withMessage('La FUM debe ser una fecha válida'),
  body('tipoAnticonceptivo').optional().isString().withMessage('El tipo de anticonceptivo debe ser texto'),
  body('fechaAplicacion').optional().isDate().withMessage('La fecha de aplicación debe ser una fecha válida'),
  body('proximaRenovacion').optional().isDate().withMessage('La próxima renovación debe ser una fecha válida'),
  body('estado').optional().isIn(['ACTIVO', 'SUSPENDIDO', 'FINALIZADO']).withMessage('Estado no válido'),
  body('observaciones').optional().isString().withMessage('Las observaciones deben ser texto')
];

// Rutas
router.post('/', validarCrearAnticonceptivo, crearAnticonceptivoHandler);
router.get('/paciente/:pacienteId', obtenerAnticonceptivosPacienteHandler);
router.get('/activos/:pacienteId', obtenerAnticonceptivosActivosHandler);
router.get('/:id', obtenerAnticonceptivoHandler);
router.put('/:id', validarActualizarAnticonceptivo, actualizarAnticonceptivoHandler);
router.patch('/:id/estado', [
  param('id').isInt().withMessage('El ID debe ser un número entero'),
  body('estado').isIn(['ACTIVO', 'SUSPENDIDO', 'FINALIZADO']).withMessage('Estado no válido')
], cambiarEstadoAnticonceptivoHandler);
router.delete('/:id', eliminarAnticonceptivoHandler);

export default router;