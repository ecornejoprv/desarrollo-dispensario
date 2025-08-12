import {
  getAtencionesByPacienteId,
  getAtencionById,
  getAtencionesByPacienteIdAndEspecialidad,
  getTotalAtencionesByPacienteIdAndEspecialidad,
  validarCitaPendienteConTriaje,
  registrarAtencion,
  getCitasPendientesPorMedico,
  actualizarEstadoCita,
  getAtencionesByMedicoAndDates,  // ¡Esta es la función que falta!
  countAtencionesByMedicoAndDates,
  getEstadisticasAtenciones,
  getMorbilidadByAtencionId,
  getPreventivaByAtencionId,
  getVigilanciasByAtencionId,
  getPrescripcionesByAtencionId,
  getAtencionesPorFechas,
  countAtencionesPorFechas,
  getIndicacionesByAtencionId,
  getReferenciasByAtencionId,
  getTriajeByAtencionId,
} from "../models/atencion.model.js";
import { getPacienteById } from "../models/pacientes.model.js";
import { registrarDiagnostico } from "../models/diagnostico.model.js"; // Importación agregada
import { registrarProcedimiento } from "../models/procedimiento.model.js"; // Importación agregada
import { registrarPrescripcion } from "../models/prescripciones.model.js"; // Importación agregada
import { registrarReferencia } from "../models/referencia.model.js"; // Importación agregada
import { registrarIndicacionGeneral } from "../models/indicacionGeneral.model.js"; // Importación agregada
import { registrarPreventiva } from "../models/preventiva.model.js";
import { registrarVigilancias } from "../models/vigilancia.model.js";
import { registrarMorbilidad, registrarSistemasAfectados } from "../models/morbilidad.model.js";
import { registrarTerapias } from "../models/fisioterapia.model.js";
import { registrarSignoAlarma } from "../models/signosAlarma.model.js"; 

// Obtener todas las atenciones de un paciente
export const obtenerAtencionesPorPaciente = async (req, res) => {
  const { pacienteId } = req.params;

  // Validar que el pacienteId sea un número
  if (isNaN(pacienteId)) {
    return res
      .status(400)
      .json({ error: "El ID del paciente debe ser un número válido." });
  }

  try {
    const atenciones = await getAtencionesByPacienteId(pacienteId);
    res.status(200).json(atenciones);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener las atenciones del paciente." });
  }
};

// Obtener una atención por su ID
export const obtenerAtencionPorId = async (req, res) => {
  const { atencionId } = req.params;

  if (!atencionId || isNaN(Number(atencionId))) {
    return res.status(400).json({ error: "ID de atención inválido" });
  }

  try {
    const atencion = await getAtencionById(Number(atencionId));
    if (!atencion) {
      return res.status(404).json({ error: "Atención no encontrada" });
    }

    // Obtener datos adicionales
    const [preventiva, vigilancias, morbilidad, prescripciones] = await Promise.all([
      getPreventivaByAtencionId(atencionId),
      getVigilanciasByAtencionId(atencionId),
      getMorbilidadByAtencionId(atencionId),
      getPrescripcionesByAtencionId(atencionId),
    ]);

    res.status(200).json({
      ...atencion,
      preventiva,
      vigilancias,
      morbilidad,
      prescripciones
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener la atención",
      details: error.message 
    });
  }
};

// Obtener atenciones de un paciente por especialidad con paginación
export const obtenerAtencionesPorPacienteYEspecialidad = async (req, res) => {
  const { pacienteId, especialidad } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  // Validar que el pacienteId sea un número
  if (isNaN(pacienteId)) {
    return res
      .status(400)
      .json({ error: "El ID del paciente debe ser un número válido." });
  }

  try {
    const atenciones = await getAtencionesByPacienteIdAndEspecialidad(
      pacienteId,
      especialidad,
      limit,
      offset
    );
    const total = await getTotalAtencionesByPacienteIdAndEspecialidad(
      pacienteId,
      especialidad
    );
    res.status(200).json({ atenciones, total });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener las atenciones del paciente por especialidad.",
      });
  }
};

