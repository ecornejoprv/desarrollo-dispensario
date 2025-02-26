import { useState, useEffect } from "react"; // Solo importa lo que necesitas
import api from "../api"; // Importar la instancia de `api`

export default function Home() {
  const [citasHoy, setCitasHoy] = useState(0);
  const [citasManana, setCitasManana] = useState(0);
  const [citasSemana, setCitasSemana] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Función para obtener las citas pendientes
  const fetchCitasPendientes = async () => {
    try {
      // Obtener citas para hoy
      const responseHoy = await api.get("/api/v1/citas/hoy");
      setCitasHoy(responseHoy.data.count);

      // Obtener citas para mañana
      const responseManana = await api.get("/api/v1/citas/manana");
      setCitasManana(responseManana.data.count);

      // Obtener citas para esta semana
      const responseSemana = await api.get("/api/v1/citas/semana");
      setCitasSemana(responseSemana.data.count);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching citas:", error);
      setError("Error al cargar las citas. Inténtalo de nuevo más tarde.");
      setLoading(false);
    }
  };

  // Ejecutar la función al cargar el componente
  useEffect(() => {
    fetchCitasPendientes();
  }, []);

  return (
    <div className="home">
      <div className="container">
        <h1>Bienvenido al Dispensario Médico</h1>
        <p>Gestiona fácilmente pacientes, citas y atención médica.</p>

        {/* Dashboard de citas pendientes */}
        <div className="dashboard">
          <h2>Citas Pendientes</h2>
          {loading ? (
            <p>Cargando citas...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>Hoy</h3>
                <p>{citasHoy} citas</p>
              </div>
              <div className="dashboard-card">
                <h3>Mañana</h3>
                <p>{citasManana} citas</p>
              </div>
              <div className="dashboard-card">
                <h3>Esta Semana</h3>
                <p>{citasSemana} citas</p>
              </div>
            </div>
          )}
        </div>

        {/* Tarjetas de acciones rápidas */}
        <div className="card-container">
          <div className="card">
            <h2>Ingreso de Pacientes</h2>
            <p>Registra nuevos pacientes en el sistema.</p>
          </div>
          <div className="card">
            <h2>Agendamiento de Citas</h2>
            <p>Gestiona citas médicas de manera eficiente.</p>
          </div>
          <div className="card">
            <h2>Registro de Atención</h2>
            <p>Documenta cada consulta y tratamiento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}