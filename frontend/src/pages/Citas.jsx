import React, { useState } from "react";
import DatePicker from "react-datepicker"; // Librería para el calendario
import "react-datepicker/dist/react-datepicker.css"; // Estilos del calendario
import './styles/citas.css'
const Citas = () => {
  // Estados para manejar los datos del formulario
  const [especialidad, setEspecialidad] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);

  // Especialidades disponibles
  const especialidades = [
    "Enfermería",
    "Medicina General",
    "Fisioterapia",
    "Odontología",
  ];

  // Horas disponibles (puedes cargarlas dinámicamente desde el backend)
  const horasDelDia = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  // Función para manejar el cambio de fecha
  const handleFechaChange = (date) => {
    setFecha(date);
    // Aquí podrías hacer una llamada al backend para obtener las horas disponibles
    setHorasDisponibles(horasDelDia); // Simulación de horas disponibles
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const cita = {
      especialidad,
      fecha: fecha.toLocaleDateString(),
      hora,
    };
    console.log("Cita agendada:", cita);
    // Aquí podrías enviar los datos al backend
  };

  return (
    <div className="citas-container">
      <h1>Agendar Cita Médica</h1>
      <form onSubmit={handleSubmit} className="citas-form">
        {/* Selección de especialidad */}
        <div className="form-group">
          <label>Especialidad:</label>
          <select
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            required
          >
            <option value="">Seleccione una especialidad</option>
            {especialidades.map((esp, index) => (
              <option key={index} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de fecha */}
        <div className="form-group">
          <label>Fecha:</label>
          <DatePicker
            selected={fecha}
            onChange={handleFechaChange}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()} // No permite seleccionar fechas pasadas
            required
          />
        </div>

        {/* Selección de hora */}
        <div className="form-group">
          <label>Hora:</label>
          <select
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
          >
            <option value="">Seleccione una hora</option>
            {horasDisponibles.map((hora, index) => (
              <option key={index} value={hora}>
                {hora}
              </option>
            ))}
          </select>
        </div>

        {/* Botón de confirmación */}
        <button type="submit" className="submit-button">
          Agendar Cita
        </button>
      </form>
    </div>
  );
};

export default Citas;