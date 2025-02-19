import express from "express";
import {
  obtenerPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
} from "../controllers/pacientes.controller.js";

const router = express.Router();

// Rutas para pacientes
router.get("/pacientes", obtenerPacientes);
router.get("/pacientes/:id", obtenerPaciente);
router.post("/pacientes", crearPaciente);
router.put("/pacientes/:id", actualizarPaciente);
router.delete("/pacientes/:id", eliminarPaciente);

export default router;