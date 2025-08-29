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
  getAllInstrucciones,
  getAllTiposSangre,
  getAllEmpresas,
  getAllDiscapacidades,
  verificarCedulaExistente,
} from "../models/pacientes.model.js";

// Obtener todos los pacientes
export const obtenerPacientes = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const userCompanies = req.userCompanies;

    //    console.log("DEBUG CONTROLLER (obtenerPacientes): userCompanies recibido:", userCompanies);
    //    console.log("DEBUG CONTROLLER (obtenerPacientes): Parámetros de búsqueda:", { search, page, limit });

    const { pacientes, total } = await getAllPacientes(
      search,
      parseInt(page),
      parseInt(limit),
      userCompanies
    );

    res.status(200).json({
      pacientes,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(
      "Error al obtener los pacientes en controller:",
      error.message
    );
    res.status(500).json({
      message: "Error al obtener los pacientes",
      error: error.message,
    });
  }
};

// Obtener un paciente por ID
export const obtenerPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanies = req.userCompanies;

    // console.log("DEBUG CONTROLLER (obtenerPaciente): ID de paciente:", id);
    // console.log(
    //   "DEBUG CONTROLLER (obtenerPaciente): userCompanies recibido:",
    //   userCompanies
    // );

    const paciente = await getPacienteById(id, userCompanies);
    if (!paciente) {
      return res
        .status(404)
        .json({ message: "Paciente no encontrado o no tiene acceso a él." });
    }
    res.status(200).json(paciente);
  } catch (error) {
    console.error("Error al obtener el paciente en controller:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener el paciente", error: error.message });
  }
};

