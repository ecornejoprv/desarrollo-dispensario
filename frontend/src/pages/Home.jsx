export default function Home() {
  return (
    <div className="home">
      <div className="container">
        <h1>Bienvenido al Dispensario Médico</h1>
        <p>Gestiona fácilmente pacientes, citas y atención médica.</p>

        {/* Dashboard de citas pendientes */}
        <div className="dashboard">
          <h2>Citas Pendientes</h2>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Hoy</h3>
              <p>5 citas</p>
            </div>
            <div className="dashboard-card">
              <h3>Mañana</h3>
              <p>3 citas</p>
            </div>
            <div className="dashboard-card">
              <h3>Esta Semana</h3>
              <p>15 citas</p>
            </div>
          </div>
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