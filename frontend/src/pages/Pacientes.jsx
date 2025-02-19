import React, { useState, useEffect } from "react";
import PacienteForm from "../pages/PacienteForm";
import api from "../api"; // Importar la instancia de Axios
import './styles/pacientes.css';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteEditando, setPacienteEditando] = useState(null);

  // Obtener la lista de pacientes
  const obtenerPacientes = async () => {
    try {
      const { data } = await api.get("/api/v1/pacientes"); // Ajusta la ruta aquí
      setPacientes(data);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    }
  };

  // Agregar o actualizar un paciente
  const guardarPaciente = async (paciente) => {
    try {
      if (pacienteEditando) {
        await api.put(`/api/v1/pacientes/${pacienteEditando.pacie_cod_pacie}`, paciente); // Ajusta la ruta aquí
      } else {
        await api.post("/api/v1/pacientes", paciente); // Ajusta la ruta aquí
      }
      setPacienteEditando(null);
      obtenerPacientes(); // Refrescar la lista
    } catch (error) {
      console.error("Error al guardar paciente:", error);
    }
  };

  // Eliminar un paciente (cambiar estado a 'I')
  const eliminarPaciente = async (id) => {
    try {
      await api.delete(`/api/v1/pacientes/${id}`); // Ajusta la ruta aquí
      obtenerPacientes(); // Refrescar la lista
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
    }
  };

  // Cargar la lista de pacientes al inicio
  useEffect(() => {
    obtenerPacientes();
  }, []);

  return (
    <div className="pacientes-container">
      <h1>Gestión de Pacientes</h1>

      {/* Formulario para agregar/editar pacientes */}
      <PacienteForm
        guardarPaciente={guardarPaciente}
        pacienteEditando={pacienteEditando}
      />

      {/* Tabla para listar pacientes */}
      <table className="pacientes-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha de Nacimiento</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((paciente) => (
            <tr key={paciente.pacie_cod_pacie}>
              <td>{paciente.pacie_nom_pacie}</td>
              <td>{paciente.pacie_ape_pacie}</td>
              <td>{new Date(paciente.pacie_fec_nac).toLocaleDateString()}</td>
              <td>{paciente.pacie_tel_pacie}</td>
              <td>{paciente.pacie_cor_pacie}</td>
              <td>{paciente.pacie_est_pacie}</td>
              <td>
                <button onClick={() => setPacienteEditando(paciente)}>Editar</button>
                <button onClick={() => eliminarPaciente(paciente.pacie_cod_pacie)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}