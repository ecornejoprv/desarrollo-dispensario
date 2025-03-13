import { useState, useEffect } from "react"; // Solo importa lo que necesitas
import Modal from "./Modal"; // Importar el componente Modal
import api from "../api"; // Importar la instancia de la API
import "./styles/AtencionList.css";
import PropTypes from 'prop-types';

const getEspecialidadIcon = (especialidad) => {
  switch (especialidad) {
    case "Medicina":
      return "🩺"; // Ícono de estetoscopio
    case "Odontologia":
      return "🦷"; // Ícono de diente
    case "Fisioterapia":
      return "💪"; // Ícono de brazo fuerte
    case "Enfermeria":
      return "💉"; // Ícono de jeringa
    default:
      return "";
  }
};

const AtencionList = ({ atenciones, mostrarEspecialidad }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAtencion, setSelectedAtencion] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState([]);

  // Obtener los diagnósticos y procedimientos de la atención seleccionada
  useEffect(() => {
    if (selectedAtencion) {
      const fetchDiagnosticos = async () => {
        try {
          const response = await api.get(`/api/v1/diagnosticos/atencion/${selectedAtencion.aten_cod_aten}`);
          const diagnosticosConProcedimientos = await Promise.all(
            response.data.map(async (diagnostico) => {
              const procedimientosResponse = await api.get(`/api/v1/procedimientos/diagnostico/${diagnostico.diag_cod_diag}`);
              return {
                ...diagnostico,
                procedimientos: procedimientosResponse.data,
              };
            })
          );
          setDiagnosticos(diagnosticosConProcedimientos);
        } catch (error) {
          console.error("Error al obtener diagnósticos y procedimientos:", error);
        }
      };
      fetchDiagnosticos();
    }
  }, [selectedAtencion]);

  // Abrir modal al hacer clic en el motivo
  const openModal = (atencion) => {
    setSelectedAtencion(atencion);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAtencion(null);
    setDiagnosticos([]); // Limpiar los diagnósticos al cerrar el modal
  };

  return (
    <div className="atencion-list">
      <table className="tabla-atenciones">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Motivo</th>
            {mostrarEspecialidad && <th>Especialidad</th>}
          </tr>
        </thead>
        <tbody>
          {atenciones.map((atencion) => (
            <tr key={atencion.aten_cod_aten}>
              <td>{new Date(atencion.aten_fec_aten).toLocaleDateString()}</td>
              <td
                className="motivo-truncado"
                onClick={() => openModal(atencion)} // Abrir modal al hacer clic en el motivo
              >
                {atencion.aten_mot_cons}
              </td>
              {mostrarEspecialidad && (
                <td>
                  <span className="especialidad-icon">{getEspecialidadIcon(atencion.aten_esp_aten)}</span>
                  <span className="especialidad-nombre">{atencion.aten_esp_aten}</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para mostrar detalles del motivo */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Detalles de la Atención">
        {selectedAtencion && (
          <div className="details-section">
            <p><strong>Fecha:</strong> {new Date(selectedAtencion.aten_fec_aten).toLocaleDateString()}</p>
            <p><strong>Motivo:</strong> {selectedAtencion.aten_mot_cons}</p>
            <p><strong>Especialidad:</strong> {selectedAtencion.aten_esp_aten}</p>
            <h4>DIAGNOSTICOS</h4>
            <ul>
              {diagnosticos.map((diagnostico) => (
                <li key={diagnostico.diag_cod_diag}>
                  <table className="cabeceraprocedimiento-table">                  
                    <tbody>
                    <tr>
                      <td className="cie10"><strong>CIE10:</strong> {diagnostico.cie10_id_cie10}</td>
                      <td className="diagnostico"><strong>Diagnóstico:</strong> {diagnostico.cie10_nom_cie10}</td>                      
                      <td className="estado"><strong>Estado:</strong> {diagnostico.diag_est_diag}</td>
                    </tr>
                    <tr>
                      <td className="observacion" colSpan="3"><strong>Observación:</strong> {diagnostico.diag_obs_diag}</td>
                    </tr>
                    </tbody>
                  </table>                
                  <table className="procedimiento-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Procedimiento</th>
                        <th>Observación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnostico.procedimientos?.map((procedimiento) => (
                        <tr key={procedimiento.proc_cod_proc}>
                          <td>{procedimiento.pro10_ide_pro10}</td>
                          <td>{procedimiento.pro10_nom_pro10}</td>
                          <td>{procedimiento.proc_obs_proc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

AtencionList.propTypes = {
  atenciones: PropTypes.arrayOf(PropTypes.shape({
    aten_cod_aten: PropTypes.string.isRequired,
    aten_fec_aten: PropTypes.string.isRequired,
    aten_mot_cons: PropTypes.string.isRequired,
    aten_esp_aten: PropTypes.string,
  })).isRequired,
  mostrarEspecialidad: PropTypes.bool.isRequired,
};

export default AtencionList;