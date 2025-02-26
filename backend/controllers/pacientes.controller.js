import {
    getAllPacientes,
    getPacienteById,
    createPaciente,
    updatePaciente,
    deletePaciente,
    getAllTiposPacientes,
    getAllZonas,
  getAllSexos,
  getAllEstadosCiviles,
  getAllReligiones,
  getAllPaises,
  getAllEtnias,
  getAllOrientacionesSexuales,
  getAllGeneros,
  getAllLateralidades,
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

//Obtener todos los tipos de pacientes 
export const obtenerTiposPaciente = async (req, res) => {
  try {
    const tiposPacientes = await getAllTiposPacientes();
    res.status(200).json(tiposPacientes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los tipos de pacientes", error });
  }
};

  // Obtener todas las zonas
export const obtenerZonas = async (req, res) => {
    try {
      const zonas = await getAllZonas();
      res.status(200).json(zonas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las zonas", error });
    }
  };
  
  // Obtener todos los sexos
  export const obtenerSexos = async (req, res) => {
    try {
      const sexos = await getAllSexos();
      res.status(200).json(sexos);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los sexos", error });
    }
  };
  
  // Obtener todos los estados civiles
  export const obtenerEstadosCiviles = async (req, res) => {
    try {
      const estadosCiviles = await getAllEstadosCiviles();
      res.status(200).json(estadosCiviles);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los estados civiles", error });
    }
  };
  
  // Obtener todas las religiones
  export const obtenerReligiones = async (req, res) => {
    try {
      const religiones = await getAllReligiones();
      res.status(200).json(religiones);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las religiones", error });
    }
  };
  
  // Obtener todos los países
  export const obtenerPaises = async (req, res) => {
    try {
      const paises = await getAllPaises();
      res.status(200).json(paises);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los países", error });
    }
  };
  
  // Obtener todas las etnias
  export const obtenerEtnias = async (req, res) => {
    try {
      const etnias = await getAllEtnias();
      res.status(200).json(etnias);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las etnias", error });
    }
  };
  
  // Obtener todas las orientaciones sexuales
  export const obtenerOrientacionesSexuales = async (req, res) => {
    try {
      const orientacionesSexuales = await getAllOrientacionesSexuales();
      res.status(200).json(orientacionesSexuales);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las orientaciones sexuales", error });
    }
  };
  
  // Obtener todos los géneros
  export const obtenerGeneros = async (req, res) => {
    try {
      const generos = await getAllGeneros();
      res.status(200).json(generos);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los géneros", error });
    }
  };
  
  // Obtener todas las lateralidades
  export const obtenerLateralidades = async (req, res) => {
    try {
      const lateralidades = await getAllLateralidades();
      res.status(200).json(lateralidades);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener las lateralidades", error });
    }
  };