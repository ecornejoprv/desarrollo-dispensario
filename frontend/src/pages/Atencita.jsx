import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./styles/atencita.module.css";

const Atencita = () => {
  const [citas, setCitas] = useState([]);
  const [modalAdministrativasIsOpen, setModalAdministrativasIsOpen] = useState(false);
  const [actividadesAdmin, setActividadesAdmin] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [nombresMedicos, setNombresMedicos] = useState({}); // Nuevo estado para almacenar nombr

  // Obtener las citas pendientes al cargar el componente
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const { data: citasData } = await axios.get("/api/v1/citas");
        
        // Obtener médicos primero
        const codigosMedicosUnicos = [...new Set(citasData.map(cita => cita.cita_cod_medi))];
        const nombresMedicosTemp = {};
        
        for (const codigo of codigosMedicosUnicos) {
          if (codigo) {
            try {
              const { data: response } = await axios.get(`/api/v1/medicos/${codigo}`);
              nombresMedicosTemp[codigo] = response.data.medic_nom_medic;
            } catch (error) {
              console.error(`Error obteniendo médico ${codigo}:`, error);
              nombresMedicosTemp[codigo] = "Médico no disponible";
            }
          }
        }
        
        setNombresMedicos(nombresMedicosTemp);
        
        // Luego obtener pacientes para cada cita
        const citasConPacientes = await Promise.all(
          citasData.map(async (cita) => {
            if (cita.cita_cod_pacie) {
              const paciente = await fetchPacienteById(cita.cita_cod_pacie);
              return { ...cita, paciente };
            }
            return cita;
          })
        );
        
        setCitas(citasConPacientes);
      } catch (error) {
        console.error("Error fetching citas:", error);
      }
    };
  
    fetchCitas();
  }, []);

  // Función para obtener actividades administrativas
  const fetchActividadesAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/v1/tiposactividades?tipo=POSTCONSULTA");
      
      // Asegurarse de que data es un array
      const actividadesData = Array.isArray(data) ? data : (data.data || []);
      
      setActividadesAdmin(actividadesData);
      
      // Inicializar el estado de selección
      const initialSelection = {};
      actividadesData.forEach(act => {
        initialSelection[act.acti_cod_acti] = false;
      });
      setSelectedActivities(initialSelection);
    } catch (err) {
      console.error("Error al obtener actividades administrativas:", err);
      setError("Error al cargar actividades administrativas");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener un paciente por su ID
  const fetchPacienteById = async (id) => {
    try {
      const { data } = await axios.get(`/api/v1/pacientes/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching paciente by ID:", error);
      return null;
    }
  };

  // Función para obtener los datos completos del paciente y del médico
  const fetchDatosCompletos = async (cita) => {
    try {
      // Obtener paciente
      const paciente = cita.paciente || await fetchPacienteById(cita.cita_cod_pacie);
      
      // Usar el nombre del médico que ya tenemos en estado si está disponible
      const nombreMedico = nombresMedicos[cita.cita_cod_medi] || "Médico no disponible";
      
      return { 
        ...cita, 
        paciente,
        medico: {
          medic_cod_medic: cita.cita_cod_medi,
          medic_nom_medic: nombreMedico.split(' ')[0] || '',
          medic_ape_medic: nombreMedico.split(' ')[1] || ''
        }
      };
    } catch (error) {
      console.error("Error fetching datos completos:", error);
      return {
        ...cita,
        medico: {
          medic_cod_medic: cita.cita_cod_medi,
          medic_nom_medic: "Médico no disponible",
          medic_ape_medic: ""
        }
      };
    }
  };
  
  const handleRegistrarAtencion = async (cita) => {
    try {
      const citaCompleta = await fetchDatosCompletos(cita);
      console.log('Datos que se envían a enfermería:', citaCompleta); // Debug
      navigate("/enfermeria", { state: { cita: citaCompleta } });
    } catch (error) {
      console.error('Error al preparar datos para enfermería:', error);
      alert('Error al cargar los datos de la cita');
    }
  };

  // Función para abrir el modal y cargar las actividades
  const openModalAdministrativas = async () => {
    try {
      await fetchActividadesAdmin();
      setModalAdministrativasIsOpen(true);
    } catch (error) {
      console.error("Error al abrir modal:", error);
      alert("No se pudieron cargar las actividades administrativas");
    }
  };

  // Función para cerrar el modal
  const closeModalAdministrativas = () => {
    setModalAdministrativasIsOpen(false);
    setSelectedActivities({});
  };

  // Función para manejar cambios en los checkboxes
  const handleCheckboxChange = (acti_cod_acti) => {
    setSelectedActivities(prev => ({
      ...prev,
      [acti_cod_acti]: !prev[acti_cod_acti]
    }));
  };

  // Función para guardar las actividades seleccionadas - VERSIÓN FINAL
  const guardarActividades = async () => {
    try {
      // Obtener el ID del médico desde localStorage
      const medicId = localStorage.getItem("especialista");
      
      if (!medicId) {
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
     medicoId: parseInt(medicId),  // Asegurarse que es número
     fecha: new Date().toISOString().split('T')[0]
   });

   if (response.data.success) {
     closeModalAdministrativas();
     alert(response.data.message || "Actividades registradas correctamente");
     
     // Resetear selecciones
     setSelectedActivities({});
   } else {
     throw new Error(response.data.error || "Error al registrar actividades");
   }
 } catch (error) {
   console.error("Error al guardar actividades:", error);
   alert(error.message || "Error al guardar las actividades");
 }
};
  return (
    <div className={styles["atencita-container"]}>
      <h1>Citas Pendientes</h1>

      {/* Botón general para actividades administrativas */}
      <button
        className={styles["administrativas-button"]}
        onClick={openModalAdministrativas}
      >
        Actividades Administrativas
      </button>

      {/* Lista de citas */}
      {citas.length === 0 ? (
        <p>No hay citas pendientes.</p>
      ) : (
        <ul className={styles["cita-list"]}>
          {citas.map((cita) => (
            <li key={cita.cita_cod_cita} className={styles["cita-item"]}>
              <div>
                <strong>Paciente:</strong>{" "}
                {cita.paciente
                  ? `${cita.paciente.pacie_nom_pacie} ${cita.paciente.pacie_ape_pacie}`
                  : "Paciente no disponible"}{" "} | <strong>Médico:</strong> {nombresMedicos[cita.cita_cod_medi] || "Médico no disponible"} |{" "}
                <strong>Fecha:</strong> {cita.cita_fec_cita.split('T')[0]} |{" "}
                <strong>Hora:</strong> {cita.cita_hor_cita}
              </div>
              <div>
                <button
                  className={styles["registrar-button"]}
                  onClick={() => handleRegistrarAtencion(cita)}
                >
                  Registrar Atención
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de actividades administrativas */}
      {modalAdministrativasIsOpen && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal-content"]}>
            <h3>Actividades Administrativas</h3>
            
            {loading ? (
              <p>Cargando actividades...</p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : (
              <>
                <div className={styles["checkbox-group"]}>
                  {actividadesAdmin.length > 0 ? (
                    actividadesAdmin.map((actividad) => (
                      <label key={actividad.acti_cod_acti} className={styles["checkbox-label"]}>
                        <input
                          type="checkbox"
                          checked={selectedActivities[actividad.acti_cod_acti] || false}
                          onChange={() => handleCheckboxChange(actividad.acti_cod_acti)}
                        />
                        {actividad.acti_nom_acti}
                      </label>
                    ))
                  ) : (
                    <p>No hay actividades administrativas disponibles</p>
                  )}
                </div>
                <div className={styles["modal-buttons"]}>
                  <button
                    className={styles["modal-button"]}
                    onClick={guardarActividades}
                    disabled={actividadesAdmin.length === 0}
                  >
                    Guardar
                  </button>
                  <button
                    className={styles["modal-button"]}
                    onClick={closeModalAdministrativas}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Atencita;