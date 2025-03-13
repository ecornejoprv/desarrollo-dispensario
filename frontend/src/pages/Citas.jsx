import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/citas.css";

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
    cita_nom_medi: "",
    cita_tie_est: "",
    cita_est_cita: "",
    cita_obs_cita: "",
  });
  const [editingCita, setEditingCita] = useState(null);

  const especialidades = [
    "MEDICINA GENERAL",
    "ODONTOLOGÍA",
    "FISIOTERAPIA",
    "ENFERMERÍA",
  ];

  useEffect(() => {
    fetchCitas();
  }, []);

  // Obtener pacientes cuando se escribe en el campo de búsqueda
  useEffect(() => {
    if (searchPaciente) {
      fetchPacientes();
    } else {
      setPacientes([]); // Limpiar la lista si no hay búsqueda
    }
  }, [searchPaciente]);

  // Obtener las citas
  const fetchCitas = async () => {
    try {
      const { data } = await axios.get("/api/v1/citas");
      setCitas(data);
    } catch (error) {
      console.error("Error fetching citas:", error);
    }
  };

  // Obtener los pacientes basados en la búsqueda
  const fetchPacientes = async () => {
    try {
      const { data } = await axios.get("/api/v1/pacientes", {
        params: { search: searchPaciente },
      });
      console.log("Respuesta de la API:", data); // Verificar la respuesta de la API
      setPacientes(data.pacientes); // Asegúrate de que la API devuelve un array en `data.pacientes`
    } catch (error) {
      console.error("Error fetching pacientes:", error);
    }
  };

  // Obtener un paciente por su código
  const fetchPacienteById = async (id) => {
    try {
      const { data } = await axios.get(`/api/v1/pacientes/${id}`);
      return data; // Devuelve los datos del paciente
    } catch (error) {
      console.error("Error fetching paciente by ID:", error);
      return null;
    }
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Seleccionar un paciente de la lista
  const handleSelectPaciente = (paciente) => {
    setFormData({ ...formData, cita_cod_pacie: paciente.pacie_cod_pacie }); // Guardar el código del paciente
    setSearchPaciente(`${paciente.pacie_nom_pacie} ${paciente.pacie_ape_pacie}`); // Mostrar nombre completo en el campo de búsqueda
    setPacientes([]); // Limpiar la lista de pacientes después de seleccionar uno
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCita) {
        await axios.put(`/api/v1/citas/${editingCita.cita_cod_cita}`, formData);
      } else {
        await axios.post("/api/v1/citas", formData);
      }
      fetchCitas();
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
      setEditingCita(null);
      setSearchPaciente(""); // Limpiar el campo de búsqueda
    } catch (error) {
      console.error("Error saving cita:", error);
    }
  };

  // Editar una cita
  const handleEdit = async (cita) => {
    setFormData(cita); // Actualizar el formulario con los datos de la cita
    setEditingCita(cita);

    // Obtener el nombre del paciente basado en cita_cod_pacie
    if (cita.cita_cod_pacie) {
      const paciente = await fetchPacienteById(cita.cita_cod_pacie);
      if (paciente) {
        setSearchPaciente(`${paciente.pacie_nom_pacie} ${paciente.pacie_ape_pacie}`); // Mostrar nombre completo en el campo de búsqueda
      }
    }
  };

  // Eliminar una cita
  const handleDelete = async (cita_cod_cita) => {
    try {
      await axios.delete(`/api/v1/citas/${cita_cod_cita}`);
      fetchCitas();
    } catch (error) {
      console.error("Error deleting cita:", error);
    }
  };

  return (
    <div className="citas-container">
      <h1>Agendamiento de Citas</h1>

      <form onSubmit={handleSubmit} className="cita-form">
        <h2>{editingCita ? "Editar Cita" : "Crear Nueva Cita"}</h2>

        {/* Campo de búsqueda de paciente */}
        <div className="form-group">
          <label>Paciente:</label>
          <input
            type="text"
            placeholder="Buscar por cédula o apellido"
            value={searchPaciente}
            onChange={(e) => setSearchPaciente(e.target.value)}
          />
          {pacientes.length > 0 && (
            <ul className="pacientes-list">
              {pacientes.map((paciente) => (
                <li
                  key={paciente.pac_codigo} // Key única para cada paciente
                  onClick={() => handleSelectPaciente(paciente)}
                >
                  {paciente.pacie_nom_pacie} {paciente.pacie_ape_pacie} - {paciente.pacie_ced_pacie}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Resto del formulario */}
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