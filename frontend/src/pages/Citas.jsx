import React, { useState, useEffect } from "react";
import axios from "axios"; // Asegúrate de importar axios
import "./styles/citas.css"; // Estilos para la interfaz

const Citas = () => {
  const [citas, setCitas] = useState([]); // Estado para almacenar las citas
  const [pacientes, setPacientes] = useState([]); // Estado para almacenar los pacientes
  const [searchPaciente, setSearchPaciente] = useState(""); // Estado para buscar pacientes
  const [formData, setFormData] = useState({
    cita_cod_pacie: "",
    cita_cod_espe: "",
    cita_hor_cita: "",
    cita_fec_cita: "",
    cita_nom_medi: "",
    cita_tie_est: "",
    cita_est_cita: "",
    cita_obs_cita: "",
  });
  const [editingCita, setEditingCita] = useState(null); // Estado para manejar la edición

  // Lista de especialidades predefinidas
  const especialidades = [
    "MEDICINA GENERAL",
    "ODONTOLOGÍA",
    "FISIOTERAPIA",
    "ENFERMERÍA",
  ];

  // Obtener todas las citas al cargar el componente
  useEffect(() => {
    fetchCitas();
  }, []);

  // Obtener pacientes al buscar
  useEffect(() => {
    if (searchPaciente) {
      fetchPacientes();
    }
  }, [searchPaciente]);

  // Función para obtener las citas desde el backend
  const fetchCitas = async () => {
    try {
      const { data } = await axios.get("/api/v1/citas"); // Usar axios.get
      setCitas(data);
    } catch (error) {
      console.error("Error fetching citas:", error);
    }
  };

   // Función para obtener pacientes desde el backend
   const fetchPacientes = async () => {
    try {
      const { data } = await axios.get("/api/v1/pacientes", {
        params: { search: searchPaciente },
      });
      setPacientes(data);
    } catch (error) {
      console.error("Error fetching pacientes:", error);
    }
  };
  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Función para manejar la selección de un paciente
  const handleSelectPaciente = (paciente) => {
    setFormData({ ...formData, cita_cod_pacie: paciente.pac_codigo });
    setSearchPaciente(`${paciente.pac_nombres} ${paciente.pac_apellidos}`);
    setPacientes([]); // Limpiar la lista de pacientes después de seleccionar uno
  };

  // Función para crear o actualizar una cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCita) {
        // Si estamos editando, hacemos una solicitud PUT
        await axios.put(
          `/api/v1/citas/${editingCita.cita_cod_cita}`,
          formData
        );
      } else {
        // Si no, hacemos una solicitud POST para crear una nueva cita
        await axios.post("/api/v1/citas", formData);
      }
      fetchCitas(); // Actualizar la lista de citas
      setFormData({
        cita_cod_pacie: "",
        cita_cod_espe: "",
        cita_hor_cita: "",
        cita_fec_cita: "",
        cita_nom_medi: "",
        cita_tie_est: "",
        cita_est_cita: "",
        cita_obs_cita: "",
      });
      setEditingCita(null); // Limpiar el estado de edición
    } catch (error) {
      console.error("Error saving cita:", error);
    }
  };

  // Función para editar una cita
  const handleEdit = (cita) => {
    setFormData(cita);
    setEditingCita(cita);
  };

  // Función para eliminar una cita
  const handleDelete = async (cita_cod_cita) => {
    try {
      await axios.delete(`/api/v1/citas/${cita_cod_cita}`);
      fetchCitas(); // Actualizar la lista de citas
    } catch (error) {
      console.error("Error deleting cita:", error);
    }
  };

  return (
    <div className="citas-container">
      <h1>Agendamiento de Citas</h1>

      {/* Formulario para crear/editar citas */}
      <form onSubmit={handleSubmit} className="cita-form">
        <h2>{editingCita ? "Editar Cita" : "Crear Nueva Cita"}</h2>


       {/* Campo de búsqueda de paciente */}
       <div className="form-group">
       <label>Paciente:</label>
        <input
          type="text"
          name="cita_cod_pacie"
          placeholder="Codigo paciente"
          value={formData.cita_cod_pacie}
          onChange={handleInputChange}
          required
        />
         </div>

        {/* Campo de especialidad */}
        <div className="form-group">
          <label>Especialidad:</label>
          <select
            name="cita_cod_espe"
            value={formData.cita_cod_espe}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione una especialidad</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad} value={especialidad}>
                {especialidad}
              </option>
            ))}
          </select>
        </div>

        {/* Resto del formulario */}
        <input
          type="time"
          name="cita_hor_cita"
          placeholder="Hora de la Cita"
          value={formData.cita_hor_cita}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="cita_fec_cita"
          placeholder="Fecha de la Cita"

          value={
            formData.cita_fec_cita
              ? new Date(formData.cita_fec_cita.split("/").reverse().join("-"))
                  .toISOString()
                  .split("T")[0]
              : ""
          }

          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="cita_nom_medi"
          placeholder="Nombre del Médico"
          value={formData.cita_nom_medi}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="cita_tie_est"
          placeholder="Tiempo Estimado"
          value={formData.cita_tie_est}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="cita_est_cita"
          placeholder="Estado de la Cita"
          value={formData.cita_est_cita}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="cita_obs_cita"
          placeholder="Observaciones"
          value={formData.cita_obs_cita}
          onChange={handleInputChange}
        />
        <button type="submit">{editingCita ? "Actualizar" : "Crear"}</button>
      </form>

      {/* Lista de citas */}
      <div className="citas-list">
        <h2>Lista de Citas</h2>
        {citas.length === 0 ? (
          <p>No hay citas registradas.</p>
        ) : (
          <ul>
            {citas.map((cita) => (
              <li key={cita.cita_cod_cita} className="cita-item">
                <div>
                  <strong>Paciente:</strong> {cita.cita_cod_pacie} |{" "}
                  <strong>Médico:</strong> {cita.cita_nom_medi} |{" "}
                  <strong>Fecha:</strong> {cita.cita_fec_cita} |{" "}
                  <strong>Hora:</strong> {cita.cita_hor_cita}
                </div>
                <div>
                  <button onClick={() => handleEdit(cita)}>Editar</button>
                  <button onClick={() => handleDelete(cita.cita_cod_cita)}>
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