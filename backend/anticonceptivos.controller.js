import {
    crearAnticonceptivo,
    obtenerAnticonceptivosPorPaciente,
    actualizarAnticonceptivo,
    eliminarAnticonceptivo,
    obtenerAnticonceptivoPorId,
    obtenerAnticonceptivosActivos,
    obtenerHistorialAnticonceptivos,
    cambiarEstadoAnticonceptivo
  } from '../models/anticonceptivos.model.js';
  
  import { validationResult } from 'express-validator';
  
  export const crearAnticonceptivoHandler = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const nuevoAnticonceptivo = await crearAnticonceptivo(req.body);
      res.status(201).json({
        success: true,
        message: 'Anticonceptivo registrado correctamente',
        data: nuevoAnticonceptivo
      });
    } catch (error) {
      console.error('Error al crear anticonceptivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar el anticonceptivo',
        error: error.message
      });
    }
  };
  
  export const obtenerAnticonceptivosPacienteHandler = async (req, res) => {
    try {
      const { pacienteId } = req.params;
      const anticonceptivos = await obtenerAnticonceptivosPorPaciente(pacienteId);
      res.status(200).json({
        success: true,
        data: anticonceptivos
      });
    } catch (error) {
      console.error('Error al obtener anticonceptivos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los anticonceptivos',
        error: error.message
      });
    }
  };
  
  export const actualizarAnticonceptivoHandler = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { id } = req.params;
      const anticonceptivoActualizado = await actualizarAnticonceptivo(id, req.body);
      
      if (!anticonceptivoActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Anticonceptivo no encontrado'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Anticonceptivo actualizado correctamente',
        data: anticonceptivoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar anticonceptivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el anticonceptivo',
        error: error.message
      });
    }
  };
  
  export const eliminarAnticonceptivoHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const anticonceptivoEliminado = await eliminarAnticonceptivo(id);
      
      if (!anticonceptivoEliminado) {
        return res.status(404).json({
          success: false,
          message: 'Anticonceptivo no encontrado'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Anticonceptivo eliminado correctamente',
        data: anticonceptivoEliminado
      });
    } catch (error) {
      console.error('Error al eliminar anticonceptivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el anticonceptivo',
        error: error.message
      });
    }
  };
  
  export const obtenerAnticonceptivoHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const anticonceptivo = await obtenerAnticonceptivoPorId(id);
      
      if (!anticonceptivo) {
        return res.status(404).json({
          success: false,
          message: 'Anticonceptivo no encontrado'
        });
      }
  
      res.status(200).json({
        success: true,
        data: anticonceptivo
      });
    } catch (error) {
      console.error('Error al obtener anticonceptivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el anticonceptivo',
        error: error.message
      });
    }
  };
  
  export const obtenerAnticonceptivosActivosHandler = async (req, res) => {
    try {
      const { pacienteId } = req.params;
      const anticonceptivos = await obtenerAnticonceptivosActivos(pacienteId);
      res.status(200).json({
        success: true,
        data: anticonceptivos
      });
    } catch (error) {
      console.error('Error al obtener anticonceptivos activos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los anticonceptivos activos',
        error: error.message
      });
    }
  };
  
  export const cambiarEstadoAnticonceptivoHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      const anticonceptivoActualizado = await cambiarEstadoAnticonceptivo(id, estado);
      
      if (!anticonceptivoActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Anticonceptivo no encontrado'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Estado del anticonceptivo actualizado',
        data: anticonceptivoActualizado
      });
    } catch (error) {
      console.error('Error al cambiar estado del anticonceptivo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al cambiar el estado del anticonceptivo',
        error: error.message
      });
    }
  };