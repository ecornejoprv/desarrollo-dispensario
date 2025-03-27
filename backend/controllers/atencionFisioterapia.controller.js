import { registrarAtencion } from "../models/atencion.model.js";
import { registrarDiagnostico } from "../models/diagnostico.model.js";
import { registrarTerapia, registrarTecnicasTerapia } from "../models/fisioterapia.model.js";
import { registrarPrescripcion } from "../models/prescripciones.model.js";
import { registrarReferencia } from "../models/referencia.model.js";
import { registrarIndicacionGeneral } from "../models/indicacionGeneral.model.js";

export const registrarAtencionFisioterapia = async (req, res) => {
  const {
    atencionData,
    diagnosticos,
    prescripciones,
    referencias,
    indicacionesGenerales
  } = req.body;

  if (!atencionData || !diagnosticos || !prescripciones) {
    return res.status(400).json({
      error: "Los campos 'atencionData', 'diagnosticos' y 'prescripciones' son requeridos."
    });
  }

  try {
    // 1. Registrar la atención
    const atencion = await registrarAtencion(atencionData);
    const atencionId = atencion.aten_cod_aten;

    // 2. Registrar los diagnósticos y sus terapias
    for (const diagnostico of diagnosticos) {
      const diagnosticoData = {
        diag_cod_aten: atencionId,
        diag_cod_cie10: diagnostico.diag_cod_cie10,
        diag_obs_diag: diagnostico.diag_obs_diag,
        diag_est_diag: diagnostico.diag_est_diag,
      };

      const diagnosticoId = await registrarDiagnostico(diagnosticoData);

      // Registrar terapias para este diagnóstico
      if (diagnostico.terapias) {
        for (const terapia of diagnostico.terapias) {
          const terapiaData = {
            diater_cod_diag: diagnosticoId,
            diater_cod_terap: terapia.codigo
          };
          
          const terapiaId = await registrarTerapia(terapiaData);
          
          // Registrar técnicas si existen
          if (terapia.tecnicas && terapia.tecnicas.length > 0) {
            for (const tecnica of terapia.tecnicas) {
              await registrarTecnicasTerapia({
                teraptec_cod_diater: terapiaId,
                teraptec_cod_tecn: tecnica.codigo
              });
            }
          }
        }
      }
    }

    // 3. Registrar las prescripciones (igual que en medicina general)
    for (const prescripcion of prescripciones) {
      const prescripcionData = {
        pres_cod_aten: atencionId,
        ...prescripcion,
      };
      const prescripcionRegistrada = await registrarPrescripcion(prescripcionData);

      // Registrar referencias
      if (referencias && referencias.length > 0) {
        for (const referencia of referencias) {
          await registrarReferencia({
            refe_cod_pres: prescripcionRegistrada.pres_cod_pres,
            refe_des_refe: referencia.refe_des_refe,
          });
        }
      }

      // Registrar indicaciones generales
      if (indicacionesGenerales && indicacionesGenerales.length > 0) {
        for (const indicacion of indicacionesGenerales) {
          await registrarIndicacionGeneral({
            indi_cod_pres: prescripcionRegistrada.pres_cod_pres,
            indi_des_indi: indicacion.indi_des_indi,
          });
        }
      }
    }

    res.status(201).json({ message: "Atención de fisioterapia registrada correctamente." });
  } catch (error) {
    res.status(500).json({ 
      error: "Error al registrar la atención de fisioterapia: " + error.message 
    });
  }
};