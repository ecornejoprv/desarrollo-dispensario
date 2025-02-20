import React, { useState, useEffect } from "react";
import PacienteForm from "../pages/PacienteForm";
import api from "../api"; // Importar la instancia de Axios
import './styles/pacientes.css';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Obtener la lista de pacientes
  const obtenerPacientes = async () => {
    try {
      const { data } = await api.get("/api/v1/pacientes", {
        params: { search, page, limit },
      });
      setPacientes(data.pacientes);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
    }
  };

  // Agregar o actualizar un paciente
  const guardarPaciente = async (paciente) => {
    try {
      if (pacienteEditando) {
        await api.put(`/api/v1/pacientes/${pacienteEditando.pacie_cod_pacie}`, paciente);
      } else {
        await api.post("/api/v1/pacientes", paciente);
      }
      setPacienteEditando(null); // Limpiar el estado de edición
      obtenerPacientes(); // Refrescar la lista
    } catch (error) {
      console.error("Error al guardar paciente:", error);
    }
  };

  // Eliminar un paciente
  const eliminarPaciente = async (id) => {
    try {
      await api.delete(`/api/v1/pacientes/${id}`);
      obtenerPacientes(); // Refrescar la lista
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
    }
  };

  // Cambiar de página
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Cargar la lista de pacientes al inicio o cuando cambie la página o la búsqueda
  useEffect(() => {
    obtenerPacientes();
  }, [page, search]);

  return (
    <div className="pacientes-container">
      <h1>Gestión de Pacientes</h1>

      {/* Campo de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por apellidos o cédula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
            <th>Cédula</th>
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
              <td>{paciente.pacie_ced_pacie}</td>
              <td>{new Date(paciente.pacie_fec_nac).toLocaleDateString()}</td>
              <td>{paciente.pacie_tel_pacie}</td>
              <td>{paciente.pacie_emai_pacie}</td>
              <td>{paciente.pacie_est_pacie}</td>
              <td>
                <button onClick={() => setPacienteEditando(paciente)}>Editar</button>
                <button onClick={() => eliminarPaciente(paciente.pacie_cod_pacie)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Controles de paginación */}
      <div className="pagination-container">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}