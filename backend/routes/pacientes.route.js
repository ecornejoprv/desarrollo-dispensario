// routes/pacientes.route.js (Código Completo y Reordenado)
// ==============================================================================
// @summary: Se reordenan las rutas para que las rutas específicas se declaren
//           antes que las rutas dinámicas (con parámetros como /:id) para evitar
//           conflictos de enrutamiento.
// ==============================================================================

import express from "express";
import {
    obtenerPacientes,
    obtenerPaciente,
    crearPaciente,
    actualizarPaciente,
    eliminarPaciente,
    obtenerTiposPaciente,
    obtenerZonas,
    obtenerSexos,
    obtenerEstadosCiviles,
    obtenerReligiones,
    obtenerPaises,
    obtenerEtnias,
    obtenerOrientacionesSexuales,
    obtenerGeneros,
    obtenerLateralidades,
    obtenerInstrucciones,
    obtenerTiposSangre,
    obtenerEmpresas,
    obtenerDiscapacidades,
    verificarCedula
} from "../controllers/pacientes.controller.js";

const router = express.Router();

// --- 1. RUTAS ESPECÍFICAS (Se definen primero) ---
// Estas son las rutas que tienen nombres fijos.
router.get("/tipos-pacientes", obtenerTiposPaciente);
router.get("/zonas", obtenerZonas);
router.get("/sexos", obtenerSexos);
router.get("/estados-civiles", obtenerEstadosCiviles);
router.get("/religiones", obtenerReligiones);
router.get("/paises", obtenerPaises);
router.get("/etnias", obtenerEtnias);
router.get("/orientaciones-sexuales", obtenerOrientacionesSexuales);
router.get("/generos", obtenerGeneros);
router.get("/lateralidades", obtenerLateralidades);
router.get("/instrucciones", obtenerInstrucciones);
router.get("/tipos-sangre", obtenerTiposSangre);
router.get("/empresas", obtenerEmpresas);
router.get("/tipos-discapacidad", obtenerDiscapacidades);
router.get('/verificar-cedula/:id?', verificarCedula);

// --- 2. RUTAS DINÁMICAS (Se definen al final) ---
// Estas rutas usan parámetros y son menos específicas, por lo que van al último.
// La ruta para obtener todos los pacientes y para crear uno nuevo.
router.get("/", obtenerPacientes);
router.post("/", crearPaciente);

// Rutas que operan sobre un paciente específico usando su ID.
router.get("/:id", obtenerPaciente);
router.put("/:id", actualizarPaciente);
router.delete("/:id", eliminarPaciente);

export default router;