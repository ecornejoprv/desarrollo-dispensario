import {
    getAllPacientes,
    getPacienteById,
    createPaciente,
    updatePaciente,
    deletePaciente,
  } from "../models/pacientes.model.js";
  
  // Obtener todos los pacientes
  export const obtenerPacientes = async (req, res) => {
    try {
      const { search = "", page = 1, limit = 10 } = req.query; // Obtener parámetros de la consulta
      const { pacientes, total } = await getAllPacientes(search, parseInt(page), parseInt(limit));
  
      res.status(200).json({
        pacientes,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit), // Calcular el total de páginas
      });
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los pacientes", error });
    }
  };
  
  // Obtener un paciente por ID
  export const obtenerPaciente = async (req, res) => {
    try {
      const { id } = req.params;
      const paciente = await getPacienteById(id);
      if (!paciente) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
      res.status(200).json(paciente);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el paciente", error });
    }
  };
  
  // Crear un nuevo paciente
  export const crearPaciente = async (req, res) => {
    try {
      const nuevoPaciente = await createPaciente(req.body);
      res.status(201).json(nuevoPaciente);
    } catch (error) {
      res.status(500).json({ message: "Error al crear el paciente", error });
    }
  };
  
  // Actualizar un paciente
  export const actualizarPaciente = async (req, res) => {
    try {
      const { id } = req.params;
      const pacienteActualizado = await updatePaciente(id, req.body);
      if (!pacienteActualizado) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
      res.status(200).json(pacienteActualizado);
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el paciente", error });
    }
  };
  
  // Eliminar un paciente (cambiar estado a 'I')
  export const eliminarPaciente = async (req, res) => {
    try {
      const { id } = req.params;
      const pacienteEliminado = await deletePaciente(id);
      if (!pacienteEliminado) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
      res.status(200).json(pacienteEliminado);
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el paciente", error });
    }
  };