// Crear un nuevo paciente
export const crearPaciente = async (req, res) => {
  // Se inicia un bloque try...catch para manejar cualquier error inesperado.
  try {
    // Se extraen los permisos de empresa del objeto 'req' (inyectado por el middleware 'protect').
    const userCompanies = req.userCompanies;
    
    // Se desestructuran los campos necesarios del cuerpo de la petición (req.body).
    let { pacie_cod_empr, pacie_ced_pacie, pacie_nom_pacie, pacie_ape_pacie } = req.body;

    // --- VALIDACIÓN Y PREPARACIÓN DE DATOS ---

    // 1. Se asegura que el código de la empresa sea un número para las validaciones.
    pacie_cod_empr = parseInt(pacie_cod_empr);

    // 2. Se verifica que los campos obligatorios no estén vacíos.
    if (!pacie_ced_pacie || !pacie_nom_pacie || !pacie_ape_pacie || !pacie_cod_empr) {
      // Si falta algún campo, se devuelve un error 400 (Bad Request) al cliente.
      return res.status(400).json({
        message: "Cédula, nombre, apellido y código de empresa son campos requeridos",
      });
    }

    // 3. Se verifica que el usuario tenga permiso para crear pacientes en la empresa seleccionada.
    if (!userCompanies || !userCompanies.includes(pacie_cod_empr)) {
      // Si no tiene permiso, se devuelve un error 403 (Forbidden).
      return res.status(403).json({
        message: "No tiene permiso para crear pacientes en la empresa especificada.",
      });
    }

    // 4. Se verifica que la cédula del nuevo paciente no exista ya en la base de datos.
    const cedulaExiste = await verificarCedulaExistente(pacie_ced_pacie);
    if (cedulaExiste) {
      // Si la cédula ya existe, se devuelve un error 400 (Bad Request).
      return res.status(400).json({
        message: "Esta cédula ya está registrada para otro paciente",
      });
    }

    // --- FORMATEO DE DATOS ANTES DE ENVIAR AL MODELO ---

    // Se actualiza el código de empresa en el cuerpo de la petición (ya convertido a número).
    req.body.pacie_cod_empr = pacie_cod_empr;

    // Se asegura que la fecha de nacimiento esté en formato YYYY-MM-DD.
    if (req.body.pacie_fec_nac) {
      req.body.pacie_fec_nac = new Date(req.body.pacie_fec_nac).toISOString().split("T")[0];
    }

    // Se asegura que los campos de tipo checkbox se guarden como 0 o 1.
    req.body.pacie_cod_disc = Number(req.body.pacie_cod_disc) || 0;
    req.body.pacie_enf_catas = Number(req.body.pacie_enf_catas) || 0;
    // Se asegura que el porcentaje de discapacidad sea un número.
    req.body.pacie_por_disc = Number(req.body.pacie_por_disc) || 0;

    // --- LLAMADA AL MODELO ---
    // Se llama a la función del modelo para que inserte el nuevo paciente en la base de datos.
    const nuevoPaciente = await createPaciente(req.body);
    
    // --- RESPUESTA EXITOSA ---
    // Se devuelve el paciente recién creado con un código de estado 201 (Created).
    res.status(201).json(nuevoPaciente);

  } catch (error) {
    // --- MANEJO DE ERRORES ---
    // Si ocurre cualquier error en el proceso, se registra en la consola del servidor.
    console.error("Error detallado al crear paciente:", error);
    // Se envía una respuesta de error 500 (Internal Server Error) al cliente.
    res.status(500).json({
      message: "Error al crear el paciente",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Actualizar un paciente
export const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanies = req.userCompanies;
    let { pacie_cod_empr } = req.body; // Desestructuramos

    // CONVERTIR pacie_cod_empr a número para la validación
    if (pacie_cod_empr) {
      // Solo si se proporciona en el body
      pacie_cod_empr = parseInt(pacie_cod_empr); // ¡CRÍTICO! Convertir a número
    }

    // Primero, verificar si el paciente existe y si el usuario tiene acceso a él
    const pacienteExistente = await getPacienteById(id, userCompanies);
    if (!pacienteExistente) {
      return res.status(404).json({
        message: "Paciente no encontrado o no tiene acceso para modificarlo.",
      });
    }

    // Segundo, si se intenta cambiar la empresa del paciente, verificar permisos para la nueva empresa
    // Aquí usamos pacie_cod_empr ya convertido a número.
    if (pacie_cod_empr && pacie_cod_empr !== pacienteExistente.pacie_cod_empr) {
      if (!userCompanies || !userCompanies.includes(pacie_cod_empr)) {
        console.warn(
          `DEBUG CONTROLLER (actualizarPaciente): Intento de mover paciente a empresa no autorizada: ${pacie_cod_empr} por usuario con acceso a ${userCompanies}`
        );
        return res.status(403).json({
          message:
            "No tiene permiso para asignar pacientes a la nueva empresa especificada.",
        });
      }
    }

    // Resto de la lógica, actualizamos req.body.pacie_cod_empr si se modificó
    req.body.pacie_cod_empr = pacie_cod_empr;

    if (req.body.pacie_fec_nac)
      req.body.pacie_fec_nac = new Date(req.body.pacie_fec_nac)
        .toISOString()
        .split("T")[0];
    if (typeof req.body.pacie_cod_disc !== "undefined")
      req.body.pacie_cod_disc = Number(req.body.pacie_cod_disc) || 0;
    if (typeof req.body.pacie_enf_catas !== "undefined")
      req.body.pacie_enf_catas = Number(req.body.pacie_enf_catas) || 0;
    if (typeof req.body.pacie_por_disc !== "undefined")
      req.body.pacie_por_disc = Number(req.body.pacie_por_disc) || 0;

    const pacienteActualizado = await updatePaciente(id, req.body);
    res.status(200).json(pacienteActualizado);
  } catch (error) {
    console.error("Error al actualizar el paciente en controller:", error);
    res.status(500).json({
      message: "Error al actualizar el paciente",
      error: error.message,
    });
  }
};

// Eliminar un paciente (cambiar estado a 'I')
export const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const userCompanies = req.userCompanies;

    // Verificar si el paciente existe y si el usuario tiene acceso a él antes de eliminar
    const pacienteExistente = await getPacienteById(id, userCompanies);
    if (!pacienteExistente) {
      return res.status(404).json({
        message: "Paciente no encontrado o no tiene acceso para eliminarlo.",
      });
    }

    const pacienteEliminado = await deletePaciente(id);
    res.status(200).json(pacienteEliminado);
  } catch (error) {
    console.error("Error al eliminar el paciente en controller:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar el paciente", error: error.message });
  }
};

// Obtener todos los tipos de pacientes (datos maestros, no necesitan filtro de empresa)
export const obtenerTiposPaciente = async (req, res) => {
  try {
    const tiposPacientes = await getAllTiposPacientes();
    res.status(200).json(tiposPacientes);
  } catch (error) {
    console.error("Error al obtener tipos de paciente:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los tipos de pacientes", error });
  }
};

// Obtener todas las zonas (datos maestros)
export const obtenerZonas = async (req, res) => {
  try {
    const zonas = await getAllZonas();
    res.status(200).json(zonas);
  } catch (error) {
    console.error("Error al obtener zonas:", error);
    res.status(500).json({ message: "Error al obtener las zonas", error });
  }
};

// Obtener todos los sexos (datos maestros)
export const obtenerSexos = async (req, res) => {
  try {
    const sexos = await getAllSexos();
    res.status(200).json(sexos);
  } catch (error) {
    console.error("Error al obtener sexos:", error);
    res.status(500).json({ message: "Error al obtener los sexos", error });
  }
};

