// routes/citas.route.js (Código Completo y Corregido)

import express from 'express';
import {
    obtenerCitas,
    obtenerCitasAtendidas,
    obtenerCitaPorId,
    crearCita,
    actualizarCita,
    eliminarCita,
    obtenerEspecialidades,
    obtenerSucursales,
    obtenerEspecialidadesPorSucursal,
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

// --- 1. RUTAS ESPECÍFICAS (Se definen primero) ---
// Rutas para obtener datos maestros (listas para dropdowns)
router.get('/especialidades', obtenerEspecialidades);
router.get('/lugares-atencion', obtenerSucursales);
router.get('/lugares-atencion/:sucursalId/especialidades', obtenerEspecialidadesPorSucursal);
router.get('/medicos', obtenerMedicos);
//router.get('/medicos/especialidad/:especialidadId', obtenerMedicosEspecialidad);
router.get('/lugares-atencion/:sucursalId/especialidades/:especialidadId/medicos', obtenerMedicosEspecialidad);
router.get('/medicos/:codigo', obtenerMedicoPorCodigo);
router.get('/tiposactividades', obtenerActividades);
router.get('/atenciones', obtenerAtenciones);
router.get('/atenciones/estadisticas', obtenerEstadisticasAtenciones);

// Rutas para acciones específicas
router.post('/actividades/registrar', registrarActividadesAdmin);

// --- 2. RUTAS DINÁMICAS (Se definen al final) ---
// Rutas principales para el CRUD de Citas
router.get('/', obtenerCitas);
router.get('/citas-atendidas', obtenerCitasAtendidas);
router.post('/', crearCita);
router.get('/:id', obtenerCitaPorId);
router.put('/:id', actualizarCita);
router.delete('/:id', eliminarCita);

// Ruta específica para actualizar solo el estado de una cita
router.put('/:id/estado', actualizarEstadoCita);

export default router;