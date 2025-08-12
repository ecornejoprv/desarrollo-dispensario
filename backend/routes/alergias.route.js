import { Router } from 'express';
import alergiaController from '../controllers/alergias.controller.js';

const router = Router();

// Crear nueva alergia
router.post('/', alergiaController.create);

// Obtener alergias por paciente
router.get('/paciente/:pacienteId', alergiaController.getByPaciente);

// Actualizar alergia
router.put('/:id', alergiaController.update);

// Eliminar alergia (borrado lógico)
router.delete('/:id', alergiaController.delete);

export default router;