// Validar cita pendiente con triaje y obtener datos del paciente
export const validarCitaYMostrarPaciente = async (req, res) => {
  const { pacienteId } = req.params;

  // Validar que el pacienteId sea un número
  if (isNaN(pacienteId)) {
    return res
      .status(400)
      .json({ error: "El ID del paciente debe ser un número válido." });
  }

  try {
    // Validar si existe una cita pendiente con triaje
    const citaValida = await validarCitaPendienteConTriaje(pacienteId);
    if (!citaValida) {
      return res
        .status(404)
        .json({
          error: "No existe una cita pendiente con triaje para este paciente.",
        });
    }

    // Obtener los datos del paciente
    const paciente = await getPacienteById(pacienteId);
    if (!paciente) {
      return res.status(404).json({ error: "Paciente no encontrado." });
    }

    // Devolver los datos del paciente y la cita
    res.status(200).json({ paciente, cita: citaValida });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al validar la cita y obtener los datos del paciente.",
      });
  }
};

// Registrar una atención
export const registrarAtencionController = async (req, res) => {
  const {
    atencionData, diagnosticos, prescripciones, referencias,
    indicacionesGenerales, signosAlarma, tipoAtencionPreventiva,
    vigilanciaSeleccionada, morbilidadSeleccionada, sistemasAfectados, tiposAccidente
  } = req.body;

  if (!atencionData || !diagnosticos || !prescripciones) {
    return res.status(400).json({
      error: "Los campos 'atencionData', 'diagnosticos' y 'prescripciones' son requeridos.",
    });
  }

  try {
    // 1. Registrar la atención principal y obtener el objeto completo de vuelta.
    const atencion = await registrarAtencion(atencionData);
    const atencionId = atencion.aten_cod_aten;

    // 2. Registrar todos los datos secundarios asociados a la atención.
    // (Preventiva, Vigilancia, Morbilidad, Diagnósticos, Prescripciones, etc.)
    if (tipoAtencionPreventiva) { await registrarPreventiva({ prev_cod_aten: atencionId, prev_tip_prev: tipoAtencionPreventiva }); }
    if (vigilanciaSeleccionada && vigilanciaSeleccionada.length > 0) { const vigiData = vigilanciaSeleccionada.map(v => ({ vigi_cod_aten: atencionId, vigi_tip_vigi: v })); await registrarVigilancias(vigiData); }
    if (morbilidadSeleccionada) {
      const morbilidad = await registrarMorbilidad({ morb_cod_aten: atencionId, morb_tip_morb: morbilidadSeleccionada });
      if (morbilidadSeleccionada === 'Atención Enfermedad General' && sistemasAfectados?.length > 0) { await registrarSistemasAfectados(sistemasAfectados, morbilidad.morb_cod_morb); }
      if (morbilidadSeleccionada === 'Valoración por Accidente de Trabajo' && tiposAccidente?.length > 0) { await registrarSistemasAfectados(tiposAccidente, morbilidad.morb_cod_morb); }
    }
    for (const diagnostico of diagnosticos) {
      const diagData = { diag_cod_aten: atencionId, ...diagnostico };
      await registrarDiagnostico(diagData);
    }
    for (const prescripcion of prescripciones) {
      const presData = { pres_cod_aten: atencionId, ...prescripcion };
      await registrarPrescripcion(presData);
    }
    if (referencias?.length > 0) { for (const ref of referencias) { if(ref.refe_des_refe) await registrarReferencia({ refe_cod_aten: atencionId, refe_des_refe: ref.refe_des_refe }); } }
    if (indicacionesGenerales?.length > 0) { for (const ind of indicacionesGenerales) { if(ind.indi_des_indi) await registrarIndicacionGeneral({ indi_cod_aten: atencionId, indi_des_indi: ind.indi_des_indi }); } }
    if (signosAlarma?.length > 0) { for (const signo of signosAlarma) { if(signo.signa_des_signa) await registrarSignoAlarma({ signa_cod_aten: atencionId, signa_des_signa: signo.signa_des_signa }); } }
    
    // 3. Actualizar el estado de la cita si aplica.
    if (atencionData.aten_cod_cita) {
      await actualizarEstadoCita(atencionData.aten_cod_cita, 'AT');
    }
 
    // --- CAMBIO CLAVE ---
    // Se devuelve un mensaje de éxito Y el objeto de la atención recién creada.
    res.status(201).json({
      message: "Atención registrada correctamente.",
      atencion: atencion // <--- Esta es la línea que soluciona el problema.
    });

  } catch (error) {
    console.error("Error al registrar la atención:", error);
    res.status(500).json({ error: "Error al registrar la atención: " + error.message });
  }
};

