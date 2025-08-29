// ==============================================================================
// @file: AtencionList.jsx
// @summary: Componente para listar atenciones y mostrar sus detalles en un modal.
// @version: 8.0.0 (Final, Completa y Corregida)
// @description: Versión definitiva que corrige todos los errores de importación
//               y de lógica de estado. Utiliza Módulos CSS para aplicar el diseño
//               de dashboard clínico de forma encapsulada y profesional, sin omitir
//               ninguna línea de código ni explicación.
// ==============================================================================

// --- IMPORTACIONES ---
// Importa los hooks 'useState' y 'useEffect' desde la librería de React para manejar el estado y los efectos secundarios.
import { useState, useEffect } from "react";
// Importa PropTypes para la validación de los tipos de las props del componente.
import PropTypes from "prop-types";
// Importa la instancia de Axios configurada para realizar llamadas a la API.
import api from "../api";
// Importa el componente Modal personalizado.
import Modal from "./Modal";
// Importa el archivo de estilos como un Módulo CSS, creando el objeto 'styles'.
import styles from './styles/AtencionList.module.css'; 
// Importa una función utilitaria para formatear fechas al formato DD/MM/YYYY.
import { formatDateDDMMYYYY } from "./utils/formatters";
// Importa los componentes de íconos de forma individual para asegurar que los nombres coincidan con su uso en el JSX.
import FavoriteIcon from "@mui/icons-material/Favorite";
import AirIcon from "@mui/icons-material/Air";
import SpeedIcon from "@mui/icons-material/Speed";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import HeightIcon from "@mui/icons-material/Height";
import CalculateIcon from "@mui/icons-material/Calculate";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import StraightenIcon from '@mui/icons-material/Straighten';

// --- FUNCIÓN UTILITARIA ---
// Define una función que devuelve un emoji representativo según la especialidad médica.
const getEspecialidadIcon = (especialidad) => {
  // Inicia una declaración switch para evaluar el valor de la variable 'especialidad'.
  switch (especialidad) {
    // Si la especialidad es "Medicina", devuelve el emoji del estetoscopio.
    case "Medicina": return "🩺";
    // Si la especialidad es "Odontologia", devuelve el emoji del diente.
    case "Odontologia": return "🦷";
    // Si la especialidad es "Fisioterapia", devuelve el emoji del brazo musculoso.
    case "Fisioterapia": return "💪";
    // Si la especialidad es "Enfermeria", devuelve el emoji de la jeringa.
    case "Enfermeria": return "💉";
    // Si no coincide con ningún caso anterior, devuelve una cadena de texto vacía.
    default: return "";
  }
};

