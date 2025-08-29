import {
    getCitas,
    getCitasAtendidas, 
    getCitaById,
    createCita,
    updateCita,
    deleteCita,
    getAllEspecialidades,
    getAllLugaresAtencion,
    getEspecialidadesPorSucursal, // Nueva importación
    getAllMedicos,
    getMedicosPorEspecialidad,
    getActividadesByTipo,
    registrarActividadesPost,
    getMedicoByUsername,
    updateEstadoCita,
    getMedicoByCodigo,
    getEstadisticasAtenciones, // Reporte dmpost
    getAtenciones, // Reporte dmpost
    getEnfermeriaStaff,
} from '../models/citas.model.js';
import { getPacienteById } from '../models/pacientes.model.js'; // Necesario para validar paciente en el controlador

export const actualizarEstadoCita = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const { userCompanies } = req; // Obtener empresas del usuario

    try {
        // Se pasa userCompanies al modelo para que la validación de acceso se haga allí.
        const citaActualizada = await updateEstadoCita(id, estado, userCompanies); // Pasar userCompanies
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
        console.error('Error al actualizar estado de cita en controller:', error.message);
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
        const { userCompanies } = req;
        // Se obtiene el locationId de los query params de la URL
        const { locationId } = req.query; 

        // Se pasan ambos filtros al modelo
        const citas = await getCitas(userCompanies, locationId);
        res.status(200).json(citas);
    } catch (error) {
        console.error('Error al obtener citas en controller:', error.message);
        res.status(500).json({ success: false, message: 'Error al obtener las citas' });
    }
};

export const obtenerCitasAtendidas = async (req, res) => {
    try {
        const { userCompanies } = req; // Empresas permitidas para el usuario.
        const { locationId } = req.query; // Ubicación de trabajo activa.

        // Llama a la nueva función del modelo que filtra por estado 'AT'.
        const citas = await getCitasAtendidas(userCompanies, locationId);
        
        // Devuelve las citas encontradas.
        res.status(200).json(citas);
    } catch (error) {
        // Manejo de errores estándar.
        console.error('Error al obtener citas atendidas en controller:', error.message);
        res.status(500).json({ success: false, message: 'Error al obtener las citas atendidas' });
    }
};

// Obtener una cita por su ID
export const obtenerCitaPorId = async (req, res) => {
    const { id } = req.params;
    const { userCompanies } = req; // Obtener empresas del usuario

    try {
        const cita = await getCitaById(id, userCompanies); // Pasar userCompanies al modelo
        if (cita) {
            res.status(200).json({
                success: true,
                data: cita
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Cita no encontrada o no tiene acceso a ella.'
            });
        }
    } catch (error) {
        console.error('Error al obtener la cita por ID en controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la cita',
            error: error.message
        });
    }
};

// Crear una nueva cita
export const crearCita = async (req, res) => {
    // Se extraen los datos de la nueva cita del cuerpo de la petición.
    const nuevaCita = req.body;
    // Se obtiene el array de empresas del contexto activo.
    const { userCompanies } = req;
    // --- CAMBIO CLAVE: Se obtiene el ID del usuario que está realizando la acción ---
    const creatorUserId = req.user.usua_cod_usua;

    try {
        // La validación de permiso para el paciente no cambia.
        const pacienteExistente = await getPacienteById(nuevaCita.cita_cod_pacie, userCompanies);
        if (!pacienteExistente) {
            return res.status(403).json({
                success: false,
                message: "No tiene permiso para agendar citas para este paciente o el paciente no existe."
            });
        }

        // Se pasa el ID del creador como un nuevo argumento a la función del modelo.
        const citaCreada = await createCita(nuevaCita, userCompanies, creatorUserId);
        
        res.status(201).json({
            success: true,
            data: citaCreada
        });
    } catch (error) {
        console.error('Error al crear la cita en controller:', error.message);
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
    const { userCompanies } = req; // Obtener empresas del usuario

    try {
        // Pasar userCompanies al modelo para que la validación de acceso y disponibilidad lo use
        const citaActualizada = await updateCita(id, datosActualizados, userCompanies); // Pasar userCompanies
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
        console.error('Error al actualizar la cita en controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la cita',
            error: error.message
        });
    }
};

// Eliminar una cita (marcar como 'CA' - Cancelada)
export const eliminarCita = async (req, res) => {
    const { id } = req.params;
    const { userCompanies } = req; // Obtener empresas del usuario

    try {
        // Pasar userCompanies al modelo para que valide el acceso antes de eliminar
        const citaEliminada = await deleteCita(id, userCompanies); // Pasar userCompanies
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
        console.error('Error al eliminar la cita en controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la cita',
            error: error.message
        });
    }
};

// Obtener todas las especialidades (datos maestros)
export const obtenerEspecialidades = async (req, res) => {
    try {
        const especialidades = await getAllEspecialidades();
        res.status(200).json({
            success: true,
            data: especialidades
        });
    } catch (error) {
        console.error('Error al obtener especialidades en controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las especialidades',
            error: error.message
        });
    }
};

// Obtener todas las sucursales (datos maestros)
export const obtenerSucursales = async (req, res) => {
    try {
        // Obtenemos el array de empresas permitidas que nuestro middleware 'protect' ya adjuntó al request.
        const userCompanies = req.userCompanies;

        // Pasamos los permisos de la empresa al modelo para que realice el filtrado.
        const lugares = await getAllLugaresAtencion(userCompanies);
        
        res.status(200).json({
            success: true,
            data: lugares
        });
    } catch (error) {
        console.error('Error al obtener sucursales en controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las sucursales',
            error: error.message
        });
    }
};

