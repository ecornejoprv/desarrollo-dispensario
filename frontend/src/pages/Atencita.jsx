import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Atencita = () => {
  const [citas, setCitas] = useState([]);
  const navigate = useNavigate();

  // Obtener las citas pendientes al cargar el componente
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const { data } = await axios.get("/api/v1/citas"); // Ajusta la ruta de tu API
        setCitas(data);
      } catch (error) {
        console.error("Error fetching citas:", error);
      }
    };
    fetchCitas();
  }, []);

  // Función para manejar el clic en "Registrar Atención"
  const handleRegistrarAtencion = (cita) => {
    navigate("/enfermeria", { state: { cita } }); // Redirige a enfermeria.jsx con los datos de la cita
  };

  return (
    <div className="atencita-container">
      <h1>Citas Pendientes</h1>
      {citas.length === 0 ? (
        <p>No hay citas pendientes.</p>
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
                <button onClick={() => handleRegistrarAtencion(cita)}>
                  Registrar Atención
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Atencita;