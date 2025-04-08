import {
  getCitas,
  getCitaById,
  createCita,
  updateCita,
  deleteCita,
  getAllEspecialidades,
  getAllLugaresAtencion,
  getAllMedicos,
  getMedicosPorEspecialidad,
  getActividadesByTipo,
  registrarActividadesPost,
  getMedicoByUsername,
  updateEstadoCita,
  getMedicoByCodigo,
  getEstadisticasAtenciones,
  getAtenciones,
} from '../models/citas.model.js';


export const actualizarEstadoCita = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  try {
    const citaActualizada = await updateEstadoCita(id, estado);
    if (citaActualizada) {
      res.status(200).json({ 
        success: true,
        data: citaActualizada 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada' 
      });
    }
  } catch (error) {
    console.error('Error al actualizar estado de cita:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar estado de cita',
      error: error.message 
    });
  }
};

// Obtener todas las citas
export const obtenerCitas = async (req, res) => {
  try {
    const citas = await getCitas();
    res.status(200).json(citas);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener las citas',
      error: error.message 
    });
  }
};

// Obtener una cita por su ID
export const obtenerCitaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const cita = await getCitaById(id);
    if (cita) {
      res.status(200).json({ 
        success: true,
        data: cita 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada' 
      });
    }
  } catch (error) {
    console.error('Error al obtener la cita:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener la cita',
      error: error.message 
    });
  }
};

// Crear una nueva cita
export const crearCita = async (req, res) => {
  const nuevaCita = req.body;
  try {
    const citaCreada = await createCita(nuevaCita);
    res.status(201).json({ 
      success: true,
      data: citaCreada 
    });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear la cita',
      error: error.message 
    });
  }
};

// Actualizar una cita existente
export const actualizarCita = async (req, res) => {
  const { id } = req.params;
  const datosActualizados = req.body;
  try {
    const citaActualizada = await updateCita(id, datosActualizados);
    if (citaActualizada) {
      res.status(200).json({ 
        success: true,
        data: citaActualizada 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada' 
      });
    }
  } catch (error) {
    console.error('Error al actualizar la cita:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar la cita',
      error: error.message 
    });
  }
};

// Eliminar una cita
export const eliminarCita = async (req, res) => {
  const { id } = req.params;
  try {
    const citaEliminada = await deleteCita(id);
    if (citaEliminada) {
      res.status(200).json({ 
        success: true,
        message: 'Cita eliminada correctamente' 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada' 
      });
    }
  } catch (error) {
    console.error('Error al eliminar la cita:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar la cita',
      error: error.message 
    });
  }
};

// Obtener todas las especialidades
export const obtenerEspecialidades = async (req, res) => {
  try {
    const especialidades = await getAllEspecialidades();
    res.status(200).json({ 
      success: true,
      data: especialidades 
    });
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener las especialidades',
      error: error.message 
    });
  }
};

// Obtener todas las sucursales
export const obtenerSucursales = async (req, res) => {
  try {
    const lugares = await getAllLugaresAtencion();
    res.status(200).json({ 
      success: true,
      data: lugares 
    });
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener las sucursales',
      error: error.message 
    });
  }
};

// Obtener todos los médicos activos
export const obtenerMedicos = async (req, res) => {
  try {
    const medicos = await getAllMedicos();
    res.status(200).json({ 
      success: true,
      data: medicos 
    });
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener los médicos',
      error: error.message 
    });
  }
};

// Obtener médicos por especialidad
export const obtenerMedicosEspecialidad = async (req, res) => {
  const { especialidadId } = req.params;

  if (!especialidadId) {
    return res.status(400).json({ 
      success: false,
      message: "El ID de la especialidad es requerido." 
    });
  }

  try {
    const medicos = await getMedicosPorEspecialidad(especialidadId);
    res.status(200).json({ 
      success: true,
      data: medicos 
    });
  } catch (error) {
    console.error('Error al obtener médicos por especialidad:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener los médicos por especialidad',
      error: error.message 
    });
  }
};