// Nueva función: Obtener especialidades por sucursal
export const obtenerEspecialidadesPorSucursal = async (req, res) => {
    const { sucursalId } = req.params;

    if (!sucursalId) {
        return res.status(400).json({
            success: false,
            message: "El ID de la sucursal es requerido."
        });
    }

    try {
        const especialidades = await getEspecialidadesPorSucursal(parseInt(sucursalId));
        res.status(200).json({
            success: true,
            data: especialidades
        });
    } catch (error) {
        console.error('Error al obtener especialidades por sucursal en controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener especialidades por sucursal',
            error: error.message
        });
    }
};

// Obtener todos los médicos activos (datos maestros)
export const obtenerMedicos = async (req, res) => {
    try {
        const medicos = await getAllMedicos();
        res.status(200).json({
            success: true,
            data: medicos
        });
    } catch (error) {
        console.error('Error al obtener médicos en controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los médicos',
            error: error.message
        });
    }
};

// Obtener médicos por especialidad (datos maestros)
export const obtenerMedicosEspecialidad = async (req, res) => {
    // Ahora obtenemos ambos IDs desde los parámetros de la URL.
    const { especialidadId, sucursalId } = req.params;

    if (!especialidadId || !sucursalId) {
        return res.status(400).json({
            success: false,
            message: "Se requieren los IDs de la especialidad y de la sucursal."
        });
    }

    try {
        // Pasamos ambos IDs a la función del modelo actualizada.
        const medicos = await getMedicosPorEspecialidad(especialidadId, sucursalId);
        res.status(200).json({
            success: true,
            data: medicos
        });
    } catch (error) {
        console.error('Error al obtener médicos por especialidad en controller:', error.message);
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

        let tipos = [];
        if (typeof tipo === 'string') {
            tipos = tipo.replace(/[()]/g, '').split(',').map(t => t.trim()).filter(t => t);
        } else if (Array.isArray(tipo)) {
            tipos = tipo;
        } else {
            return res.status(400).json({
                success: false,
                error: "El parámetro 'tipo' debe ser una cadena o un array"
            });
        }

        if (tipos.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Debe proporcionar al menos un tipo de actividad válido"
            });
        }

        const tiposPermitidos = ['POSTCONSULTA', 'ADMINISTRATIVAS', 'OTRO_TIPO']; // Ajusta según tus necesidades
        const tiposInvalidos = tipos.filter(t => !tiposPermitidos.includes(t));

        if (tiposInvalidos.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Tipos no permitidos: ${tiposInvalidos.join(', ')}`
            });
        }

        const actividades = await getActividadesByTipo(tipos);

        res.status(200).json({
            success: true,
            data: actividades
        });
    } catch (error) {
        console.error('Error al obtener actividades en controller:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Error al obtener las actividades"
        });
    }
};

// Registrar actividades administrativas
export const registrarActividadesAdmin = async (req, res) => {
    try {
        const { actividades, medicoId, citaId, pacienteId, observaciones = '' } = req.body;
        const { userCompanies } = req; // Obtener empresas del usuario

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

        const resultado = await registrarActividadesPost(
            medicoId,
            actividades,
            citaId,
            pacienteId,
            observaciones,
            userCompanies // Pasa userCompanies aquí
        );

        res.status(200).json(resultado);

    } catch (error) {
        console.error('Error en registrarActividadesAdmin en controller:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Error interno al registrar actividades"
        });
    }
};

// Obtener médico por su código (datos maestros)
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
        console.error('Error al obtener médico por código en controller:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el médico',
            error: error.message
        });
    }
};

// Obtener atenciones (dmpost)
export const obtenerAtenciones = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta, medicoId, pacienteId, tipoActividad } = req.query;
        const { userCompanies } = req; // Obtener empresas del usuario

        const filters = {
            fechaDesde: fechaDesde || null,
            fechaHasta: fechaHasta || null,
            medicoId: medicoId ? parseInt(medicoId) : null,
            pacienteId: pacienteId ? parseInt(pacienteId) : null,
            tipoActividad: tipoActividad || 'ATENCION'
        };

        if (filters.fechaDesde && filters.fechaHasta && filters.fechaDesde > filters.fechaHasta) {
            return res.status(400).json({
                success: false,
                message: 'La fecha desde no puede ser mayor que la fecha hasta'
            });
        }

        const atenciones = await getAtenciones(filters, userCompanies); // Pasa userCompanies aquí

        res.status(200).json({
            success: true,
            data: atenciones,
            count: atenciones.length,
            filters: filters
        });
    } catch (error) {
        console.error('Error en obtenerAtenciones en controller:', error.message);
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
        const { userCompanies } = req; // Obtener empresas del usuario

        const filters = {
            fechaDesde: fechaDesde || null,
            fechaHasta: fechaHasta || null,
            medicoId: medicoId ? parseInt(medicoId) : null
        };

        if (filters.fechaDesde && filters.fechaHasta && filters.fechaDesde > filters.fechaHasta) {
            return res.status(400).json({
                success: false,
                message: 'La fecha desde no puede ser mayor que la fecha hasta'
            });
        }

        const estadisticas = await getEstadisticasAtenciones(filters, userCompanies); // Pasa userCompanies aquí

        res.status(200).json({
            success: true,
            data: estadisticas,
            filters: filters
        });
    } catch (error) {
        console.error('Error en obtenerEstadisticasAtenciones en controller:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener estadísticas',
            error: error.message
        });
    }
};


export const obtenerEnfermeriaStaff = async (req, res) => {
  try {
    const { userCompanies } = req;
    const staff = await getEnfermeriaStaff(userCompanies);
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener personal de enfermería' });
  }
};