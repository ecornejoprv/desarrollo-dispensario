import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./styles/enfermaten.module.css";
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Enfermeria = () => {
  const location = useLocation();
  const { cita } = location.state || {};

  // Verifica si los datos del paciente y del médico están disponibles
  const nombrePaciente = cita?.paciente
    ? `${cita.paciente.pacie_nom_pacie} ${cita.paciente.pacie_ape_pacie}`
    : "Paciente no disponible";

  const nombreMedico = cita?.medico
    ? `${cita.medico.medic_nom_medic} ${cita.medico.medic_ape_medic}`
    : "Médico no disponible";

  const [modalPostconsultaIsOpen, setModalPostconsultaIsOpen] = useState(false);
  const [actividadesPostconsulta, setActividadesPostconsulta] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    triaj_niv_urge: null,
    triaj_sat_triaj: null,
    triaj_exl_triaj: false,
    triaj_exi_triaj: false,
    mostrarSignosVitales: false,
    mostrarMedidasAntropometricas: false,
  });
  const [editingTriaje, setEditingTriaje] = useState(null);

  // Obtener el nombre del médico
  useEffect(() => {
    if (!cita) {
      console.log('No hay datos de cita');
      return;
    }
  
    console.log('Datos de la cita:', cita); // Debug
  
    if (!cita.cita_cod_medi) {
      console.log('La cita no tiene código de médico');
      setNombreMedico("Médico no disponible");
      return;
    }
  
    const fetchMedico = async () => {
      const medico = await fetchMedicoById(cita.cita_cod_medi);
      
      if (medico) {
        const nombreCompleto = `${medico.medic_nom_medic} ${medico.medic_ape_medic}`.trim();
        console.log('Nombre médico obtenido:', nombreCompleto); // Debug
        setNombreMedico(nombreCompleto || "Médico no disponible");
      } else {
        console.log('No se pudo obtener información del médico');
        setNombreMedico("Médico no disponible");
      }
    };
  
    fetchMedico();
  }, [cita]);
  // Función para obtener médico por ID
  const fetchMedicoById = async (codMedico) => {
    try {
      console.log(`Buscando médico con ID: ${codMedico}`); // Debug
      const { data } = await axios.get(`/api/v1/medicos/${codMedico}`);
      console.log('Datos recibidos del médico:', data); // Debug
      
      // Verifica la estructura de la respuesta
      if (!data) {
        console.error('La respuesta está vacía');
        return null;
      }
      
      // Asegúrate de que los campos existen
      if (data.medic_nom_medic && data.medic_ape_medic) {
        return data;
      } else {
        console.error('Estructura inesperada del médico:', data);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener médico:', error.response || error);
      return null;
    }
  };
  // Función para obtener actividades de postconsulta
  const fetchActividadesPostconsulta = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/v1/tiposactividades?tipo=POSTCONSULTA");
      
      // Asegurarse de que data es un array
      const actividadesData = Array.isArray(data) ? data : (data.data || []);
      
      setActividadesPostconsulta(actividadesData);
      
      // Inicializar el estado de selección
      const initialSelection = {};
      actividadesData.forEach(act => {
        initialSelection[act.acti_cod_acti] = false;
      });
      setSelectedActivities(initialSelection);
    } catch (err) {
      console.error("Error al obtener actividades de postconsulta:", err);
      setError("Error al cargar actividades de postconsulta");
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el modal y cargar las actividades
  const openModalPostconsulta = async () => {
    try {
      await fetchActividadesPostconsulta();
      setModalPostconsultaIsOpen(true);
    } catch (error) {
      console.error("Error al abrir modal:", error);
      alert("No se pudieron cargar las actividades de postconsulta");
    }
  };

  // Función para cerrar el modal
  const closeModalPostconsulta = () => {
    setModalPostconsultaIsOpen(false);
    setSelectedActivities({});
  };

  // Función para manejar cambios en los checkboxes
  const handleCheckboxChange = (acti_cod_acti) => {
    setSelectedActivities(prev => ({
      ...prev,
      [acti_cod_acti]: !prev[acti_cod_acti]
    }));
  };

  // Función para guardar las actividades seleccionadas
  const guardarActividades = async () => {
    try {
      // Obtener datos del usuario desde localStorage
      const userData = JSON.parse(localStorage.getItem("especialista"));
    
      
      if (!userData) {
        throw new Error("No se encontró información del médico. Por favor inicie sesión nuevamente.");
      }


      // Preparar actividades seleccionadas (solo los IDs)
      const actividadesSeleccionadas = Object.keys(selectedActivities)
        .filter(key => selectedActivities[key])
        .map(key => parseInt(key));

      if (actividadesSeleccionadas.length === 0) {
        throw new Error("Debe seleccionar al menos una actividad");
      }

      // Enviar al backend
      const response = await axios.post("/api/v1/actividades/registrar", {
        actividades: actividadesSeleccionadas,
        medicoId: userData,
        citaId: cita.cita_cod_cita,
        pacienteId: cita.paciente.pacie_cod_pacie,
        fecha: new Date().toISOString().split('T')[0]
      });

      if (response.data.success) {
        closeModalPostconsulta();
        alert(response.data.message || "Actividades registradas correctamente");
        
        // Opcional: Resetear selecciones
        setSelectedActivities({});
      } else {
        throw new Error(response.data.error || "Error al registrar actividades");
      }
    } catch (error) {
      console.error("Error al guardar actividades:", error);
      alert(error.message || "Error al guardar las actividades");
    }
  };

  // Función para manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Función para crear o actualizar un triaje
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        triaj_exl_triaj: formData.triaj_exl_triaj ? 1 : 0,
        triaj_exi_triaj: formData.triaj_exi_triaj ? 1 : 0,
      };

      if (editingTriaje) {
        await axios.put(`/api/v1/triaje/${editingTriaje.triaj_cod_triaj}`, dataToSend);
      } else {
        await axios.post("/api/v1/triaje", dataToSend);
      }
      
      setFormData({
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
        triaj_niv_urge: null,
        triaj_sat_triaj: null,
        triaj_exl_triaj: false,
        triaj_exi_triaj: false,
        mostrarSignosVitales: false,
        mostrarMedidasAntropometricas: false,
      });
      setEditingTriaje(null);
    } catch (error) {
      console.error("Error saving triaje:", error);
    }
  };

  // Función para editar un triaje
  const handleEdit = (triaje) => {
    setFormData({
      ...triaje,
      triaj_exl_triaj: triaje.triaj_exl_triaj === 1,
      triaj_exi_triaj: triaje.triaj_exi_triaj === 1,
      mostrarSignosVitales: !!triaje.triaj_par_triaj || !!triaje.triaj_tem_triaj || !!triaje.triaj_fca_triaj || !!triaje.triaj_fre_triaj,
      mostrarMedidasAntropometricas: !!triaje.triaj_pes_triaj || !!triaje.triaj_tal_triaj || !!triaje.triaj_imc_triaj || !!triaje.triaj_pab_triaj,
    });
    setEditingTriaje(triaje);
  };

  return (
    <div className={styles["aten-enfer-container"]}>
      <h1>Registro de Triajes</h1>

      {/* Mostrar información de la cita seleccionada */}
      {cita && (
        <div className={styles["cita-info"]}>
          <h2>Información de la Cita</h2>
          <p>
            <strong>Paciente:</strong> {nombrePaciente}
          </p>
          <p>
            <strong>Médico:</strong> {nombreMedico}
          </p>
          <p>
            <strong>Fecha:</strong> {cita.cita_fec_cita.split('T')[0]}
          </p>
          <p>
            <strong>Hora:</strong> {cita.cita_hor_cita}
          </p>
          
          {/* Botón para abrir el modal de postconsulta */}
          <button 
            onClick={openModalPostconsulta}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Agregar Actividades de Postconsulta
          </button>
        </div>
      )}
{/* Modal para actividades de postconsulta */}
<Modal
  isOpen={modalPostconsultaIsOpen}
  onRequestClose={closeModalPostconsulta}
  contentLabel="Seleccionar Actividades de Postconsulta"
  style={{
    content: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      maxWidth: '700px',
      width: '90%',
      maxHeight: '85vh',
      overflowY: 'auto',
      border: 'none',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(42, 92, 130, 0.8)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }
  }}