// Obtener actividades por tipo
export const obtenerActividades = async (req, res) => {
  try {
    const { tipo } = req.query;
    
    if (!tipo) {
      return res.status(400).json({ 
        success: false,
        error: "El parámetro 'tipo' es requerido" 
      });
    }
    
    const actividades = await getActividadesByTipo(tipo);
    res.status(200).json({ 
      success: true,
      data: actividades 
    });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Error al obtener las actividades" 
    });
  }
};

// Registrar actividades administrativas
export const registrarActividadesAdmin = async (req, res) => {
  try {
    const { actividades, medicoId, fecha } = req.body;

    // Validaciones
    if (!Array.isArray(actividades)) {
      return res.status(400).json({ 
        success: false, 
        error: "El formato de actividades es inválido" 
      });
    }

    if (actividades.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Debe seleccionar al menos una actividad" 
      });
    }

    if (!medicoId) {
      return res.status(400).json({ 
        success: false, 
        error: "ID de médico es requerido" 
      });
    }

    // Registrar actividades
    const resultado = await registrarActividadesPost(
      medicoId,
      actividades, // Array de códigos de actividad
      null, // citaId (opcional)
      null  // pacienteId (opcional)
    );

    res.status(200).json(resultado);
    
  } catch (error) {
    console.error('Error en registrarActividadesAdmin:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Error interno al registrar actividades" 
    });
  }
};
// Obtener médico por su código
export const obtenerMedicoPorCodigo = async (req, res) => {
  const { codigo } = req.params;
  
  if (!codigo) {
    return res.status(400).json({ 
      success: false,
      message: "El código del médico es requerido" 
    });
  }

  try {
    const medico = await getMedicoByCodigo(codigo);
    if (medico) {
      res.status(200).json({ 
        success: true,
        data: medico 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Médico no encontrado' 
      });
    }
  } catch (error) {
    console.error('Error al obtener médico por código:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener el médico',
      error: error.message 
    });
  }
};
export const obtenerAtenciones = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, medicoId, pacienteId, tipoActividad } = req.query;
    
    // Validar y parsear parámetros
    const filters = {
      fechaDesde: fechaDesde || null,
      fechaHasta: fechaHasta || null,
      medicoId: medicoId ? parseInt(medicoId) : null,
      pacienteId: pacienteId ? parseInt(pacienteId) : null,
      tipoActividad: tipoActividad || 'ATENCION'
    };

    // Validar fechas
    if (filters.fechaDesde && filters.fechaHasta && filters.fechaDesde > filters.fechaHasta) {
      return res.status(400).json({
        success: false,
        message: 'La fecha desde no puede ser mayor que la fecha hasta'
      });
    }

    const atenciones = await getAtenciones(filters);
    
    res.status(200).json({
      success: true,
      data: atenciones,
      count: atenciones.length,
      filters: filters // Opcional: devolver los filtros aplicados
    });
  } catch (error) {
    console.error('Error en obtenerAtenciones:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener las atenciones',
      error: error.message
    });
  }
};

export const obtenerEstadisticasAtenciones = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, medicoId } = req.query;
    
    const filters = {
      fechaDesde: fechaDesde || null,
      fechaHasta: fechaHasta || null,
      medicoId: medicoId ? parseInt(medicoId) : null
    };

    // Validar fechas
    if (filters.fechaDesde && filters.fechaHasta && filters.fechaDesde > filters.fechaHasta) {
      return res.status(400).json({
        success: false,
        message: 'La fecha desde no puede ser mayor que la fecha hasta'
      });
    }

    const estadisticas = await getEstadisticasAtenciones(filters);
    
    res.status(200).json({
      success: true,
      data: estadisticas,
      filters: filters // Opcional: devolver los filtros aplicados
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticasAtenciones:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener estadísticas',
      error: error.message
    });
  }
};