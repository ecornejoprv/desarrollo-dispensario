import React, { useState } from "react";
import "./styles/odontologia.css";

const dientesSuperiores = [
  { id: 1, nombre: "Incisivo central superior derecho" },
  { id: 2, nombre: "Incisivo lateral superior derecho" },
  { id: 3, nombre: "Canino superior derecho" },
  { id: 4, nombre: "Premolar superior derecho" },
  { id: 5, nombre: "Premolar superior izquierdo" },
  { id: 6, nombre: "Canino superior izquierdo" },
  { id: 7, nombre: "Incisivo lateral superior izquierdo" },
  { id: 8, nombre: "Incisivo central superior izquierdo" }
];

const dientesInferiores = [
  { id: 9, nombre: "Incisivo central inferior derecho" },
  { id: 10, nombre: "Incisivo lateral inferior derecho" },
  { id: 11, nombre: "Canino inferior derecho" },
  { id: 12, nombre: "Premolar inferior derecho" },
  { id: 13, nombre: "Premolar inferior izquierdo" },
  { id: 14, nombre: "Canino inferior izquierdo" },
  { id: 15, nombre: "Incisivo lateral inferior izquierdo" },
  { id: 16, nombre: "Incisivo central inferior izquierdo" }
];

const Odontologia = () => {
  const [dientesSeleccionados, setDientesSeleccionados] = useState({});

  // Manejo de selección de dientes
  const handleDienteClick = (id, nombre) => {
    setDientesSeleccionados((prev) => ({
      ...prev,
      [id]: prev[id] ? undefined : { nombre, diagnostico: "" }
    }));
  };

  // Manejo del diagnóstico
  const handleDiagnosticoChange = (id, diagnostico) => {
    setDientesSeleccionados((prev) => ({
      ...prev,
      [id]: { ...prev[id], diagnostico }
    }));
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const diagnosticosFinales = Object.entries(dientesSeleccionados)
      .filter(([_, data]) => data !== undefined)
      .map(([_, data]) => data);

    console.log("Registro de atención:", diagnosticosFinales);
    // Aquí podrías enviar los datos al backend
  };

  return (
    <div className="odontologia-container">
      <h1>Atención Odontológica</h1>
      <form onSubmit={handleSubmit} className="odontologia-form">
        {/* Simulación de dentadura */}
        <div className="dentadura">
          <h3>Seleccione los dientes:</h3>

          <div className="dientes-superiores">
            {dientesSuperiores.map((diente) => (
              <button
                key={diente.id}
                type="button"
                className={`diente ${dientesSeleccionados[diente.id] ? "seleccionado" : ""}`}
                onClick={() => handleDienteClick(diente.id, diente.nombre)}
              >
                {diente.id}
              </button>
            ))}
          </div>

          <div className="dientes-inferiores">
            {dientesInferiores.map((diente) => (
              <button
                key={diente.id}
                type="button"
                className={`diente ${dientesSeleccionados[diente.id] ? "seleccionado" : ""}`}
                onClick={() => handleDienteClick(diente.id, diente.nombre)}
              >
                {diente.id}
              </button>
            ))}
          </div>
        </div>

        {/* Diagnósticos */}
        {Object.entries(dientesSeleccionados)
          .filter(([_, data]) => data !== undefined)
          .map(([id, data]) => (
            <div key={id} className="diagnostico">
              <p><strong>{data.nombre}</strong></p>
              <input
                type="text"
                placeholder="Ingrese diagnóstico"
                value={data.diagnostico}
                onChange={(e) => handleDiagnosticoChange(id, e.target.value)}
              />
            </div>
          ))}

        {/* Botón de confirmación */}
        <button type="submit" className="submit-button">
          Registrar Atención
        </button>
      </form>
    </div>
  );
};

export default Odontologia;