>
  <h2 style={{
    color: '#2A5C82',
    marginBottom: '1.5rem',
    fontSize: '1.8rem',
    fontWeight: '600',
    textAlign: 'center',
    borderBottom: '2px solid #E1F5FE',
    paddingBottom: '0.5rem'
  }}>
    Seleccionar Actividades de Postconsulta
  </h2>
  
  {loading ? (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100px'
    }}>
      <div style={{
        border: '4px solid #E1F5FE',
        borderTop: '4px solid #4FC3F7',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }}></div>
    </div>
  ) : error ? (
    <div style={{
      backgroundColor: '#FFEBEE',
      color: '#D32F2F',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      borderLeft: '4px solid #D32F2F'
    }}>
      {error}
    </div>
  ) : (
    <>
      <div style={{ 
        margin: '1.5rem 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '12px'
      }}>
        {actividadesPostconsulta.map(actividad => (
          <div 
            key={actividad.acti_cod_acti} 
            style={{
              padding: '1rem',
              background: selectedActivities[actividad.acti_cod_acti] ? '#E1F5FE' : '#F8F9FA',
              borderRadius: '8px',
              border: `2px solid ${selectedActivities[actividad.acti_cod_acti] ? '#4FC3F7' : '#E0E0E0'}`,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }} 
            onClick={() => handleCheckboxChange(actividad.acti_cod_acti)}
          >
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontWeight: selectedActivities[actividad.acti_cod_acti] ? '600' : '400',
              color: selectedActivities[actividad.acti_cod_acti] ? '#0288D1' : '#424242'
            }}>
              <input
                type="checkbox"
                checked={selectedActivities[actividad.acti_cod_acti] || false}
                onChange={() => handleCheckboxChange(actividad.acti_cod_acti)}
                style={{
                  transform: 'scale(1.3)',
                  accentColor: '#4FC3F7',
                  cursor: 'pointer'
                }}
              />
              {actividad.acti_nom_acti}
            </label>
          </div>
        ))}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '1rem', 
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #E0E0E0'
      }}>
        <button 
          onClick={closeModalPostconsulta}
          style={{
            backgroundColor: '#E0E0E0',
            color: '#424242',
            padding: '0.8rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#BDBDBD'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E0E0E0'}
        >
          Cancelar
        </button>
        <button 
          onClick={guardarActividades}
          style={{
            backgroundColor: '#81D4FA',
            color: '#01579B',
            padding: '0.8rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4FC3F7'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#81D4FA'}
        >
          Guardar Actividades
        </button>
      </div>
    </>
  )}
</Modal>
      {/* Formulario para crear/editar triajes (MANTENIDO EXACTAMENTE IGUAL) */}
      <form onSubmit={handleSubmit} className={styles["aten-enfer-form"]}>
        <h2>{editingTriaje ? "Editar Triaje" : "Crear Nuevo Triaje"}</h2>

        {/* Checkbox para Signos Vitales */}
        <div className={styles["form-group"]}>
          <label>
            <input
              type="checkbox"
              name="mostrarSignosVitales"
              checked={formData.mostrarSignosVitales}
              onChange={handleInputChange}
            />
            Signos Vitales
          </label>
        </div>

        {/* Campos de Signos Vitales (condicionales) */}
        {formData.mostrarSignosVitales && (
          <>
            <div className={styles["form-group"]}>
              <label>Presión Arterial:</label>
              <input
                type="text"
                name="triaj_par_triaj"
                placeholder="Ej: 120/80"
                value={formData.triaj_par_triaj}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Temperatura (°C):</label>
              <input
                type="number"
                name="triaj_tem_triaj"
                placeholder="Ej: 36.5"
                value={formData.triaj_tem_triaj}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Frecuencia Cardíaca (lpm):</label>
              <input
                type="number"
                name="triaj_fca_triaj"
                placeholder="Ej: 80"
                value={formData.triaj_fca_triaj}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Frecuencia Respiratoria (rpm):</label>
              <input
                type="number"
                name="triaj_fre_triaj"
                placeholder="Ej: 16"
                value={formData.triaj_fre_triaj}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}

        {/* Checkbox para Medidas Antropométricas */}
        <div className={styles["form-group"]}>
          <label>
            <input
              type="checkbox"
              name="mostrarMedidasAntropometricas"
              checked={formData.mostrarMedidasAntropometricas}
              onChange={handleInputChange}
            />
            Medidas Antropométricas
          </label>
        </div>

        {/* Campos de Medidas Antropométricas (condicionales) */}
        {formData.mostrarMedidasAntropometricas && (
          <>
            <div className={styles["form-group"]}>
              <label>Peso (kg):</label>
              <input
                type="number"
                name="triaj_pes_triaj"
                placeholder="Ej: 70"
                value={formData.triaj_pes_triaj}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Talla (cm):</label>
              <input
                type="number"
                name="triaj_tal_triaj"
                placeholder="Ej: 170"
                value={formData.triaj_tal_triaj}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>IMC:</label>
              <input
                type="number"
                name="triaj_imc_triaj"
                placeholder="Ej: 24.5"
                value={formData.triaj_imc_triaj}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles["form-group"]}>
              <label>Perímetro Abdominal (cm):</label>
              <input
                type="number"
                name="triaj_pab_triaj"
                placeholder="Ej: 90"
                value={formData.triaj_pab_triaj}
                onChange={handleInputChange}
              />
            </div>
          </>
        )}

        {/* Checkboxes para exámenes */}
        <div className={styles["form-group"]}>
          <label>
            <input
              type="checkbox"
              name="triaj_exl_triaj"
              checked={formData.triaj_exl_triaj}
              onChange={handleInputChange}
            />
            Examen de Laboratorio
          </label>
        </div>

        <div className={styles["form-group"]}>
          <label>
            <input
              type="checkbox"
              name="triaj_exi_triaj"
              checked={formData.triaj_exi_triaj}
              onChange={handleInputChange}
            />
            Examen de Imágenes
          </label>
        </div>

        {/* Observaciones */}
        <div className={styles["form-group"]}>
          <label>Observaciones:</label>
          <textarea
            name="triaj_obs_triaj"
            placeholder="Observaciones de triaje"
            value={formData.triaj_obs_triaj}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit">{editingTriaje ? "Actualizar" : "Crear"}</button>
      </form>
    </div>
  );
};

export default Enfermeria;