// Obtener citas pendientes por médico
export const obtenerCitasPendientesPorMedico = async (req, res) => {
  const { medicoId } = req.params;

  // Validar que el medicoId sea un número
  if (isNaN(medicoId)) {
    return res
      .status(400)
      .json({ error: "El ID del médico debe ser un número válido." });
  }

  try {
    const citas = await getCitasPendientesPorMedico(medicoId);
    res.status(200).json(citas);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener las citas pendientes del médico." });
  }
};

// Obtener atenciones por médico y rango de fechas
export const obtenerAtencionesPorMedicoYFechas = async (req, res) => {
  const { medicoId } = req.params;
  const { fechaInicio, fechaFin, page = 1, limit = 10 } = req.query;
  
  if (isNaN(medicoId)) {
    return res.status(400).json({ error: "ID de médico inválido" });
  }

  try {
    const offset = (page - 1) * limit;
    const atenciones = await getAtencionesByMedicoAndDates(
      medicoId, 
      fechaInicio, 
      fechaFin, 
      limit, 
      offset
    );
    
    const total = await countAtencionesByMedicoAndDates(
      medicoId, 
      fechaInicio, 
      fechaFin
    );
    
    const estadisticas = await getEstadisticasAtenciones(
      medicoId, 
      fechaInicio, 
      fechaFin
    );

    res.status(200).json({
      atenciones,
      total,
      estadisticas,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener atenciones",
      details: error.message 
    });
  }
};

export const obtenerAtencionesPorFechas = async (req, res) => {
  const { fechaInicio, fechaFin, medicoId, page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    
    const atenciones = await getAtencionesPorFechas(
      fechaInicio,  // Primer parámetro: fechaInicio
      fechaFin,     // Segundo parámetro: fechaFin
      medicoId ? parseInt(medicoId) : null, // Tercer parámetro: medicoId
      parseInt(limit),  // Cuarto parámetro: limit
      parseInt(offset)  // Quinto parámetro: offset
    );
    
    const total = await countAtencionesPorFechas(
      fechaInicio,
      fechaFin,
      medicoId ? parseInt(medicoId) : null
    );

    res.status(200).json({
      atenciones,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error("Error en obtenerAtencionesPorFechas:", error);
    res.status(500).json({
      error: "Error al obtener atenciones",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

export const obtenerPreventivaPorAtencion = async (req, res) => {
  try {
    const { atencionId } = req.params;
    const response = await getPreventivaByAtencionId(atencionId);
    res.status(200).json(response ? [response] : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerVigilanciasPorAtencion = async (req, res) => {
  try {
    const { atencionId } = req.params;
    const response = await getVigilanciasByAtencionId(atencionId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerMorbilidadPorAtencion = async (req, res) => {
  try {
    const { atencionId } = req.params;
    const response = await getMorbilidadByAtencionId(atencionId);
    res.status(200).json(response ? [response] : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerPrescripcionesPorAtencion = async (req, res) => {
  try {
    const { atencionId } = req.params;
    const response = await getPrescripcionesByAtencionId(atencionId);
    res.status(200).json(response ? [response] : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerIndicacionesPorAtencion = async (req, res) => {
  try {
    const { atencionId } = req.params;
    const response = await getIndicacionesByAtencionId(atencionId);
    res.status(200).json(response || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerReferenciasPorAtencion = async (req, res) => {
  try {
    const { atencionId } = req.params;
    const response = await getReferenciasByAtencionId(atencionId);
    res.status(200).json(response || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerTriajePorAtencion = async (req, res) => {
  try {
    const { atencionId } = req.params;
    const triaje = await getTriajeByAtencionId(atencionId);
    // Es normal que no haya triaje, devolvemos null y el frontend lo manejará.
    if (!triaje) {
      return res.status(200).json(null);
    }
    res.status(200).json(triaje);
  } catch (error) {
    res.status(500).json({ 
      error: "Error al obtener datos de triaje", 
      details: error.message 
    });
  }
};