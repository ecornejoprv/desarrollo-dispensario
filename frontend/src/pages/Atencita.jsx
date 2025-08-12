// src/pages/Atencita.jsx (Código Absolutamente Completo y Final)
// ==============================================================================
// @summary: Este componente es el "espacio de trabajo" para una cita específica.
//           Renderiza su contenido de forma condicional basado en un 'modo'
//           ('triaje' o 'postconsulta') recibido a través de la navegación.
//           Incluye estilos completos para los modales para asegurar una correcta
//           visualización y orden de capas (z-index).
// ==============================================================================

// --- 1. IMPORTACIONES ---
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../api";
import styles from "./styles/enfermaten.module.css";
import Modal from 'react-modal';
import { FileText, PlusSquare, Power } from 'lucide-react';

// Se vincula el modal al elemento raíz de la aplicación para temas de accesibilidad.
Modal.setAppElement('#root');

// --- 2. DEFINICIÓN DEL COMPONENTE ---
const Atencita = () => {
  // --- HOOKS ---
  const location = useLocation();
  const navigate = useNavigate();
  
  // Se extrae el objeto 'cita' y el 'mode' pasados desde la página anterior.
  const { cita, mode } = location.state || {};
  
  // --- ESTADOS ---
  const [successMessage, setSuccessMessage] = useState("");
  // Se extraen los nombres para mostrarlos en la UI de forma segura, con valores por defecto.
  const nombrePaciente = cita?.paciente ? `${cita.paciente.pacie_nom_pacie} ${cita.paciente.pacie_ape_pacie}` : "Paciente no disponible";
  const nombreMedico = cita?.medico?.medic_nom_medic || "Médico no disponible";
  
  // Estados para controlar el modal de actividades de post-consulta.
  const [modalPostconsultaIsOpen, setModalPostconsultaIsOpen] = useState(false);
  const [actividadesPostconsulta, setActividadesPostconsulta] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para controlar el modal de prescripciones.
  const [modalPrescripcionesIsOpen, setModalPrescripcionesIsOpen] = useState(false);
  const [prescripciones, setPrescripciones] = useState({ empresa: [], externa: [] });
  const [loadingPrescripciones, setLoadingPrescripciones] = useState(false);
  const [errorPrescripciones, setErrorPrescripciones] = useState(null);
  const [diagnostico, setDiagnostico] = useState("");

  // Estado para el formulario de triaje.
  const [formData, setFormData] = useState({
    triaj_cod_cita: cita ? cita.cita_cod_cita : "",
    triaj_par_triaj: "",
    triaj_tem_triaj: "",
    triaj_fca_triaj: "",
    triaj_fre_triaj: "",
    triaj_pes_triaj: "",
    triaj_tal_triaj: "",
    triaj_imc_triaj: "",
    triaj_pab_triaj: "",
    triaj_obs_triaj: "",
    triaj_niv_urge: "Sin urgencia",
    triaj_sat_triaj: "",
    triaj_exl_triaj: false,
    triaj_exi_triaj: false,
    mostrarSignosVitales: false,
    mostrarMedidasAntropometricas: false,
  });
  const [editingTriaje, setEditingTriaje] = useState(null);

  // --- FUNCIONES ASÍNCRONAS ---

  // Obtiene las prescripciones y diagnósticos asociados a la cita actual.
  const fetchPrescripciones = async () => {
    setLoadingPrescripciones(true);
    setErrorPrescripciones(null);
    try {
      if (!cita?.cita_cod_cita) throw new Error("No hay información de cita disponible");
      
      const { data: prescData } = await api.get(`/api/v1/triajes/prescripciones/${cita.cita_cod_cita}`);
      const { data: diagData } = await api.get(`/api/v1/triajes/detalles-cita/${cita.cita_cod_cita}`);

      setPrescripciones(prescData);
      setDiagnostico(diagData.length > 0 ? diagData[0].cie10_nom_cie10 : "No especificado");
    } catch (error) {
      console.error("Error al obtener prescripciones:", error);
      setErrorPrescripciones("Error al cargar las prescripciones");
    } finally {
      setLoadingPrescripciones(false);
    }
  };

  // Abre el modal de prescripciones.
  const openModalPrescripciones = async () => {
    await fetchPrescripciones();
    setModalPrescripcionesIsOpen(true);
  };

  // Cierra el modal de prescripciones.
  const closeModalPrescripciones = () => {
    setModalPrescripcionesIsOpen(false);
  };
  
  // Efecto para limpiar el mensaje de éxito después de 5 segundos.
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => { setSuccessMessage(""); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Cambia el estado de la cita a "Atención Médica" (AM) y redirige al dashboard.
  const cerrarPostconsulta = async () => {
    if (!window.confirm('¿Estás seguro de cerrar la postconsulta? Esta acción no se puede deshacer.')) return;
    try {
      if (!cita?.cita_cod_cita) throw new Error("No hay información de cita disponible");
      
      const response = await api.put(`/api/v1/citas/${cita.cita_cod_cita}/estado`, { estado: "AM" });

      if (response.data.success) {
        alert("Postconsulta cerrada correctamente");
        navigate('/enfermeria'); // Vuelve al dashboard de enfermería
      } else {
        throw new Error(response.data.message || "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error al cerrar postconsulta:", error);
      alert(error.message || "Error al cerrar la postconsulta");
    }
  };

  // Obtiene la lista de actividades de postconsulta desde el backend.
  const fetchActividadesPostconsulta = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/v1/citas/tiposactividades?tipo=POSTCONSULTA,ADMINISTRATIVAS");
      const actividadesData = data.data || [];
      setActividadesPostconsulta(actividadesData);
      const initialSelection = {};
      actividadesData.forEach(act => { initialSelection[act.acti_cod_acti] = false; });
      setSelectedActivities(initialSelection);
    } catch (err) {
      console.error("Error al obtener actividades de postconsulta:", err);
      setError("Error al cargar actividades de postconsulta");
    } finally {
      setLoading(false);
    }
  };

  // Abre el modal de actividades de postconsulta.
  const openModalPostconsulta = async () => {
    await fetchActividadesPostconsulta();
    setModalPostconsultaIsOpen(true);
  };

  // Cierra el modal de actividades de postconsulta.
  const closeModalPostconsulta = () => {
    setModalPostconsultaIsOpen(false);
    setSelectedActivities({});
  };

  // Maneja el estado de los checkboxes de actividades.
  const handleCheckboxChange = (acti_cod_acti) => {
    setSelectedActivities(prev => ({ ...prev, [acti_cod_acti]: !prev[acti_cod_acti] }));
  };

  // Guarda las actividades de postconsulta seleccionadas.
  const guardarActividades = async () => {
    try {
      const especialistaId = localStorage.getItem("especialista");
      if (!especialistaId) throw new Error("No se encontró información del especialista.");
      const actividadesSeleccionadas = Object.keys(selectedActivities).filter(key => selectedActivities[key]).map(key => parseInt(key));
      if (actividadesSeleccionadas.length === 0) throw new Error("Debe seleccionar al menos una actividad");
      const response = await api.post("/api/v1/citas/actividades/registrar", {
        actividades: actividadesSeleccionadas,
        medicoId: parseInt(especialistaId),
        citaId: cita.cita_cod_cita,
        pacienteId: cita.paciente.pacie_cod_pacie,
        fecha: new Date().toISOString()
      });
      if (response.data.success) {
        closeModalPostconsulta();
        alert(response.data.message || "Actividades registradas correctamente");
        setSelectedActivities({});
      } else {
        throw new Error(response.data.error || "Error al registrar actividades");
      }
    } catch (error) {
      console.error("Error al guardar actividades:", error);
      alert(error.message || "Error al guardar las actividades");
    }
  };

  // Maneja los cambios en los inputs del formulario de triaje.
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // Envía el formulario de triaje para crear o actualizar un registro.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        triaj_exl_triaj: formData.triaj_exl_triaj ? 1 : 0,
        triaj_exi_triaj: formData.triaj_exi_triaj ? 1 : 0,
      };
      delete dataToSend.mostrarSignosVitales;
      delete dataToSend.mostrarMedidasAntropometricas;
      if (editingTriaje) {
        await api.put(`/api/v1/triajes/${editingTriaje.triaj_cod_triaj}`, dataToSend);
        setSuccessMessage("¡Triaje actualizado exitosamente!");
      } else {
        await api.post("/api/v1/triajes", dataToSend);
        setSuccessMessage("¡Triaje creado exitosamente!");
      }
      setFormData({
        triaj_cod_cita: cita ? cita.cita_cod_cita : "",
        triaj_par_triaj: "", triaj_tem_triaj: "", triaj_fca_triaj: "", triaj_fre_triaj: "",
        triaj_pes_triaj: "", triaj_tal_triaj: "", triaj_imc_triaj: "", triaj_pab_triaj: "",
        triaj_obs_triaj: "", triaj_niv_urge: "Sin urgencia", triaj_sat_triaj: "",
        triaj_exl_triaj: false, triaj_exi_triaj: false, mostrarSignosVitales: false,
        mostrarMedidasAntropometricas: false,
      });
      setEditingTriaje(null);
    } catch (error) {
      console.error("Error al guardar triaje:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  // Prepara el formulario para editar un triaje existente.
  const handleEdit = (triaje) => {
    setFormData({
      ...triaje,
      triaj_exl_triaj: triaje.triaj_exl_triaj === 1,
      triaj_exi_triaj: triaje.triaj_exi_triaj === 1,
      mostrarSignosVitales: !!(triaje.triaj_par_triaj || triaje.triaj_tem_triaj || triaje.triaj_fca_triaj || triaje.triaj_fre_triaj),
      mostrarMedidasAntropometricas: !!(triaje.triaj_pes_triaj || triaje.triaj_tal_triaj || triaje.triaj_imc_triaj || triaje.triaj_pab_triaj),
    });
    setEditingTriaje(triaje);
  };
  
  // --- 3. RENDERIZADO DEL COMPONENTE (JSX) ---
  return (
    <div className={styles["aten-enfer-container"]}>
      {/* Sección de información de la cita, siempre visible */}
      {cita && (
        <div className={styles["cita-info"]}>
          <div style={{ flexGrow: 1 }}>
            <h2>{mode === 'triaje' ? 'Ingreso de Triaje' : 'Gestión de Post-Consulta'}</h2>
            <p><strong>Paciente:</strong> {nombrePaciente}</p>
            <p><strong>Médico:</strong> {nombreMedico}</p>
            <p><strong>Fecha:</strong> {new Date(cita.cita_fec_cita).toLocaleDateString()}</p>
          </div>
        </div>
      )}
      
      {/* Renderizado condicional: Muestra las acciones de post-consulta si el modo es 'postconsulta' */}
      {mode === 'postconsulta' && (
        <div className={styles["post-consulta-actions"]}>
          <h4>Acciones de Post-Consulta</h4>
          <div className={styles["action-buttons-container"]}>
            <button className={styles["action-button"]} onClick={openModalPrescripciones}>
              <FileText size={16} /> Ver Prescripciones
            </button>
            <button className={`${styles["action-button"]} ${styles["btn-primary"]}`} onClick={openModalPostconsulta}>
              <PlusSquare size={16} /> Agregar Actividades
            </button>
            <button className={`${styles["action-button"]} ${styles["btn-danger"]}`} onClick={cerrarPostconsulta}>
              <Power size={16} /> Cerrar Post-Consulta
            </button>
          </div>
        </div>
      )}

      {/* Renderizado condicional: Muestra el formulario de triaje si el modo es 'triaje' */}
      {mode === 'triaje' && (
        <form onSubmit={handleSubmit} className={styles["aten-enfer-form"]}>
          <h2>Registro de Triaje</h2>
          <div className={styles["form-group"]}><label>Nivel de Urgencia:</label><select name="triaj_niv_urge" value={formData.triaj_niv_urge} onChange={handleInputChange} className={styles["select-urgencia"]}><option value="Sin urgencia">Sin urgencia</option><option value="Urgencia menor">Urgencia Menor</option><option value="Urgencia">Urgencia</option><option value="Emergencia">Emergencia</option><option value="Reanimación">Reanimación</option></select></div>
          <div className={styles["form-group"]}><label><input type="checkbox" name="mostrarSignosVitales" checked={formData.mostrarSignosVitales} onChange={handleInputChange} /> Signos Vitales</label></div>
          {formData.mostrarSignosVitales && ( <div className={styles['form-grid']}><div className={styles["form-group"]}><label>Presión Arterial:</label><input type="text" name="triaj_par_triaj" placeholder="Ej: 120/80" value={formData.triaj_par_triaj} onChange={handleInputChange} /></div><div className={styles["form-group"]}><label>Temperatura (°C):</label><input type="number" name="triaj_tem_triaj" placeholder="Ej: 36.5" value={formData.triaj_tem_triaj} onChange={handleInputChange} /></div><div className={styles["form-group"]}><label>Frecuencia Cardíaca (lpm):</label><input type="number" name="triaj_fca_triaj" placeholder="Ej: 80" value={formData.triaj_fca_triaj} onChange={handleInputChange} /></div><div className={styles["form-group"]}><label>Saturación de oxígeno:</label><input type="number" name="triaj_sat_triaj" placeholder="Ej: 98" value={formData.triaj_sat_triaj} onChange={handleInputChange} /></div><div className={styles["form-group"]}><label>Frecuencia respiratoria (rpm):</label><input type="number" name="triaj_fre_triaj" placeholder="Ej: 15" value={formData.triaj_fre_triaj} onChange={handleInputChange} /></div></div> )}
          <div className={styles["form-group"]}><label><input type="checkbox" name="mostrarMedidasAntropometricas" checked={formData.mostrarMedidasAntropometricas} onChange={handleInputChange}/> Medidas Antropométricas</label></div>
          {formData.mostrarMedidasAntropometricas && ( <div className={styles['form-grid']}><div className={styles["form-group"]}><label>Peso (kg):</label><input type="number" name="triaj_pes_triaj" placeholder="Ej: 70" value={formData.triaj_pes_triaj} onChange={handleInputChange} /></div><div className={styles["form-group"]}><label>Talla (cm):</label><input type="number" name="triaj_tal_triaj" placeholder="Ej: 170" value={formData.triaj_tal_triaj} onChange={handleInputChange} /></div><div className={styles["form-group"]}><label>IMC:</label><input type="number" name="triaj_imc_triaj" placeholder="Ej: 24.5" value={formData.triaj_imc_triaj} onChange={handleInputChange} /></div><div className={styles["form-group"]}><label>Perímetro Abdominal (cm):</label><input type="number" name="triaj_pab_triaj" placeholder="Ej: 90" value={formData.triaj_pab_triaj} onChange={handleInputChange} /></div></div> )}
          <div className={styles["form-group"]}><label><input type="checkbox" name="triaj_exl_triaj" checked={formData.triaj_exl_triaj} onChange={handleInputChange}/> Examen de Laboratorio</label></div>
          <div className={styles["form-group"]}><label><input type="checkbox" name="triaj_exi_triaj" checked={formData.triaj_exi_triaj} onChange={handleInputChange}/> Examen de Imágenes</label></div>
          <div className={styles["form-group"]}><label>Observaciones:</label><textarea name="triaj_obs_triaj" placeholder="Observaciones de triaje" value={formData.triaj_obs_triaj} onChange={handleInputChange} /></div>
          {successMessage && (<div className={styles["success-message"]}>{successMessage}</div>)}
          <button type="submit" className={`${styles.actionButton} ${styles.btnPrimary} ${styles.formSubmitButton}`}>{editingTriaje ? "Actualizar" : "Crear"}</button>
        </form>
      )}

      {/* Modal para Prescripciones con estilos y z-index */}
      <Modal 
        isOpen={modalPrescripcionesIsOpen} 
        onRequestClose={closeModalPrescripciones} 
        contentLabel="Prescripciones Médicas"
        style={{
          content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '800px', maxHeight: '90vh', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: 'none' },
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1050 }
        }}
      >
        <h2 style={{marginTop: 0}}>Prescripciones</h2>
        {loadingPrescripciones ? <p>Cargando...</p> : errorPrescripciones ? <p>{errorPrescripciones}</p> : (
            <div>
                <h3>Medicamentos Empresa</h3>
                {prescripciones.empresa.length > 0 ? (<ul>{prescripciones.empresa.map((p, i) => <li key={i}>{p.producto}</li>)}</ul>) : <p>No hay prescripciones de empresa.</p>}
                <h3>Medicamentos Externos</h3>
                {prescripciones.externa.length > 0 ? (<ul>{prescripciones.externa.map((p, i) => <li key={i}>{p.producto}</li>)}</ul>) : <p>No hay prescripciones externas.</p>}
            </div>
        )}
        <button onClick={closeModalPrescripciones} style={{marginTop: '1rem', float: 'right'}}>Cerrar</button>
      </Modal>
      
      {/* Modal para Actividades de Post-Consulta con estilos y z-index */}
      <Modal 
        isOpen={modalPostconsultaIsOpen} 
        onRequestClose={closeModalPostconsulta} 
        contentLabel="Seleccionar Actividades de Postconsulta"
        style={{
          content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '800px', maxHeight: '90vh', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: 'none' },
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1050 }
        }}
      >
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '1rem', flexShrink: 0 }}>Seleccionar Actividades</h3>
        {loading ? <p>Cargando...</p> : error ? <p style={{color: 'red'}}>{error}</p> : (
          <>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem 0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                {actividadesPostconsulta.map(actividad => (
                    <div key={actividad.acti_cod_acti} style={{ display: 'flex', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                        <input type="checkbox" checked={selectedActivities[actividad.acti_cod_acti] || false} onChange={() => handleCheckboxChange(actividad.acti_cod_acti)} style={{ width: '18px', height: '18px' }} />
                        {actividad.acti_nom_acti}
                      </label>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', flexShrink: 0 }}>
              <button onClick={closeModalPostconsulta} className="button-secondary" style={{padding: '8px 16px', borderRadius: '5px', border: '1px solid #6c757d', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer'}}>Cancelar</button>
              <button onClick={guardarActividades} className="button-primary" style={{padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: '#007bff', color: 'white'}}>Guardar Actividades</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Atencita;