// Obtener todos los estados civiles (datos maestros)
export const obtenerEstadosCiviles = async (req, res) => {
  try {
    const estadosCiviles = await getAllEstadosCiviles();
    res.status(200).json(estadosCiviles);
  } catch (error) {
    console.error("Error al obtener estados civiles:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los estados civiles", error });
  }
};

// Obtener todas las religiones (datos maestros)
export const obtenerReligiones = async (req, res) => {
  try {
    const religiones = await getAllReligiones();
    res.status(200).json(religiones);
  } catch (error) {
    console.error("Error al obtener religiones:", error);
    res.status(500).json({ message: "Error al obtener las religiones", error });
  }
};

// Obtener todos los países (datos maestros)
export const obtenerPaises = async (req, res) => {
  try {
    const paises = await getAllPaises();
    res.status(200).json(paises);
  } catch (error) {
    console.error("Error al obtener países:", error);
    res.status(500).json({ message: "Error al obtener los países", error });
  }
};

// Obtener todas las etnias (datos maestros)
export const obtenerEtnias = async (req, res) => {
  try {
    const etnias = await getAllEtnias();
    res.status(200).json(etnias);
  } catch (error) {
    console.error("Error al obtener etnias:", error);
    res.status(500).json({ message: "Error al obtener las etnias", error });
  }
};

// Obtener todas las orientaciones sexuales (datos maestros)
export const obtenerOrientacionesSexuales = async (req, res) => {
  try {
    const orientacionesSexuales = await getAllOrientacionesSexuales();
    res.status(200).json(orientacionesSexuales);
  } catch (error) {
    console.error("Error al obtener orientaciones sexuales:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las orientaciones sexuales", error });
  }
};

// Obtener todos los géneros (datos maestros)
export const obtenerGeneros = async (req, res) => {
  try {
    const generos = await getAllGeneros();
    res.status(200).json(generos);
  } catch (error) {
    console.error("Error al obtener géneros:", error);
    res.status(500).json({ message: "Error al obtener los géneros", error });
  }
};

// Obtener todas las lateralidades (datos maestros)
export const obtenerLateralidades = async (req, res) => {
  try {
    const lateralidades = await getAllLateralidades();
    res.status(200).json(lateralidades);
  } catch (error) {
    console.error("Error al obtener lateralidades:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las lateralidades", error });
  }
};

// Obtener todas las instituciones (datos maestros)
export const obtenerInstrucciones = async (req, res) => {
  try {
    const instituciones = await getAllInstrucciones();
    res.status(200).json(instituciones);
  } catch (error) {
    console.error("Error al obtener instrucciones:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las instituciones", error });
  }
};

// Obtener todos los tipos de sangre (datos maestros)
export const obtenerTiposSangre = async (req, res) => {
  try {
    const tiposSangre = await getAllTiposSangre();
    res.status(200).json(tiposSangre);
  } catch (error) {
    console.error("Error al obtener tipos de sangre:", error);
    res
      .status(500)
      .json({ message: "Error al obtener los tipos de sangre", error });
  }
};

// Obtener todas las empresas (datos maestros)
// NOTA: Esta función no filtra por 'userCompanies' porque asume que es una lista de todas las empresas.
// Si deseas que un usuario solo vea las empresas a las que tiene acceso en este select,
// necesitarías modificar esta función para aceptar 'userCompanies' y filtrar la query.
// Por ahora, se mantienen todas las empresas para que el usuario pueda seleccionar,
// y la validación de permisos se hace en 'crearPaciente'/'actualizarPaciente'.
export const obtenerEmpresas = async (req, res) => {
  try {
    const empresas = await getAllEmpresas();
    res.status(200).json(empresas);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    res.status(500).json({ message: "Error al obtener las empresas", error });
  }
};

// Obtener todas las discapacidades (datos maestros)
export const obtenerDiscapacidades = async (req, res) => {
  try {
    const discapacidades = await getAllDiscapacidades();
    res.status(200).json(discapacidades);
  } catch (error) {
    console.error("Error al obtener las discapacidades:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las discapacidades", error });
  }
};

// Verificar si una cédula existe (esta función no necesita userCompanies directamente)
export const verificarCedula = async (req, res) => {
  try {
    const { cedula } = req.query;
    const { id } = req.params; // Opcional, para cuando se está editando

    if (!cedula) {
      return res
        .status(400)
        .json({ message: "Se requiere el parámetro 'cedula'" });
    }

    const existe = await verificarCedulaExistente(cedula, id);
    res.status(200).json({ existe });
  } catch (error) {
    console.error("Error al verificar la cédula en controller:", error);
    res.status(500).json({
      message: "Error al verificar la cédula",
      error: error.message,
    });
  }
};
