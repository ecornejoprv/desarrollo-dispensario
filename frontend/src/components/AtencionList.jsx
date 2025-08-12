// ==============================================================================
// @file: AtencionList.jsx
// @summary: Componente para listar y mostrar detalles de atenciones médicas.
// @version: 2.0.0
// ==============================================================================

// Importaciones de React, hooks y librerías externas.
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../api"; // Instancia de Axios para llamadas a la API.

// Importaciones de componentes de UI y utilidades.
import Modal from "./Modal";
import "./styles/AtencionList.css";
import { formatDateDDMMYYYY } from "./utils/formatters";

// Importaciones de iconos para una UI más descriptiva.
import FavoriteIcon from "@mui/icons-material/Favorite";
import AirIcon from "@mui/icons-material/Air";
import SpeedIcon from "@mui/icons-material/Speed";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import HeightIcon from "@mui/icons-material/Height";
import CalculateIcon from "@mui/icons-material/Calculate";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import StraightenIcon from '@mui/icons-material/Straighten';

// Función auxiliar para obtener un ícono representativo de la especialidad.
const getEspecialidadIcon = (especialidad) => {
  switch (especialidad) {
    case "Medicina":
      return "🩺";
    case "Odontologia":
      return "🦷";
    case "Fisioterapia":
      return "💪";
    case "Enfermeria":
      return "💉";
    default:
      return "";
  }
};