// --- COMPONENTE PRINCIPAL: AtencionList ---
// Define el componente funcional AtencionList, que recibe las props 'atenciones' y 'mostrarEspecialidad'.
const AtencionList = ({ atenciones, mostrarEspecialidad }) => {
  // --- DEFINICIÓN DE ESTADOS ---
  // Estado booleano para controlar si el modal de detalles está visible o no. Inicializa en 'false' (oculto).
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para almacenar el objeto completo de la atención que el usuario ha seleccionado. Inicializa en 'null'.
  const [selectedAtencion, setSelectedAtencion] = useState(null);
  // Estado para almacenar los datos de triaje de la atención seleccionada. Inicializa en 'null'.
  const [triaje, setTriaje] = useState(null);
  // Estado para almacenar la lista de diagnósticos de la atención seleccionada. Inicializa como un array vacío.
  const [diagnosticos, setDiagnosticos] = useState([]);
  // Estado para almacenar los datos de atención preventiva. Inicializa en 'null'.
  const [preventiva, setPreventiva] = useState(null);
  // Estado para almacenar la lista de vigilancias epidemiológicas. Inicializa como un array vacío.
  const [vigilancias, setVigilancias] = useState([]);
  // Estado para almacenar los datos de morbilidad. Inicializa en 'null'.
  const [morbilidad, setMorbilidad] = useState(null);
  // Estado para almacenar la lista de prescripciones médicas. Inicializa como un array vacío.
  const [prescripciones, setPrescripciones] = useState([]);
  // Estado para almacenar la lista de indicaciones generales. Inicializa como un array vacío.
  const [indicaciones, setIndicaciones] = useState([]);
  // Estado para almacenar la lista de signos de alarma. Inicializa como un array vacío.
  const [signosAlarma, setSignosAlarma] = useState([]);
  // Estado para almacenar la lista de referencias a otros especialistas. Inicializa como un array vacío.
  const [referencias, setReferencias] = useState([]);
  
  // --- EFECTO PARA CARGAR DATOS ---
  // Hook que se ejecuta cada vez que el valor de 'selectedAtencion' cambia.
  useEffect(() => {
    // Se define una función asíncrona interna para encapsular las llamadas a la API.
    const fetchData = async () => {
      // Condición de guarda: si no hay ninguna atención seleccionada, la función se detiene aquí.
      if (!selectedAtencion?.aten_cod_aten) return;
      
      // Bloque try/catch para manejar posibles errores durante las llamadas a la API.
      try {
        // Se almacena el ID de la atención en una constante para facilitar su uso.
        const atencionId = selectedAtencion.aten_cod_aten;
        
        // Se ejecutan todas las peticiones de datos de forma paralela para mejorar el rendimiento.
        const [
          triajeRes, diagRes, prevRes, vigiRes, morbRes, presRes, indiRes, signosRes, refRes
        ] = await Promise.all([
          api.get(`/api/v1/atenciones/${atencionId}/triaje`),
          api.get(`/api/v1/diagnosticos/atencion/${atencionId}`),
          api.get(`/api/v1/atenciones/${atencionId}/preventiva`),
          api.get(`/api/v1/atenciones/${atencionId}/vigilancias`),
          api.get(`/api/v1/atenciones/${atencionId}/morbilidad`),
          api.get(`/api/v1/atenciones/${atencionId}/prescripciones`),
          api.get(`/api/v1/atenciones/${atencionId}/indicaciones`),
          api.get(`/api/v1/atenciones/${atencionId}/signos-alarma`),
          api.get(`/api/v1/atenciones/${atencionId}/referencias`),
        ]);

        // Se actualiza el estado de triaje con los datos recibidos de la API.
        setTriaje(triajeRes.data);

        // Se procesan los diagnósticos para enriquecerlos con información de procedimientos y terapias.
        const diagnosticosConDetalles = await Promise.all(
          diagRes.data.map(async (diagnostico) => {
            const procedimientosResponse = await api.get(`/api/v1/procedimientos/diagnostico/${diagnostico.diag_cod_diag}`);
            let terapias = [];
            if (selectedAtencion.aten_esp_aten === "Fisioterapia") {
              try {
                const terapiasResponse = await api.get(`/api/v1/fisioterapia/diagnostico/${diagnostico.diag_cod_diag}`);
                terapias = terapiasResponse.data;
              } catch (error) {
                console.error("Error obteniendo terapias de fisioterapia:", error);
              }
            }
            return { ...diagnostico, procedimientos: procedimientosResponse.data, terapias };
          })
        );
        setDiagnosticos(diagnosticosConDetalles);

        // Se normaliza la respuesta de prescripciones por si viene envuelta en un array extra.
        const prescripcionesData = Array.isArray(presRes.data[0]) ? presRes.data[0] : presRes.data;
        
        // Se obtienen los datos de morbilidad.
        const morbilidadData = morbRes.data[0] || null;

        // Se verifica si existen datos de morbilidad y si 'sistemas_afectados' es un string.
        if (morbilidadData && morbilidadData.sistemas_afectados && typeof morbilidadData.sistemas_afectados === 'string') {
          // Si es un string, se convierte a un array usando la coma como separador.
          morbilidadData.sistemas_afectados = morbilidadData.sistemas_afectados.split(',');
        }

        if (morbilidadData && Array.isArray(morbilidadData.sistemas_afectados)) {
          // Se limpia cada elemento del array para quitar cualquier llave o caracter no deseado.
          morbilidadData.sistemas_afectados = morbilidadData.sistemas_afectados.map(
            (sistema) => sistema.replace(/[{}]/g, '')
          );
        }
        
        // Se actualizan todos los estados individuales con los datos correspondientes.
        setPreventiva(prevRes.data[0] || null);
        setVigilancias(vigiRes.data);
        setMorbilidad(morbilidadData); // Se guarda el objeto de morbilidad ya procesado.
        setPrescripciones(prescripcionesData);
        setIndicaciones(indiRes.data);
        setSignosAlarma(signosRes.data);
        setReferencias(refRes.data);

      } catch (error) {
        // En caso de error, se muestra un mensaje detallado en la consola del navegador.
        console.error("Error al obtener los detalles completos de la atención:", error);
      }
    };
    
    // Se invoca la función para que se ejecute.
    fetchData();
  }, [selectedAtencion]); // La dependencia del efecto es 'selectedAtencion'.

  // --- MANEJADORES DE EVENTOS ---
  // Función que se ejecuta al hacer clic en una fila de atención para abrir el modal.
  const openModal = (atencion) => {
    // Se guarda la atención seleccionada en el estado, lo que dispara el useEffect anterior.
    setSelectedAtencion(atencion);
    // Se actualiza el estado para hacer visible el modal.
    setIsModalOpen(true);
  };

  // Función que se ejecuta al cerrar el modal.
  const closeModal = () => {
    // Se actualiza el estado para ocultar el modal.
    setIsModalOpen(false);
    // Se resetean todos los estados a sus valores iniciales para limpiar el modal.
    setSelectedAtencion(null);
    setDiagnosticos([]);
    setTriaje(null);
    setPreventiva(null);
    setVigilancias([]);
    setMorbilidad(null);
    setPrescripciones([]);
    setIndicaciones([]);
    setSignosAlarma([]);
    setReferencias([]);
  };

  // --- RENDERIZADO DEL COMPONENTE ---
  // Devuelve la estructura JSX que se mostrará en la pantalla.
  return (
    // Contenedor principal del componente, con una clase del módulo CSS.
    <div className={styles['atencion-list']}>
      {/* Tabla que muestra la lista de atenciones. */}
      <table className={styles['tabla-atenciones']}>
        {/* Cabecera de la tabla. */}
        <thead>
          {/* Fila de la cabecera. */}
          <tr>
            {/* Celda de cabecera para la Fecha. */}
            <th className={styles['col-fecha']}>Fecha</th>
            {/* Celda de cabecera para el Motivo. */}
            <th className={styles['col-motivo']}>Motivo</th>
            {/* Celda de cabecera para Especialidad (se muestra condicionalmente). */}
            {mostrarEspecialidad && <th className={styles['col-especialidad']}>Especialidad</th>}
            {/* Celda de cabecera para el Especialista. */}
            <th className={styles['col-especialista']}>Especialista</th>
          </tr>
        </thead>
        {/* Cuerpo de la tabla. */}
        <tbody>
          {/* Se mapea el array de 'atenciones' para crear una fila por cada una. */}
          {atenciones.map((atencion) => (
            // Fila de la tabla para una atención. La 'key' es fundamental para React.
            <tr key={atencion.aten_cod_aten}>
              {/* Celda para la fecha y hora, formateada. */}
              <td className={styles['col-fecha']}>{`${formatDateDDMMYYYY(atencion.aten_fec_aten)} - ${atencion.aten_hor_aten ? new Date(`1970-01-01T${atencion.aten_hor_aten}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`}</td>
              {/* Celda para el motivo. Al hacer clic, abre el modal. */}
              <td className={`${styles['col-motivo']} ${styles['motivo-truncado']}`} onClick={() => openModal(atencion)}>{atencion.aten_mot_cons}</td>
              {/* Celda para la especialidad (se muestra condicionalmente). */}
              {mostrarEspecialidad && (
                <td className={styles['col-especialidad']}>
                  {/* Muestra el ícono de la especialidad. */}
                  <span className={styles['especialidad-icon']}>{getEspecialidadIcon(atencion.aten_esp_aten)}</span>
                  {/* Muestra el nombre de la especialidad. */}
                  <span>{atencion.aten_esp_aten}</span>
                </td>
              )}
              {/* Celda para el nombre del especialista. */}
              <td className={styles['col-especialista']}>{atencion.medic_nom_medic}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Componente Modal para mostrar los detalles de la atención seleccionada. */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Detalles de la Atención">
        {/* El contenido del modal solo se renderiza si hay una atención seleccionada en el estado. */}
        {selectedAtencion && (
          // Contenedor principal para todos los detalles dentro del modal.
          <div className={styles['details-section']}>
            
            {/* Sección de Información Básica con su layout de cuadrícula. */}
            <div className={styles['atencion-info-basica']}>
              <div className={styles['info-item']}><strong>Fecha</strong><span>{formatDateDDMMYYYY(selectedAtencion.aten_fec_aten)}</span></div>
              <div className={styles['info-item']}><strong>Hora</strong><span>{selectedAtencion.aten_hor_aten ? new Date(`1970-01-01T${selectedAtencion.aten_hor_aten}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "No registrada"}</span></div>
              <div className={styles['info-item']}><strong>Especialidad</strong><span>{selectedAtencion.aten_esp_aten}</span></div>
              <div className={styles['info-item']}><strong>Especialista</strong><span>{selectedAtencion.medic_nom_medic}</span></div>
              <div className={`${styles['info-item']} ${styles['item-full-width']}`}><strong>Motivo</strong><span>{selectedAtencion.aten_mot_cons}</span></div>
              <div className={`${styles['info-item']} ${styles['item-full-width']}`}><strong>Enfermedad Actual</strong><span>{selectedAtencion.aten_enf_actu}</span></div>
              {selectedAtencion.aten_num_sesi && (<div className={styles['info-item']}><strong>Sesión N°</strong><span>{selectedAtencion.aten_num_sesi}</span></div>)}
            </div>

            {/* Sección de Datos Adicionales (se muestra condicionalmente). */}
            {(preventiva || vigilancias?.length > 0 || morbilidad) && (
              <>
                <h4>DATOS ADICIONALES</h4>
                <div className={styles['additional-info-grid']}>
                  {preventiva && (<div className={styles['info-item']}><strong>Tipo Preventivo</strong><span>{preventiva.prev_tip_prev}</span></div>)}
                  {vigilancias?.length > 0 && (<div className={styles['info-item']}><strong>Vigilancia Epidemiológica</strong><ul>{vigilancias.map((v, i) => (<li key={i}>{v}</li>))}</ul></div>)}
                  {morbilidad && (
                    <>
                      <div className={styles['info-item']}><strong>Tipo Morbilidad</strong><span>{morbilidad.morb_tip_morb}</span></div>
                      {morbilidad.sistemas_afectados?.length > 0 && (<div className={styles['info-item']}><strong>Sistemas Afectados</strong><ul>{morbilidad.sistemas_afectados.map((s, i) => (<li key={i}>{s}</li>))}</ul></div>)}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Sección de Triaje (se muestra condicionalmente si hay datos de triaje). */}
            {triaje && (
              <>
                <h4>DATOS DE TRIAJE</h4>
                <div className={styles['triaje-grid']}>
                  <div className={styles['triaje-item']}> <FavoriteIcon className={styles['triaje-icon']} style={{ color: '#f44336' }} /> <span><strong>Frec. Cardíaca:</strong> {triaje.triaj_fca_triaj || '--'} lpm</span> </div>
                  <div className={styles['triaje-item']}> <AirIcon className={styles['triaje-icon']} style={{ color: '#03a9f4' }} /> <span><strong>Frec. Respiratoria:</strong> {triaje.triaj_fre_triaj || '--'} rpm</span> </div>
                  <div className={styles['triaje-item']}> <SpeedIcon className={styles['triaje-icon']} style={{ color: '#2196f3' }} /> <span><strong>Presión Arterial:</strong> {triaje.triaj_par_triaj || '--'} mmHg</span> </div>
                  <div className={styles['triaje-item']}> <ThermostatIcon className={styles['triaje-icon']} style={{ color: '#ff9800' }} /> <span><strong>Temperatura:</strong> {triaje.triaj_tem_triaj || '--'} °C</span> </div>
                  <div className={styles['triaje-item']}> <MonitorWeightIcon className={styles['triaje-icon']} style={{ color: '#673ab7' }} /> <span><strong>Peso:</strong> {triaje.triaj_pes_triaj || '--'} kg</span> </div>
                  <div className={styles['triaje-item']}> <HeightIcon className={styles['triaje-icon']} style={{ color: '#795548' }} /> <span><strong>Talla:</strong> {triaje.triaj_tal_triaj || '--'} cm</span> </div>
                  <div className={styles['triaje-item']}> <CalculateIcon className={styles['triaje-icon']} style={{ color: '#4caf50' }} /> <span><strong>IMC:</strong> {triaje.triaj_imc_triaj || '--'}</span> </div>
                  <div className={styles['triaje-item']}> <StraightenIcon className={styles['triaje-icon']} style={{ color: '#9c27b0' }} /> <span><strong>Per. Abdominal:</strong> {triaje.triaj_pab_triaj || '--'} cm</span> </div>
                  <div className={styles['triaje-item']}> <LocalHospitalIcon className={styles['triaje-icon']} style={{ color: '#e91e63' }} /> <span><strong>SpO₂:</strong> {triaje.triaj_sat_triaj || '--'}%</span> </div>
                </div>
                {triaje.triaj_obs_triaj && (<div className={styles['triaje-observaciones']}><strong>Observaciones de Triaje:</strong> {triaje.triaj_obs_triaj}</div>)}
              </>
            )}

            {/* Sección de Diagnósticos (se muestra si hay al menos un diagnóstico). */}
            {diagnosticos.length > 0 ? (
              <>
                <h4>DIAGNÓSTICOS</h4>
                {diagnosticos.map((diag) => (
                  <div key={diag.diag_cod_diag} className={styles['diagnostico-card']}>
                    <div className={styles['diagnostico-header']}>
                      <div className={styles['diagnostico-header-item']}><strong>CIE10:</strong><span>{diag.cie10_id_cie10}</span></div>
                      <div className={styles['diagnostico-header-item']}><strong>Diagnóstico:</strong><span>{diag.cie10_nom_cie10}</span></div>
                      <div className={styles['diagnostico-header-item']}><strong>Estado:</strong><span>{diag.diag_est_diag}</span></div>
                      <div className={styles['diagnostico-header-item']}><strong>Observación:</strong><span>{diag.diag_obs_diag || '-'}</span></div>
                    </div>
                    {(diag.procedimientos?.length > 0 || diag.terapias?.length > 0) && (
                      <table className={styles['procedimiento-table']}>
                        <thead><tr><th>Código</th><th>Procedimiento / Terapia</th><th>Observación / Técnicas</th></tr></thead>
                        <tbody>
                          {diag.procedimientos?.map((p) => (<tr key={p.proc_cod_proc}><td>{p.pro10_ide_pro10}</td><td>{p.pro10_nom_pro10}</td><td>{p.proc_obs_proc}</td></tr>))}
                          {diag.terapias?.map((t) => (<tr key={t.terap_cod_terap} className={styles['terapia-row']}><td>TERAPIA</td><td>{t.terap_nom_terap}</td><td>{t.terap_tec_terap.map((tec, i) => (<div key={i}>{tec}</div>))}</td></tr>))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </>
            ) : (<p className={styles['no-data-message']}>No hay diagnósticos registrados.</p>)}
            
            {/* Sección de Prescripciones (se muestra si hay al menos una prescripción). */}
            {prescripciones?.length > 0 && (
              <>
                <h4>PRESCRIPCIONES MÉDICAS</h4>
                <table className={styles['prescripciones-table']}>
                  <thead><tr><th>Medicamento</th><th>Cantidad</th><th>Dosis</th><th>Vía</th><th>Frecuencia</th><th>Duración</th><th>Indicaciones</th></tr></thead>
                  <tbody>{prescripciones.map((p) => (<tr key={p.pres_cod_pres}><td>{p.pres_nom_prod}</td><td>{p.pres_can_pres}</td><td>{p.pres_dos_pres}</td><td>{p.pres_adm_pres}</td><td>{p.pres_fre_pres}</td><td>{p.pres_dur_pres} días</td><td>{p.pres_ind_pres || "-"}</td></tr>))}</tbody>
                </table>
              </>
            )}
            
            {/* Sección de Indicaciones (se muestra si hay al menos una indicación). */}
            {indicaciones?.length > 0 && (
              <>
                <h4>INDICACIONES</h4>
                <table className={styles['indicaciones-table']}>
                  <tbody>{indicaciones.map((i) => (<tr key={i.indi_cod_indi}><td>{i.indi_des_indi}</td></tr>))}</tbody>
                </table>
              </>
            )}

            {/* Sección de Signos de Alarma (se muestra si hay al menos un signo de alarma). */}
            {signosAlarma?.length > 0 && (
              <>
                <h4>SIGNOS DE ALARMA</h4>
                <table className={styles['indicaciones-table']}>
                  <tbody>{signosAlarma.map((s) => (<tr key={s.signa_cod_signa}><td>{s.signa_des_signa}</td></tr>))}</tbody>
                </table>
              </>
            )}

            {/* Sección de Referencias (se muestra si hay al menos una referencia). */}
            {referencias?.length > 0 && (
              <>
                <h4>REFERENCIAS</h4>
                <table className={styles['referencias-table']}>
                   <tbody>{referencias.map((r) => (<tr key={r.refe_cod_refe}><td>{r.refe_des_refe}</td></tr>))}</tbody>
                </table>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// --- VALIDACIÓN DE PROPS ---
// Se definen los tipos esperados para las props del componente.
AtencionList.propTypes = {
  // 'atenciones' debe ser un array de objetos con una forma específica y es requerida.
  atenciones: PropTypes.arrayOf(PropTypes.shape({
    aten_cod_aten: PropTypes.string.isRequired,
    aten_fec_aten: PropTypes.string.isRequired,
    aten_mot_cons: PropTypes.string.isRequired,
    aten_esp_aten: PropTypes.string,
    medic_nom_medic: PropTypes.string
  })).isRequired,
  // 'mostrarEspecialidad' debe ser un booleano y es requerido.
  mostrarEspecialidad: PropTypes.bool.isRequired,
};

// --- EXPORTACIÓN DEL COMPONENTE ---
// Se exporta el componente para que pueda ser utilizado en otras partes de la aplicación.
export default AtencionList;