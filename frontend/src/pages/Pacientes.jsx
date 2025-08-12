// pages/Pacientes.jsx (Versión Final Sincronizada con AuthContext)
// ==============================================================================
// @summary: Este componente se ha actualizado para obtener el 'activeCompanies'
//           desde el AuthContext y pasarlo al PacienteForm. Esto asegura que
//           el dropdown de empresas en el formulario muestre solo las opciones
//           correspondientes al dispensario seleccionado en el login.
// ==============================================================================

import React, { useState, useEffect } from "react";
import PacienteForm from "../pages/PacienteForm";
import api from "../api";
import './styles/pacientes.css';
// Importa el hook useAuth.
import { useAuth } from '../components/context/AuthContext';

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function Pacientes() {
  // --- CAMBIO CLAVE: OBTENER EL CONTEXTO ACTIVO ---
  // Obtenemos 'activeCompanies' del contexto. Este estado contiene SOLAMENTE
  // las empresas del grupo de trabajo que el usuario seleccionó en el login.
  const { user, activeCompanies } = useAuth();

  // El resto de los estados no cambian.
  const [pacientes, setPacientes] = useState([]);
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Esta variable ahora se llama 'activeCompanies' para mayor claridad.
  // Ya no necesitamos 'userAllowedCompanies' porque esa representaba los permisos totales.

  // La lógica de las funciones no necesita cambiar. El backend se encarga de todo.
  const obtenerPacientes = async () => {
    try {
      // Esta petición ya envía el header 'X-Active-Companies' automáticamente gracias a api.js
      const { data } = await api.get("/api/v1/pacientes", { 
        params: { search, page, limit },
      });
      setPacientes(data.pacientes);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
      setFeedback({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error al cargar pacientes.' 
      });
    }
  };

  const guardarPaciente = async (paciente) => {
    try {
      if (pacienteEditando) {
        await api.put(`/api/v1/pacientes/${pacienteEditando.pacie_cod_pacie}`, paciente);
        setFeedback({ type: 'success', message: 'Paciente actualizado correctamente.' });
      } else {
        await api.post("/api/v1/pacientes", paciente);
        setFeedback({ type: 'success', message: 'Paciente registrado correctamente.' });
      }
      setPacienteEditando(null);
      obtenerPacientes(); // Recarga la lista ya filtrada por el backend
      return true;
    } catch (error) {
      console.error("Error al guardar paciente:", error);
      setFeedback({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error al guardar el paciente.' 
      });
      return false;
    }
  };
  
  const eliminarPaciente = async (id) => {
    const confirmacion = window.confirm("¿Está seguro de que desea eliminar (desactivar) este paciente?");
    if (!confirmacion) return;
    try {
      await api.delete(`/api/v1/pacientes/${id}`);
      setFeedback({ type: 'success', message: 'Paciente eliminado (desactivado) correctamente.' });
      obtenerPacientes();
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      setFeedback({ 
        type: 'error', 
        message: error.response?.data?.message || 'Error al eliminar el paciente.' 
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    obtenerPacientes();
  }, [page, search]);

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <div className="pacientes-container">
      <h1>Gestión de Pacientes</h1>
      
      <div className="button-container">
        <button onClick={() => setPacienteEditando(null)} className="nuevo-paciente-button">
          + Nuevo Paciente
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por apellidos o cédula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {user && (
        // --- CAMBIO CLAVE: PASAR LA PROP CORRECTA ---
        // Pasamos 'activeCompanies' al formulario. Ahora el formulario SÓLO conocerá
        // las empresas del dispensario en el que estás trabajando.
        <PacienteForm
          guardarPaciente={guardarPaciente}
          pacienteEditando={pacienteEditando}
          userAllowedCompanies={activeCompanies} 
        />
      )}
      
      {feedback.message && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.message}
        </div>
      )}
      
      <table className="pacientes-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Cédula</th>
            <th>Empresa</th>
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
              <td>{paciente.empr_nom_empr || 'N/A'}</td>
              <td>{formatDateDDMMYYYY(paciente.pacie_fec_nac)}</td>
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