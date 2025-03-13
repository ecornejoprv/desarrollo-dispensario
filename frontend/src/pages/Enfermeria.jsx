import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Importamos useLocation para recibir datos
import axios from "axios";
import "./styles/enfermeria.css";

const Enfermeria = () => {
  const location = useLocation();
  const { cita } = location.state || {}; // Recibimos los datos de la cita seleccionada

  const [atenciones, setAtenciones] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [searchPaciente, setSearchPaciente] = useState("");
  const [formData, setFormData] = useState({
    aten_cod_pacie: cita ? cita.cita_cod_pacie : "", // Prellenamos el código del paciente si hay una cita
    aten_presion: "",
    aten_temp: "",
    aten_frec_card: "",
    aten_frec_resp: "",
    aten_peso: "",
    aten_talla: "",
    aten_observaciones: "",
  });
  const [editingAtencion, setEditingAtencion] = useState(null);

  // Obtener todas las atenciones al cargar el componente
  useEffect(() => {
    fetchAtenciones();
  }, []);

  // Obtener pacientes al buscar
  useEffect(() => {
    if (searchPaciente) {
      fetchPacientes();
    }
  }, [searchPaciente]);

  // Función para obtener las atenciones desde el backend
  const fetchAtenciones = async () => {
    try {
      const { data } = await axios.get("/api/v1/atenciones-enfermeria");
      setAtenciones(data);
    } catch (error) {
      console.error("Error fetching atenciones:", error);
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
    setFormData({ ...formData, aten_cod_pacie: paciente.pac_codigo });
    setSearchPaciente(`${paciente.pac_nombres} ${paciente.pac_apellidos}`);
    setPacientes([]); // Limpiar la lista de pacientes después de seleccionar uno
  };

  // Función para crear o actualizar una atención
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAtencion) {
        // Si estamos editando, hacemos una solicitud PUT
        await axios.put(
          `/api/v1/atenciones-enfermeria/${editingAtencion.aten_cod_aten}`,
          formData
        );
      } else {
        // Si no, hacemos una solicitud POST para crear una nueva atención
        await axios.post("/api/v1/atenciones-enfermeria", formData);
      }
      fetchAtenciones(); // Actualizar la lista de atenciones
      setFormData({
        aten_cod_pacie: "",
        aten_presion: "",
        aten_temp: "",
        aten_frec_card: "",
        aten_frec_resp: "",
        aten_peso: "",
        aten_talla: "",
        aten_observaciones: "",
      });
      setEditingAtencion(null); // Limpiar el estado de edición
    } catch (error) {
      console.error("Error saving atencion:", error);
    }
  };

  // Función para editar una atención
  const handleEdit = (atencion) => {
    setFormData(atencion);
    setEditingAtencion(atencion);
  };

  // Función para eliminar una atención
  const handleDelete = async (aten_cod_aten) => {
    try {
      await axios.delete(`/api/v1/atenciones-enfermeria/${aten_cod_aten}`);
      fetchAtenciones(); // Actualizar la lista de atenciones
    } catch (error) {
      console.error("Error deleting atencion:", error);
    }
  };

  return (
    <div className="aten-enfer-container">
      <h1>Registro de Atenciones de Enfermería</h1>

      {/* Mostrar información de la cita seleccionada */}
      {cita && (
        <div className="cita-info">
          <h2>Información de la Cita</h2>
          <p>
            <strong>Paciente:</strong> {cita.cita_cod_pacie}
          </p>
          <p>
            <strong>Médico:</strong> {cita.cita_nom_medi}
          </p>
          <p>
            <strong>Fecha:</strong> {cita.cita_fec_cita}
          </p>
          <p>
            <strong>Hora:</strong> {cita.cita_hor_cita}
          </p>
        </div>
      )}

      {/* Formulario para crear/editar atenciones */}
      <form onSubmit={handleSubmit} className="aten-enfer-form">
        <h2>{editingAtencion ? "Editar Atención" : "Crear Nueva Atención"}</h2>

        {/* Campo de búsqueda de paciente */}
        <div className="form-group">
          <label>Paciente:</label>
          <input
            type="text"
            placeholder="Buscar paciente por cédula o apellidos"
            value={searchPaciente}
            onChange={(e) => setSearchPaciente(e.target.value)}
          />
          {pacientes.length > 0 && (
            <ul className="pacientes-list">
              {pacientes.map((paciente) => (
                <li
                  key={paciente.pac_codigo}
                  onClick={() => handleSelectPaciente(paciente)}
                >
                  {paciente.pac_nombres} {paciente.pac_apellidos} -{" "}
                  {paciente.pac_cedula}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Campos para los signos vitales */}
        <div className="form-group">
          <label>Presión Arterial:</label>
          <input
            type="text"
            name="aten_presion"
            placeholder="Ej: 120/80"
            value={formData.aten_presion}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Temperatura (°C):</label>
          <input
            type="number"
            name="aten_temp"
            placeholder="Ej: 36.5"
            value={formData.aten_temp}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Frecuencia Cardíaca (lpm):</label>
          <input
            type="number"
            name="aten_frec_card"
            placeholder="Ej: 80"
            value={formData.aten_frec_card}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Frecuencia Respiratoria (rpm):</label>
          <input
            type="number"
            name="aten_frec_resp"
            placeholder="Ej: 16"
            value={formData.aten_frec_resp}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Peso (kg):</label>
          <input
            type="number"
            name="aten_peso"
            placeholder="Ej: 70"
            value={formData.aten_peso}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Talla (cm):</label>
          <input
            type="number"
            name="aten_talla"
            placeholder="Ej: 170"
            value={formData.aten_talla}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Observaciones:</label>
          <textarea
            name="aten_observaciones"
            placeholder="Observaciones de enfermería"
            value={formData.aten_observaciones}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit">{editingAtencion ? "Actualizar" : "Crear"}</button>
      </form>

      {/* Lista de atenciones */}
      <div className="aten-enfer-list">
        <h2>Lista de Atenciones</h2>
        {atenciones.length === 0 ? (
          <p>No hay atenciones registradas.</p>
        ) : (
          <ul>
            {atenciones.map((atencion) => (
              <li key={atencion.aten_cod_aten} className="atencion-item">
                <div>
                  <strong>Paciente:</strong> {atencion.aten_cod_pacie} |{" "}
                  <strong>Presión:</strong> {atencion.aten_presion} |{" "}
                  <strong>Temp:</strong> {atencion.aten_temp}°C |{" "}
                  <strong>FC:</strong> {atencion.aten_frec_card} lpm |{" "}
                  <strong>FR:</strong> {atencion.aten_frec_resp} rpm |{" "}
                  <strong>Peso:</strong> {atencion.aten_peso} kg |{" "}
                  <strong>Talla:</strong> {atencion.aten_talla} cm
                </div>
                <div>
                  <button onClick={() => handleEdit(atencion)}>Editar</button>
                  <button onClick={() => handleDelete(atencion.aten_cod_aten)}>
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

export default Enfermeria;