// --- INICIO DEL COMPONENTE PRINCIPAL ---
const AtencionList = ({ atenciones, mostrarEspecialidad }) => {
  // Estado para controlar la visibilidad del modal.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para almacenar el objeto de la atención seleccionada de la lista.
  const [selectedAtencion, setSelectedAtencion] = useState(null);
  
  // --- ESTADOS SEPARADOS PARA LOS DATOS OBTENIDOS POR LA API ---
  // Estado para los datos de triaje de la atención seleccionada.
  const [triaje, setTriaje] = useState(null);
  // Estado para los diagnósticos asociados a la atención.
  const [diagnosticos, setDiagnosticos] = useState([]);
  // Estado para los datos de medicina preventiva.
  const [preventiva, setPreventiva] = useState(null);
  // Estado para los datos de vigilancia epidemiológica.
  const [vigilancias, setVigilancias] = useState([]);
  // Estado para los datos de morbilidad.
  const [morbilidad, setMorbilidad] = useState(null);
  // Estado para las prescripciones médicas.
  const [prescripciones, setPrescripciones] = useState([]);
  // Estado para las indicaciones médicas.
  const [indicaciones, setIndicaciones] = useState([]);
  // Estado para las referencias a otros especialistas.
  const [referencias, setReferencias] = useState([]);


  // Hook de efecto para buscar todos los detalles de una atención cuando el usuario la selecciona.
  useEffect(() => {
    // Define una función asíncrona para realizar las llamadas a la API.
    const fetchData = async () => {
      // Verifica que `selectedAtencion` sea un objeto válido y tenga un ID.
      if (!selectedAtencion?.aten_cod_aten) {
        // Si no hay atención seleccionada, no se hace nada.
        return;
      }
      
      try {
        // Almacena el ID de la atención para evitar accesos repetidos.
        const atencionId = selectedAtencion.aten_cod_aten;
        
        // Ejecuta todas las llamadas a la API en paralelo para mejorar el rendimiento.
        const [
          triajeResponse,
          diagnosticosResponse,
          preventivaResponse,
          vigilanciasResponse,
          morbilidadResponse,
          prescripcionesResponse,
          indicacionesResponse,
          referenciasResponse,
        ] = await Promise.all([
          api.get(`/api/v1/atenciones/${atencionId}/triaje`),
          api.get(`/api/v1/diagnosticos/atencion/${atencionId}`),
          api.get(`/api/v1/atenciones/${atencionId}/preventiva`),
          api.get(`/api/v1/atenciones/${atencionId}/vigilancias`),
          api.get(`/api/v1/atenciones/${atencionId}/morbilidad`),
          api.get(`/api/v1/atenciones/${atencionId}/prescripciones`),
          api.get(`/api/v1/atenciones/${atencionId}/indicaciones`),
          api.get(`/api/v1/atenciones/${atencionId}/referencias`),
        ]);

        // Actualiza el estado de triaje con los datos recibidos.
        setTriaje(triajeResponse.data);

        // Procesa los diagnósticos para incluir sus procedimientos y terapias asociadas.
        const diagnosticosConDetalles = await Promise.all(
          diagnosticosResponse.data.map(async (diagnostico) => {
            // Obtiene los procedimientos para cada diagnóstico.
            const procedimientosResponse = await api.get(`/api/v1/procedimientos/diagnostico/${diagnostico.diag_cod_diag}`);
            let terapias = [];
            // Si la especialidad es Fisioterapia, busca también las terapias.
            if (selectedAtencion.aten_esp_aten === "Fisioterapia") {
              try {
                const terapiasResponse = await api.get(`/api/v1/fisioterapia/diagnostico/${diagnostico.diag_cod_diag}`);
                terapias = terapiasResponse.data;
              } catch (error) {
                console.error("Error obteniendo terapias de fisioterapia:", error);
              }
            }
            // Retorna el objeto de diagnóstico enriquecido con procedimientos y terapias.
            return { ...diagnostico, procedimientos: procedimientosResponse.data, terapias };
          })
        );
        // Actualiza el estado de los diagnósticos.
        setDiagnosticos(diagnosticosConDetalles);

        // Normaliza la respuesta de prescripciones, que a veces puede venir en un array anidado.
        const prescripcionesData = Array.isArray(prescripcionesResponse.data[0]) ? prescripcionesResponse.data[0] : prescripcionesResponse.data;
        
        // --- ACTUALIZACIÓN CORRECTA DE ESTADOS INDIVIDUALES ---
        // Almacena cada pieza de información en su propio estado.
        setPreventiva(preventivaResponse.data[0] || null);
        setVigilancias(vigilanciasResponse.data);
        setMorbilidad(morbilidadResponse.data[0] || null);
        setPrescripciones(prescripcionesData);
        setIndicaciones(indicacionesResponse.data);
        setReferencias(referenciasResponse.data);

        // --- LÍNEA PROBLEMÁTICA ELIMINADA ---
        // Se ha eliminado la llamada `setSelectedAtencion((prev) => ({...}))`
        // que causaba la corrupción del estado y el error en la API.

      } catch (error) {
        // Captura y registra cualquier error que ocurra durante las llamadas a la API.
        console.error("Error al obtener los detalles completos de la atención:", error);
        // Podrías establecer un estado de error aquí para notificar al usuario en la UI.
      }
    };
    
    // Ejecuta la función de obtención de datos.
    fetchData();

  // La dependencia de este efecto es únicamente `selectedAtencion`.
  // Se ejecuta solo cuando el usuario selecciona una nueva atención de la lista.
  }, [selectedAtencion]);

  // Función para manejar la apertura del modal.
  const openModal = (atencion) => {
    // Establece la atención seleccionada, lo que disparará el `useEffect` para cargar sus detalles.
    setSelectedAtencion(atencion);
    // Abre el modal.
    setIsModalOpen(true);
  };

  // Función para manejar el cierre del modal.
  const closeModal = () => {
    // Cierra el modal.
    setIsModalOpen(false);
    // --- LIMPIEZA COMPLETA DEL ESTADO ---
    // Resetea la atención seleccionada a su estado inicial.
    setSelectedAtencion(null);
    // Resetea todos los estados que contienen datos de la atención para evitar mostrar datos antiguos en la próxima apertura.
    setDiagnosticos([]);
    setTriaje(null);
    setPreventiva(null);
    setVigilancias([]);
    setMorbilidad(null);
    setPrescripciones([]);
    setIndicaciones([]);
    setReferencias([]);
  };

  return (
    <div className="atencion-list">
      <table className="tabla-atenciones">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Motivo</th>
            {mostrarEspecialidad && <th>Especialidad</th>}
            <th>Especialista</th>
          </tr>
        </thead>
        <tbody>{atenciones.map((atencion) => (
          <tr key={atencion.aten_cod_aten}>
            <td>{`${formatDateDDMMYYYY(atencion.aten_fec_aten)} - ${atencion.aten_hor_aten ? new Date(`1970-01-01T${atencion.aten_hor_aten}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`}</td>
            <td className="motivo-truncado" onClick={() => openModal(atencion)}>{atencion.aten_mot_cons}</td>
            {mostrarEspecialidad && (
              <td>
                <span className="especialidad-icon">{getEspecialidadIcon(atencion.aten_esp_aten)}</span>
                <span className="especialidad-nombre">{atencion.aten_esp_aten}</span>
              </td>
            )}
            <td>{atencion.medic_nom_medic}</td>
          </tr>
        ))}</tbody>
      </table>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Detalles de la Atención">
        {selectedAtencion && (
          <div className="details-section">
            <div className="atencion-info-basica">
              <p><strong>Fecha:</strong> {formatDateDDMMYYYY(selectedAtencion.aten_fec_aten)}</p>
              <p><strong>Hora:</strong> {selectedAtencion.aten_hor_aten ? new Date(`1970-01-01T${selectedAtencion.aten_hor_aten}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "No registrada"}</p>
              <p><strong>Motivo:</strong> {selectedAtencion.aten_mot_cons}</p>
              <p><strong>Enfermedad Actual:</strong> {selectedAtencion.aten_enf_actu}</p>
              <p><strong>Especialidad:</strong> {selectedAtencion.aten_esp_aten}</p>
              <p><strong>Especialista:</strong> {selectedAtencion.medic_nom_medic}</p>
              {selectedAtencion.aten_num_sesi && (<p><strong>Sesión N°:</strong> {selectedAtencion.aten_num_sesi}</p>)}
            </div>
            
            {(preventiva || vigilancias?.length > 0 || morbilidad) && (
              <>
                <h4>DATOS ADICIONALES</h4>
                {preventiva && (
                  <div className="additional-info">
                    <p><strong>Tipo Preventivo:</strong> {preventiva.prev_tip_prev}</p>
                  </div>
                )}
                {vigilancias?.length > 0 && (
                  <div className="additional-info">
                    <p><strong>Vigilancia Epidemiológica:</strong></p>
                    <ul>{vigilancias.map((vigi, index) => (<li key={index}>{vigi}</li>))}</ul>
                  </div>
                )}
                {selectedAtencion.morbilidad && (
                  <div className="additional-info">
                    <p><strong>Tipo Morbilidad:</strong> {selectedAtencion.morbilidad.morb_tip_morb}</p>
                    {selectedAtencion.morbilidad.sistemas_afectados?.length > 0 && (
                      <>
                        <p><strong>Sistemas Afectados:</strong></p>
                        <ul>{selectedAtencion.morbilidad.sistemas_afectados.map((sistema, index) => (<li key={index}>{sistema}</li>))}</ul>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {triaje && (
              <div className="triaje-section">
                <h4>DATOS DE TRIAJE</h4>
                <div className="triaje-grid">
                  <div className="triaje-item"><FavoriteIcon className="triaje-icon" style={{ color: '#f44336' }}/><span><strong>Frec. Cardíaca:</strong> {triaje.triaj_fca_triaj || '--'} lpm</span></div>
                  <div className="triaje-item"><AirIcon className="triaje-icon" style={{ color: '#03a9f4' }}/><span><strong>Frec. Respiratoria:</strong> {triaje.triaj_fre_triaj || '--'} rpm</span></div>
                  <div className="triaje-item"><SpeedIcon className="triaje-icon" style={{ color: '#2196f3' }}/><span><strong>Presión Arterial:</strong> {triaje.triaj_par_triaj || '--'} mmHg</span></div>
                  <div className="triaje-item"><ThermostatIcon className="triaje-icon" style={{ color: '#ff9800' }}/><span><strong>Temperatura:</strong> {triaje.triaj_tem_triaj || '--'} °C</span></div>
                  <div className="triaje-item"><MonitorWeightIcon className="triaje-icon" style={{ color: '#673ab7' }}/><span><strong>Peso:</strong> {triaje.triaj_pes_triaj || '--'} kg</span></div>
                  <div className="triaje-item"><HeightIcon className="triaje-icon" style={{ color: '#795548' }}/><span><strong>Talla:</strong> {triaje.triaj_tal_triaj || '--'} cm</span></div>
                  <div className="triaje-item"><CalculateIcon className="triaje-icon" style={{ color: '#4caf50' }}/><span><strong>IMC:</strong> {triaje.triaj_imc_triaj || '--'}</span></div>
                  <div className="triaje-item"><StraightenIcon className="triaje-icon" style={{ color: '#9c27b0' }}/><span><strong>Per. Abdominal:</strong> {triaje.triaj_pab_triaj || '--'} cm</span></div>
                  <div className="triaje-item"><LocalHospitalIcon className="triaje-icon" style={{ color: '#e91e63' }}/><span><strong>SpO₂:</strong> {triaje.triaj_sat_triaj || '--'}%</span></div>
                </div>
                {triaje.triaj_obs_triaj && (<div className="triaje-observaciones"><strong>Observaciones de Triaje:</strong> {triaje.triaj_obs_triaj}</div>)}
              </div>
            )}

            {diagnosticos.length > 0 ? (
              <>
                <h4>DIAGNOSTICOS</h4>
                <ul>{diagnosticos.map((diagnostico) => (
                  <li key={diagnostico.diag_cod_diag}>
                    <table className="cabeceraprocedimiento-table">
                      <tbody>
                        <tr>
                          <td className="cie10"><strong>CIE10:</strong> {diagnostico.cie10_id_cie10}</td>
                          <td className="diagnostico"><strong>Diagnóstico:</strong> {diagnostico.cie10_nom_cie10}</td>
                          <td className="estado"><strong>Estado:</strong> {diagnostico.diag_est_diag}</td>
                        </tr>
                        <tr>
                          <td className="observacion" colSpan="3"><strong>Observación:</strong> {diagnostico.diag_obs_diag}</td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="procedimiento-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Procedimiento</th>
                          <th>Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnostico.procedimientos?.map((procedimiento) => (
                          <tr key={procedimiento.proc_cod_proc}>
                            <td>{procedimiento.pro10_ide_pro10}</td>
                            <td>{procedimiento.pro10_nom_pro10}</td>
                            <td>{procedimiento.proc_obs_proc}</td>
                          </tr>
                        ))}
                        {diagnostico.terapias?.map((terapia) => (
                          <tr key={terapia.terap_cod_terap} className="terapia-row">
                            <td>TERAPIA</td>
                            <td>{terapia.terap_nom_terap}</td>
                            <td className="tecnicas-cell">{terapia.terap_tec_terap.map((tecnica, i) => (<div key={i}>{tecnica}</div>))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </li>
                ))}</ul>
              </>
            ) : (<p className="no-data-message">No hay diagnósticos registrados para esta atención.</p>)}
            
            {selectedAtencion.prescripciones?.length > 0 && (
              <>
                <h4>PRESCRIPCIONES MÉDICAS</h4>
                <table className="prescripciones-table">
                  <thead>
                    <tr>
                      <th>Medicamento</th>
                      <th>Cantidad</th>
                      <th>Dosis</th>
                      <th>Vía</th>
                      <th>Frecuencia</th>
                      <th>Duración</th>
                      <th>Indicaciones</th>
                    </tr>
                  </thead>
                  <tbody>{selectedAtencion.prescripciones.map((prescripcion) => (
                    <tr key={prescripcion.pres_cod_pres}>
                      <td>{prescripcion.pres_nom_prod}</td>
                      <td>{prescripcion.pres_can_pres}</td>
                      <td>{prescripcion.pres_dos_pres}</td>
                      <td>{prescripcion.pres_adm_pres}</td>
                      <td>{prescripcion.pres_fre_pres}</td>
                      <td>{prescripcion.pres_dur_pres} días</td>
                      <td>{prescripcion.pres_ind_pres || "-"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </>
            )}

            {selectedAtencion.indicaciones?.length > 0 && (
              <>
                <h4>INDICACIONES</h4>
                <table className="indicaciones-table">
                  <tbody>{selectedAtencion.indicaciones.map((indicacion) => (
                    <tr key={indicacion.indi_cod_indi}>
                      <td>{indicacion.indi_des_indi}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </>
            )}

            {selectedAtencion.referencias?.length > 0 && (
              <>
                <h4>REFERENCIAS</h4>
                <table className="referencias-table">
                  <tbody>{selectedAtencion.referencias.map((referencia) => (
                    <tr key={referencia.refe_cod_refe}>
                      <td>{referencia.refe_des_refe}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

AtencionList.propTypes = {
  atenciones: PropTypes.arrayOf(
    PropTypes.shape({
      aten_cod_aten: PropTypes.string.isRequired,
      aten_fec_aten: PropTypes.string.isRequired,
      aten_mot_cons: PropTypes.string.isRequired,
      aten_esp_aten: PropTypes.string,
      medic_nom_medic: PropTypes.string
    })
  ).isRequired,
  mostrarEspecialidad: PropTypes.bool.isRequired,
};

export default AtencionList;