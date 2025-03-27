import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import styles from "./styles/citas.module.css";

Modal.setAppElement("#root");

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [searchPaciente, setSearchPaciente] = useState("");
  const [formData, setFormData] = useState({
    cita_cod_pacie: "",
    cita_cod_sucu: "",
    cita_cod_espe: "",
    cita_hor_cita: "",
    cita_fec_cita: "",
    cita_cod_medi: "",
  });
  const [editingCita, setEditingCita] = useState(null);
  const [lugaresAtencion, setLugaresAtencion] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Horas disponibles por especialidad
  const horasPorEspecialidad = {
    1: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"],
    2: ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    3: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"],
  };

  // Efecto para cargar citas, lugares de atención y especialidades al inicio
  useEffect(() => {
    fetchCitas();
    fetchLugaresAtencion();
    fetchEspecialidades();
  }, []);

  // Efecto para buscar pacientes cuando se escribe en el campo de búsqueda
  useEffect(() => {
    if (searchPaciente) {
      fetchPacientes();
    } else {
      setPacientes([]);
    }
  }, [searchPaciente]);

  // Efecto para cargar médicos cuando se selecciona una especialidad
  useEffect(() => {
    if (formData.cita_cod_espe) {
      fetchMedicosPorEspecialidad(formData.cita_cod_espe);
    } else {
      setMedicos([]);
    }
  }, [formData.cita_cod_espe]);

  const fetchCitas = async () => {
    try {
      const { data: apiResponse } = await axios.get("/api/v1/citas");
      
      const citasData = Array.isArray(apiResponse) ? apiResponse 
                       : apiResponse?.data || apiResponse?.result || [];
  
      const citasCompletas = await Promise.all(
        citasData.map(async (cita) => {
          try {
            let pacienteData = { pacie_nom_pacie: "No disponible", pacie_ape_pacie: "" };
            if (cita.cita_cod_pacie) {
              const pacienteRes = await axios.get(`/api/v1/pacientes/${cita.cita_cod_pacie}`);
              if (pacienteRes.data.pacie_nom_pacie) {
                pacienteData = {
                  pacie_nom_pacie: pacienteRes.data.pacie_nom_pacie,
                  pacie_ape_pacie: pacienteRes.data.pacie_ape_pacie || ""
                };
              } else if (pacienteRes.data.data) {
                pacienteData = {
                  pacie_nom_pacie: pacienteRes.data.data.pacie_nom_pacie,
                  pacie_ape_pacie: pacienteRes.data.data.pacie_ape_pacie || ""
                };
              }
            }
  
            let medicoData = { medic_nom_medic: "No disponible" };
            if (cita.cita_cod_medi) {
              const medicoRes = await axios.get(`/api/v1/medicos/${cita.cita_cod_medi}`);
              medicoData = {
                medic_nom_medic: medicoRes.data?.data?.medic_nom_medic 
                              || medicoRes.data?.medic_nom_medic 
                              || "No disponible"
              };
            }
  
            return {
              ...cita,
              paciente: pacienteData,
              medico: medicoData
            };
            
          } catch (error) {
            console.error(`Error procesando cita ${cita.cita_cod_cita}:`, error);
            return {
              ...cita,
              paciente: { pacie_nom_pacie: "Error", pacie_ape_pacie: "" },
              medico: { medic_nom_medic: "Error" }
            };
          }
        })
      );
  
      setCitas(citasCompletas);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      setError("Error al cargar las citas");
      setCitas([]);
    }
  };

  const fetchLugaresAtencion = async () => {
    try {
      const { data } = await axios.get("/api/v1/lugares-atencion");
      setLugaresAtencion(data.data);
    } catch (error) {
      console.error("Error fetching lugares de atención:", error);
      setError("Error al cargar los lugares de atención.");
      setLugaresAtencion([]);
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const { data } = await axios.get("/api/v1/especialidades");
      setEspecialidades(data.data);
    } catch (error) {
      console.error("Error fetching especialidades:", error);
      setError("Error al cargar las especialidades.");
      setEspecialidades([]);
    }
  };

  const fetchMedicosPorEspecialidad = async (especialidadId) => {
    try {
      const { data } = await axios.get(`/api/v1/medicos/especialidad/${especialidadId}`);
      const medicosData = data.data || [];
      
      setMedicos(medicosData);
  
      if (medicosData.length === 1) {
        setFormData((prevData) => ({
          ...prevData,
          cita_cod_medi: medicosData[0].medic_cod_medic,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          cita_cod_medi: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching médicos por especialidad:", error);
      setError("Error al cargar los médicos.");
      setMedicos([]);
    }
  };

  const fetchPacientes = async () => {
    try {
      const { data } = await axios.get("/api/v1/pacientes", {
        params: { search: searchPaciente },
      });
      setPacientes(data.pacientes);
    } catch (error) {
      console.error("Error fetching pacientes:", error);
      setError("Error al buscar pacientes.");
    }
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const mes = date.toLocaleString("default", { month: "short" });
    const dia = date.getDate();
    return `${dia} ${mes}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectPaciente = (paciente) => {
    setFormData({ ...formData, cita_cod_pacie: paciente.pacie_cod_pacie });
    setSearchPaciente(`${paciente.pacie_nom_pacie} ${paciente.pacie_ape_pacie}`);
    setPacientes([]);
  };

  const openModal = async () => {
    if (!formData.cita_cod_espe || !formData.cita_cod_sucu || !formData.cita_cod_medi) {
      setError("Por favor, seleccione lugar, especialidad y médico primero.");
      return;
    }

    try {
      const { data: citasAgendadas } = await axios.get("/api/v1/citas", {
        params: {
          cita_cod_espe: formData.cita_cod_espe,
          cita_cod_sucu: formData.cita_cod_sucu,
          cita_cod_medi: formData.cita_cod_medi,
        },
      });

      setCitas(citasAgendadas);
      setModalIsOpen(true);
    } catch (error) {
      console.error("Error al obtener citas agendadas:", error);
      setError("Error al cargar las citas agendadas.");
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSelectDateTime = (fecha, hora) => {
    const fechaSeleccionada = new Date(fecha).toISOString().split("T")[0];
    const horasDisponibles = getHorasDisponibles(fechaSeleccionada);

    if (!horasDisponibles.includes(hora)) {
      setError("La hora seleccionada no está disponible. Por favor, elige otra.");
      return;
    }

    setFormData({ ...formData, cita_fec_cita: fechaSeleccionada, cita_hor_cita: hora });
    closeModal();
  };

  const getHorasDisponibles = (fecha) => {
    if (!formData.cita_cod_espe || !formData.cita_cod_sucu || !formData.cita_cod_medi) {
      return [];
    }

    const citasAgendadas = citas.filter(
      (cita) =>
        cita.cita_fec_cita === fecha &&
        cita.cita_cod_espe === formData.cita_cod_espe &&
        cita.cita_cod_sucu === formData.cita_cod_sucu &&
        cita.cita_cod_medi === formData.cita_cod_medi
    );

    const horasOcupadas = citasAgendadas.map((cita) => cita.cita_hor_cita.slice(0, 5));
    const horasEspecialidad = horasPorEspecialidad[formData.cita_cod_espe] || [];

    return horasEspecialidad.filter((hora) => !horasOcupadas.includes(hora));
  };

  const getFechasSemana = () => {
    const fechas = [];
    const inicioSemana = new Date(currentWeek);
    inicioSemana.setDate(currentWeek.getDate() - currentWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + i);
      fechas.push(fecha.toISOString().split("T")[0]);
    }

    return fechas;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cita_cod_pacie || !formData.cita_cod_sucu || !formData.cita_cod_espe || !formData.cita_fec_cita || !formData.cita_hor_cita || !formData.cita_cod_medi) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const citaData = {
        ...formData,
        cita_hor_cita: `${formData.cita_hor_cita}:00`,
      };

      if (editingCita) {
        await axios.put(`/api/v1/citas/${editingCita.cita_cod_cita}`, citaData);
      } else {
        await axios.post("/api/v1/citas", citaData);
      }

      await fetchCitas();
      setFormData({
        cita_cod_pacie: "",
        cita_cod_sucu: "",
        cita_cod_espe: "",
        cita_hor_cita: "",
        cita_fec_cita: "",
        cita_cod_medi: "",
      });
      setEditingCita(null);
      setSearchPaciente("");
      setError("");
    } catch (error) {
      console.error("Error saving cita:", error);
      setError("Ocurrió un error al guardar la cita. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (cita) => {
    setFormData(cita);
    setEditingCita(cita);

    if (cita.cita_cod_pacie) {
      const paciente = await fetchPacienteById(cita.cita_cod_pacie);
      if (paciente) {
        setSearchPaciente(`${paciente.pacie_nom_pacie} ${paciente.pacie_ape_pacie}`);
      }
    }
  };

  const handleDelete = async (cita_cod_cita) => {
    try {
      await axios.delete(`/api/v1/citas/${cita_cod_cita}`);
      fetchCitas();
    } catch (error) {
      console.error("Error deleting cita:", error);
      setError("Error al eliminar la cita.");
    }
  };

  const changeWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const isPastDate = (fecha, hora) => {
    const now = new Date();
    const selectedDate = new Date(`${fecha}T${hora}:00`);
    return selectedDate < now;
  };

  return (
    <div className={styles["citas-container"]}>
      <h1 className={styles["citas-title"]}>Agendamiento de Citas</h1>

      <form onSubmit={handleSubmit} className={styles["citas-form"]}>
        <h2 className={styles["citas-subtitle"]}>{editingCita ? "Editar Cita" : "Crear Nueva Cita"}</h2>
        {error && <p className={styles["citas-error"]}>{error}</p>}

        <div className={styles["citas-form-group"]}>
          <label className={styles["citas-label"]}>Paciente:</label>
          <input
            className={styles["citas-input"]}
            type="text"
            placeholder="Buscar por cédula o apellido"
            value={searchPaciente}
            onChange={(e) => setSearchPaciente(e.target.value)}
          />
          {pacientes.length > 0 && (
            <ul className={styles["citas-pacientes-list"]}>
              {pacientes.map((paciente) => (
                <li
                  key={paciente.pac_codigo}
                  className={styles["citas-pacientes-item"]}
                  onClick={() => handleSelectPaciente(paciente)}
                >
                  {paciente.pacie_nom_pacie} {paciente.pacie_ape_pacie} - {paciente.pacie_ced_pacie}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles["citas-form-group"]}>
          <label className={styles["citas-label"]}>Lugar de Atención:</label>
          <select
            className={styles["citas-select"]}
            name="cita_cod_sucu"
            value={formData.cita_cod_sucu}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione un lugar de atención</option>
            {lugaresAtencion.map((lugar) => (
              <option key={lugar.disuc_cod_disuc} value={lugar.disuc_cod_disuc}>
                {lugar.disuc_nom_disuc}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["citas-form-group"]}>
          <label className={styles["citas-label"]}>Especialidad:</label>
          <select
            className={styles["citas-select"]}
            name="cita_cod_espe"
            value={formData.cita_cod_espe}
            onChange={(e) => {
              handleInputChange(e);
              const especialidadId = e.target.value;
              if (especialidadId) {
                fetchMedicosPorEspecialidad(especialidadId);
              } else {
                setMedicos([]);
              }
            }}
            required
          >
            <option value="">Seleccione una especialidad</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad.espe_cod_espe} value={especialidad.espe_cod_espe}>
                {especialidad.espe_nom_espe}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["citas-form-group"]}>
          <label className={styles["citas-label"]}>Médico:</label>
          <select
            className={styles["citas-select"]}
            name="cita_cod_medi"
            value={formData.cita_cod_medi}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione un médico</option>
            {medicos.map((medico) => (
              <option key={medico.medic_cod_medic} value={medico.medic_cod_medic}>
                {medico.medic_nom_medic}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["citas-form-group"]}>
          <label className={styles["citas-label"]}>Fecha y Hora de la Cita:</label>
          <input
            className={styles["citas-input"]}
            type="text"
            value={formData.cita_fec_cita && formData.cita_hor_cita ? `${formatFecha(formData.cita_fec_cita)} ${formData.cita_hor_cita.slice(0, 5)}` : ""}
            readOnly
            onClick={openModal}
            placeholder="Seleccione fecha y hora"
          />
          <div className={styles["citas-form-group"]}></div>
          <button 
            type="button" 
            className={`${styles["citas-btn"]} ${styles["citas-btn-secondary"]}`}
            onClick={openModal}
          >
            Seleccionar Fecha y Hora
          </button>
        </div>

        <button 
          type="submit" 
          className={`${styles["citas-btn"]} ${styles["citas-btn-primary"]}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : editingCita ? "Actualizar" : "Crear"}
        </button>
      </form>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Seleccionar Fecha y Hora"
        className={styles["citas-modal"]}
        overlayClassName={styles["citas-overlay"]}
      >
        <h2 className={styles["citas-subtitle"]}>Seleccionar Fecha y Hora</h2>
        <div className={styles["citas-week-nav"]}>
          <button 
            className={`${styles["citas-btn"]} ${styles["citas-btn-secondary"]}`}
            onClick={() => changeWeek("prev")}
          >
            Semana Anterior
          </button>
          <button 
            className={`${styles["citas-btn"]} ${styles["citas-btn-secondary"]}`}
            onClick={() => changeWeek("next")}
          >
            Siguiente Semana
          </button>
        </div>
        <table className={styles["citas-horarios-table"]}>
          <thead>
            <tr>
              <th className={styles["citas-horarios-header"]}>Hora</th>
              {getFechasSemana().map((fecha) => (
                <th key={fecha} className={styles["citas-horarios-header"]}>
                  {formatFecha(fecha)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horasPorEspecialidad[formData.cita_cod_espe]?.map((hora) => (
              <tr key={hora}>
                <td className={styles["citas-horarios-cell"]}>{hora}</td>
                {getFechasSemana().map((fecha) => {
                  const horasDisponibles = getHorasDisponibles(fecha);
                  const isHoraDisponible = horasDisponibles.includes(hora);
                  const isPast = isPastDate(fecha, hora);

                  return (
                    <td
                      key={`${fecha}-${hora}`}
                      className={`${styles["citas-horarios-cell"]} ${
                        isHoraDisponible && !isPast 
                          ? styles["citas-cell-disponible"] 
                          : isPast 
                            ? styles["citas-cell-pasada"] 
                            : styles["citas-cell-ocupada"]
                      }`}
                      onClick={() => isHoraDisponible && !isPast && handleSelectDateTime(fecha, hora)}
                    >
                      {isPast ? "Pasada" : isHoraDisponible ? "Disponible" : "Ocupada"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          className={`${styles["citas-btn"]} ${styles["citas-btn-secondary"]}`}
          onClick={closeModal}
        >
          Cerrar
        </button>
      </Modal>

      <div className={styles["citas-list-container"]}>
        <h2 className={styles["citas-subtitle"]}>Lista de Citas</h2>
        {citas.length === 0 ? (
          <p className={styles["citas-empty"]}>No hay citas registradas.</p>
        ) : (
          <ul className={styles["citas-list"]}>
            {citas.map((cita) => (
              <li key={cita.cita_cod_cita} className={styles["citas-list-item"]}>
                <div className={styles["citas-info-container"]}>
                  <div className={styles["citas-info-item"]}>
                    <strong>Paciente:</strong>{" "}
                    {cita.paciente?.pacie_nom_pacie 
                      ? `${cita.paciente.pacie_nom_pacie} ${cita.paciente.pacie_ape_pacie || ''}` 
                      : `No disponible (ID: ${cita.cita_cod_pacie})`
                    }
                  </div>
                  <div className={styles["citas-info-item"]}>
                    <strong>Médico:</strong>{" "}
                    {cita.medico
                      ? `${cita.medico.medic_nom_medic}`
                      : "Médico no disponible"}
                  </div>
                  <div className={styles["citas-info-item"]}>
                    <strong>Fecha:</strong> {formatFecha(cita.cita_fec_cita)}
                  </div>
                  <div className={styles["citas-info-item"]}>
                    <strong>Hora:</strong> {cita.cita_hor_cita.slice(0, 5)}
                  </div>
                </div>
                <div className={styles["citas-actions"]}>
                  <button 
                    className={`${styles["citas-btn"]} ${styles["citas-btn-warning"]}`}
                    onClick={() => handleEdit(cita)}
                  >
                    Editar
                  </button>
                  <button 
                    className={`${styles["citas-btn"]} ${styles["citas-btn-danger"]}`}
                    onClick={() => handleDelete(cita.cita_cod_cita)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Citas;