import {
    crearAntecedentePersonal,
    obtenerAntecedentesPersonales,
    crearAntecedenteGineco,
    obtenerAntecedentesGineco,
    crearAntecedenteTrabajo,
    obtenerAntecedentesTrabajo,
    crearHistorialToxico,
    obtenerHistorialToxico,
    crearAccidenteEnfermedad,
    obtenerAccidentesEnfermedades,
    crearActividadExtralaboral,
    obtenerActividadesExtralaborales
  } from '../models/antecedentes.model.js';
  
  // Antecedentes Personales
  export const crearAntecedentePersonalController = async (req, res) => {
    const { pacienteId, observacion } = req.body;
  
    if (!pacienteId || !observacion) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
  
    try {
      const antecedente = await crearAntecedentePersonal(pacienteId, observacion);
      res.status(201).json(antecedente);
    } catch (error) {
      res.status(500).json({ error: "Error al crear antecedente personal: " + error.message });
    }
  };
  
  export const obtenerAntecedentesPersonalesController = async (req, res) => {
    const { pacienteId } = req.params;
  
    if (!pacienteId) {
      return res.status(400).json({ error: "Se requiere el ID del paciente" });
    }
  
    try {
      const antecedentes = await obtenerAntecedentesPersonales(pacienteId);
      res.status(200).json(antecedentes);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener antecedentes personales: " + error.message });
    }
  };
  
  // Antecedentes Gineco-Obstétricos
  export const crearAntecedenteGinecoController = async (req, res) => {
    try {
      const antecedente = await crearAntecedenteGineco(req.body);
      res.status(201).json(antecedente);
    } catch (error) {
      res.status(500).json({ error: "Error al crear antecedente gineco-obstétrico: " + error.message });
    }
  };
  
  export const obtenerAntecedentesGinecoController = async (req, res) => {
    const { pacienteId } = req.params;
  
    if (!pacienteId) {
      return res.status(400).json({ error: "Se requiere el ID del paciente" });
    }
  
    try {
      const antecedentes = await obtenerAntecedentesGineco(pacienteId);
      res.status(200).json(antecedentes);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener antecedentes gineco-obstétricos: " + error.message });
    }
  };
  
  // Antecedentes de Trabajo
  export const crearAntecedenteTrabajoController = async (req, res) => {
    try {
      const antecedente = await crearAntecedenteTrabajo(req.body);
      res.status(201).json(antecedente);
    } catch (error) {
      res.status(500).json({ error: "Error al crear antecedente de trabajo: " + error.message });
    }
  };
  
  export const obtenerAntecedentesTrabajoController = async (req, res) => {
    const { pacienteId } = req.params;
  
    if (!pacienteId) {
      return res.status(400).json({ error: "Se requiere el ID del paciente" });
    }
  
    try {
      const antecedentes = await obtenerAntecedentesTrabajo(pacienteId);
      res.status(200).json(antecedentes);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener antecedentes de trabajo: " + error.message });
    }
  };
  
  // Historial Tóxico y Estilo de Vida
  export const crearHistorialToxicoController = async (req, res) => {
    try {
      const historial = await crearHistorialToxico(req.body);
      res.status(201).json(historial);
    } catch (error) {
      res.status(500).json({ error: "Error al crear historial tóxico: " + error.message });
    }
  };
  
  export const obtenerHistorialToxicoController = async (req, res) => {
    const { pacienteId } = req.params;
  
    if (!pacienteId) {
      return res.status(400).json({ error: "Se requiere el ID del paciente" });
    }
  
    try {
      const historiales = await obtenerHistorialToxico(pacienteId);
      res.status(200).json(historiales);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener historial tóxico: " + error.message });
    }
  };
  
  // Accidentes y Enfermedades
  export const crearAccidenteEnfermedadController = async (req, res) => {
    try {
      const registro = await crearAccidenteEnfermedad(req.body);
      res.status(201).json(registro);
    } catch (error) {
      res.status(500).json({ error: "Error al crear registro de accidente/enfermedad: " + error.message });
    }
  };
  
  export const obtenerAccidentesEnfermedadesController = async (req, res) => {
    const { pacienteId } = req.params;
  
    if (!pacienteId) {
      return res.status(400).json({ error: "Se requiere el ID del paciente" });
    }
  
    try {
      const registros = await obtenerAccidentesEnfermedades(pacienteId);
      res.status(200).json(registros);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener accidentes/enfermedades: " + error.message });
    }
  };
  
  // Actividades Extralaborales
  export const crearActividadExtralaboralController = async (req, res) => {
    try {
      const actividad = await crearActividadExtralaboral(req.body);
      res.status(201).json(actividad);
    } catch (error) {
      res.status(500).json({ error: "Error al crear actividad extralaboral: " + error.message });
    }
  };
  
  export const obtenerActividadesExtralaboralesController = async (req, res) => {
    const { pacienteId } = req.params;
  
    if (!pacienteId) {
      return res.status(400).json({ error: "Se requiere el ID del paciente" });
    }
  
    try {
      const actividades = await obtenerActividadesExtralaborales(pacienteId);
      res.status(200).json(actividades);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener actividades extralaborales: " + error.message });
    }
  };