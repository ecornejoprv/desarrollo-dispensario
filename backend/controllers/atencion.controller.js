import {
  getAtencionesByPacienteId,
  getAtencionById,
  getAtencionesByPacienteIdAndEspecialidad,
  getTotalAtencionesByPacienteIdAndEspecialidad,
  validarCitaPendienteConTriaje,
  registrarAtencion,
  getCitasPendientesPorMedico,
  actualizarEstadoCita,
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

  // Validar que el atencionId sea un número
  if (isNaN(atencionId)) {
    return res
      .status(400)
      .json({ error: "El ID de la atención debe ser un número válido." });
  }

  try {
    const atencion = await getAtencionById(atencionId);
    if (atencion) {
      res.status(200).json(atencion);
    } else {
      res.status(404).json({ error: "Atención no encontrada." });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la atención." });
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
    atencionData,
    diagnosticos,
    prescripciones,
    referencias,
    indicacionesGenerales,
    tipoAtencionPreventiva,
    vigilanciaSeleccionada,
    morbilidadSeleccionada,
    sistemasAfectados,
    tiposAccidente
  } = req.body;

  if (!atencionData || !diagnosticos || !prescripciones) {
    return res
      .status(400)
      .json({
        error:
          "Los campos 'atencionData', 'diagnosticos' y 'prescripciones' son requeridos.",
      });
  }

  try {
    // 1. Registrar la atención
    const atencion = await registrarAtencion(atencionData);
    const atencionId = atencion.aten_cod_aten;

    // 2. Registrar datos de atención preventiva si existe
    if (tipoAtencionPreventiva) {
      await registrarPreventiva({
        prev_cod_aten: atencionId,
        prev_tip_prev: tipoAtencionPreventiva
      });
    }

     // 3. Registrar vigilancia epidemiológica si existe
     if (vigilanciaSeleccionada && vigilanciaSeleccionada.length > 0) {
      const vigilanciaData = vigilanciaSeleccionada.map(vigi => ({
        vigi_cod_aten: atencionId,
        vigi_tip_vigi: vigi
      }));
      await registrarVigilancias(vigilanciaData);
    }

    // 4. Registrar morbilidad si existe
    if (morbilidadSeleccionada) {
      const morbilidad = await registrarMorbilidad({
        morb_cod_aten: atencionId,
        morb_tip_morb: morbilidadSeleccionada
      });

      // Registrar sistemas afectados si es enfermedad general
      if (morbilidadSeleccionada === 'Atención Enfermedad General' && 
          sistemasAfectados && sistemasAfectados.length > 0) {
        await registrarSistemasAfectados(sistemasAfectados, morbilidad.morb_cod_morb);
      }

      // Registrar sistemas afectados si es accidente de trabajo
      if (morbilidadSeleccionada === 'Valoración por Accidente de Trabajo' && 
        tiposAccidente && tiposAccidente.length > 0) {
      await registrarSistemasAfectados(tiposAccidente, morbilidad.morb_cod_morb);
    }
      
    }
    
    // 2. Registrar los diagnósticos y sus procedimientos
    for (const diagnostico of diagnosticos) {
      const diagnosticoData = {
        diag_cod_aten: atencionId,
        diag_cod_cie10: diagnostico.diag_cod_cie10,
        diag_obs_diag: diagnostico.diag_obs_diag,
        diag_est_diag: diagnostico.diag_est_diag,
      };

      const diagnosticoId = await registrarDiagnostico(diagnosticoData);

      // Verificar si es atención de fisioterapia (tiene terapias)
      if (diagnostico.terapias) {
        // Registrar terapias para fisioterapia
        for (const [terapia, seleccionada] of Object.entries(diagnostico.terapias)) {
          if (seleccionada) {
            const tecnicas = Object.entries(diagnostico.tecnicasSeleccionadas[terapia] || {})
              .filter(([_, sel]) => sel)
              .map(([tecnica, _]) => tecnica);
            
            await registrarTerapias({
              diag_cod_diag: diagnosticoId,
              nombre: terapia,
              tecnicas
            });
          }
        }
      }
      // Verificar si es atención de medicina general (tiene procedimientos)
      else if (diagnostico.procedimientos && Array.isArray(diagnostico.procedimientos)) {
        // Registrar procedimientos para medicina general
        for (const procedimiento of diagnostico.procedimientos) {
          await registrarProcedimiento({
            proc_cod_diag: diagnosticoId,
            proc_cod_cie10: procedimiento.proc_cod_cie10,
            proc_obs_proc: procedimiento.proc_obs_proc,
          });
        }
      }
    }

    // 3. Registrar las prescripciones
    for (const prescripcion of prescripciones) {
      const prescripcionData = {
        pres_cod_aten: atencionId,
        ...prescripcion,
      };
      await registrarPrescripcion(prescripcionData)
    }

      // 4. Registrar referencias asociadas a esta prescripción
      if (referencias && referencias.length > 0) {
        for (const referencia of referencias) {
          await registrarReferencia({
            refe_cod_aten: atencionId,
            refe_des_refe: referencia.refe_des_refe,
          });
        }
      }

      // 5. Registrar indicaciones generales asociadas a esta prescripción
      if (indicacionesGenerales && indicacionesGenerales.length > 0) {
        for (const indicacion of indicacionesGenerales) {
          await registrarIndicacionGeneral({
            indi_cod_aten: atencionId,
            indi_des_indi: indicacion.indi_des_indi,
          });
        }
      }
          // 2. Actualizar el estado de la cita a 'AT' (Atendida)
    if (atencionData.aten_cod_cita) {
      await actualizarEstadoCita(atencionData.aten_cod_cita, 'AT');
    }
  

    res.status(201).json({ message: "Atención registrada correctamente." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al registrar la atención: " + error.message });
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
