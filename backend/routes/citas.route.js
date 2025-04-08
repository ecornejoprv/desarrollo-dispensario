import express from 'express';
import {
  obtenerCitas,
  obtenerCitaPorId,
  crearCita,
  actualizarCita,
  eliminarCita,
  obtenerEspecialidades,
  obtenerSucursales,
  obtenerMedicos,
  obtenerMedicosEspecialidad,
  obtenerActividades,
  registrarActividadesAdmin,
  obtenerMedicoPorCodigo,
  actualizarEstadoCita,
  obtenerAtenciones,
  obtenerEstadisticasAtenciones,
} from '../controllers/citas.controller.js';

const router = express.Router();

// Rutas para las citas
router.get('/citas', obtenerCitas); // Obtener todas las citas
router.get('/citas/:id', obtenerCitaPorId); // Obtener una cita por su ID
router.post('/citas', crearCita); // Crear una nueva cita
router.put('/citas/:id', actualizarCita); // Actualizar una cita existente
router.delete('/citas/:id', eliminarCita); // Eliminar una cita
router.put('/citas/:id/estado', actualizarEstadoCita); // Nueva ruta para actualizar solo el estado

// Rutas para especialidades y lugares de atención
router.get('/especialidades', obtenerEspecialidades);
router.get('/lugares-atencion', obtenerSucursales);

// Rutas para médicos
router.get('/medicos', obtenerMedicos); // Obtener todos los médicos
router.get('/medicos/especialidad/:especialidadId', obtenerMedicosEspecialidad); // Obtener médicos por especialidad
router.get('/tiposactividades', obtenerActividades);
router.post('/actividades/registrar', registrarActividadesAdmin);
router.get('/medicos/:codigo', obtenerMedicoPorCodigo);
router.get('/atenciones', obtenerAtenciones);
router.get('/atenciones/estadisticas', obtenerEstadisticasAtenciones);
export default router;
