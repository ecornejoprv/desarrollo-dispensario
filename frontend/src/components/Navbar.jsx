import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Importar iconos

export default function Navbar({ open, setOpen }) {
  return (
    <>
      {/* Botón fijo para abrir/cerrar el menú */}
      <button className="menu-button" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar con clases dinámicas para mostrar u ocultar */}
      <div className={`sidebar ${open ? "open" : ""}`}>
        <h1>Dispensario Médico</h1>
        <nav>
          <Link to="/" onClick={() => setOpen(false)}>Inicio</Link>
          <Link to="/citas" onClick={() => setOpen(false)}>Citas</Link>
          <Link to="/pacientes" onClick={() => setOpen(false)}>Ingreso Pacientes</Link>
          
          <div>
            <button className="submenu-btn">Atención Médica</button>
            <div className="submenu">
              <Link to="/odontologia" onClick={() => setOpen(false)}>Odontología</Link>
              <Link to="/fisioterapia" onClick={() => setOpen(false)}>Fisioterapia</Link>
              <Link to="/enfermeria" onClick={() => setOpen(false)}>Enfermería</Link>
              <Link to="/medicina-general" onClick={() => setOpen(false)}>Medicina General</Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
