import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles/citas.module.css";

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
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cita_cod_pacie || !formData.cita_cod_sucu || !formData.cita_cod_espe || !formData.cita_cod_medi) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener fecha y hora actual
      const now = new Date();
      const fechaActual = now.toISOString().split('T')[0];
      const horaActual = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

      const citaData = {
        ...formData,
        cita_fec_cita: fechaActual,
        cita_hor_cita: horaActual
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

        <button
          type="submit"
          className={`${styles["citas-btn"]} ${styles["citas-btn-primary"]}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : editingCita ? "Actualizar" : "Crear"}
        </button>
      </form>

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
                    <strong>Fecha/Hora:</strong> {formatFecha(cita.cita_fec_cita)} {cita.cita_hor_cita.slice(0, 5)}
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