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
} from "../controllers/pacientes.controller.js";

const router = express.Router();

// Rutas para pacientes
router.get("/pacientes", obtenerPacientes);
router.get("/pacientes/:id", obtenerPaciente);
router.post("/pacientes", crearPaciente);
router.put("/pacientes/:id", actualizarPaciente);
router.delete("/pacientes/:id", eliminarPaciente);

// Rutas para datos relacionados
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

export default router;