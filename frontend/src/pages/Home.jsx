
export default function Home() {
  console.log("Home component is rendering");
  return (
    <div className="home">
      <div className="container">
        <h1>Bienvenido al Dispensario Médico</h1>
        <p>Gestiona fácilmente pacientes, citas y atención médica.</p>

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
