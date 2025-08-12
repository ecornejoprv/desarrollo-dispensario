// controllers/alergias.controller.js (Código Absolutamente Completo y Corregido)
// ==============================================================================
// @summary: Se refactorizan los controladores create, update y delete para que
//           obtengan el ID del usuario desde 'req.user.usua_cod_usua' (inyectado
//           por el middleware 'protect') en lugar de 'req.body'. Esto aumenta la
//           seguridad y la fiabilidad del sistema.
// ==============================================================================

import Alergia from '../models/alergias.model.js';

const alergiaController = {
  // Crear nueva alergia
  async create(req, res) {
    try {
      // Se obtiene el ID del usuario que está realizando la acción desde el token.
      const userId = req.user.usua_cod_usua;
      const nuevaAlergia = await Alergia.create(req.body, userId);
      res.status(201).json(nuevaAlergia);
    } catch (error) {
      console.error('Error al crear alergia:', error);
      res.status(500).json({ error: 'Error al crear alergia', details: error.message });
    }
  },

  // Obtener alergias por paciente
  async getByPaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      if (!pacienteId) {
        return res.status(400).json({ error: 'ID de paciente es requerido' });
      }
      const alergias = await Alergia.findByPaciente(pacienteId);
      res.json(alergias);
    } catch (error) {
      console.error('Error al obtener alergias:', error);
      res.status(500).json({ error: 'Error al obtener alergias', details: error.message });
    }
  },

  // Actualizar alergia
  async update(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'ID de alergia es requerido' });
      }
      // Se obtiene el ID del usuario que está realizando la acción.
      const userId = req.user.usua_cod_usua;
      const alergiaActualizada = await Alergia.update(id, req.body, userId);
      if (!alergiaActualizada) {
        return res.status(404).json({ error: 'Alergia no encontrada' });
      }
      res.json(alergiaActualizada);
    } catch (error) {
      console.error('Error al actualizar alergia:', error);
      res.status(500).json({ error: 'Error al actualizar alergia', details: error.message });
    }
  },

  // Eliminar alergia (borrado lógico)
  async delete(req, res) {
    try {
      const { id } = req.params;
      // CORRECCIÓN: Se obtiene el ID del usuario desde req.user, no de req.body.
      const userId = req.user.usua_cod_usua;
      
      if (!id) {
        return res.status(400).json({ error: 'ID de alergia es requerido' });
      }
      
      const alergiaEliminada = await Alergia.remove(id, userId);
      
      if (!alergiaEliminada) {
        return res.status(404).json({ error: 'Alergia no encontrada' });
      }
      
      res.json({ message: 'Alergia marcada como inactiva correctamente', data: alergiaEliminada });
    } catch (error) {
      console.error('Error al eliminar alergia:', error);
      res.status(500).json({ error: 'Error al eliminar alergia', details: error.message });
    }
  }
};

export default alergiaController;