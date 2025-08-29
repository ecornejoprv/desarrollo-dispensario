// ==============================================================================
// @summary: Rutas para el módulo de Atenciones.
// @version: 2.0.0
// @description: Se corrige el orden de las rutas para asegurar que las rutas
//               específicas (como '/reporte-enfermeria') se procesen antes que
//               las rutas dinámicas con parámetros (como '/:atencionId').
//               Esto soluciona el error 400 Bad Request.
// ==============================================================================

// --- 1. IMPORTACIONES ---
// Se importa el constructor de Router desde Express.
import { Router } from 'express';
// Se importan todas las funciones de controlador necesarias.
import {
  obtenerAtencionesPorPaciente,
  obtenerAtencionPorId,
  obtenerAtencionesPorPacienteYEspecialidad,
  validarCitaYMostrarPaciente,
  registrarAtencionController,
  asignarNumeroRecetaController,
  obtenerCitasPendientesPorMedico,
  obtenerAtencionesPorMedicoYFechas,
  obtenerAtencionesPorFechas,
  obtenerPreventivaPorAtencion,
  obtenerVigilanciasPorAtencion,
  obtenerMorbilidadPorAtencion,
  obtenerPrescripcionesPorAtencion,
  obtenerIndicacionesPorAtencion,
  obtenerSignosAlarmaPorAtencion,
  obtenerReferenciasPorAtencion,
  obtenerTriajePorAtencion,
  generarReporteEnfermeria, // Se importa el controlador del nuevo reporte
} from '../controllers/atencion.controller.js';
// Se importa el middleware para verificar el token de autenticación.
import { verifyToken } from '../middlewares/jwt.middleware.js';

// --- 2. INICIALIZACIÓN DEL ROUTER ---
// Se crea una nueva instancia del router de Express.
const router = Router();

// --- 3. DEFINICIÓN DE RUTAS (ORDEN CORREGIDO) ---
// El orden es crucial en Express: de la ruta más específica a la más genérica.

// --- SECCIÓN A: Rutas Específicas y Estáticas ---
// Estas rutas no contienen parámetros dinámicos en su primer segmento y deben ir primero.

// Ruta para el nuevo reporte de enfermería.
router.get('/reporte-enfermeria', verifyToken, generarReporteEnfermeria);

// Ruta para registrar una nueva atención.
router.post('/registrar-atencion', verifyToken, registrarAtencionController);

//Ruta para asignar un número de receta a una atención.
router.patch('/:atencionId/asignar-receta', verifyToken, asignarNumeroRecetaController);

// --- SECCIÓN B: Rutas con Parámetros de Identificación ---
// Estas rutas dependen de IDs específicos pero tienen una estructura clara.

// Ruta para obtener las citas pendientes de un médico específico.
router.get('/citas-pendientes/:medicoId', verifyToken, obtenerCitasPendientesPorMedico);

// Ruta para obtener atenciones de un médico en un rango de fechas.
router.get('/reporte-atenciones', verifyToken, obtenerAtencionesPorFechas);

// Ruta para validar la cita de un paciente.
router.get('/validar-cita/:pacienteId', verifyToken, validarCitaYMostrarPaciente);

// Ruta para obtener atenciones de un paciente en una especialidad concreta.
router.get('/paciente/:pacienteId/especialidad/:especialidad', verifyToken, obtenerAtencionesPorPacienteYEspecialidad);

// Ruta para obtener todas las atenciones de un paciente.
router.get('/paciente/:pacienteId', verifyToken, obtenerAtencionesPorPaciente);

// --- SECCIÓN C: Rutas Dinámicas Anidadas (deben ir antes de la más genérica) ---
// Todas estas rutas comienzan con un ID de atención, pero tienen un sub-segmento específico.

// Ruta para obtener los datos de preventiva de una atención.
router.get('/:atencionId/preventiva', verifyToken, obtenerPreventivaPorAtencion);

// Ruta para obtener las vigilancias de una atención.
router.get('/:atencionId/vigilancias', verifyToken, obtenerVigilanciasPorAtencion);

// Ruta para obtener la morbilidad de una atención.
router.get('/:atencionId/morbilidad', verifyToken, obtenerMorbilidadPorAtencion);

// Ruta para obtener las prescripciones de una atención.
router.get('/:atencionId/prescripciones', verifyToken, obtenerPrescripcionesPorAtencion);

// Ruta para obtener las indicaciones de una atención.
router.get('/:atencionId/indicaciones', verifyToken, obtenerIndicacionesPorAtencion);

// Ruta para obtener los signos de alarma de una atención.
router.get('/:atencionId/signos-alarma', verifyToken, obtenerSignosAlarmaPorAtencion);

// Ruta para obtener las referencias de una atención.
router.get('/:atencionId/referencias', verifyToken, obtenerReferenciasPorAtencion);

// Ruta para obtener el triaje de una atención.
router.get('/:atencionId/triaje', verifyToken, obtenerTriajePorAtencion);

// --- SECCIÓN D: Ruta Dinámica Más Genérica (DEBE IR AL FINAL) ---
// Esta ruta es la menos específica porque ':atencionId' puede ser cualquier valor.
// Al colocarla al final, damos oportunidad a que las rutas más específicas de arriba se procesen primero.
router.get('/:atencionId', verifyToken, obtenerAtencionPorId);


// --- 4. EXPORTACIÓN DEL ROUTER ---
// Se exporta el router configurado para ser usado en el archivo principal del servidor.
export default router;