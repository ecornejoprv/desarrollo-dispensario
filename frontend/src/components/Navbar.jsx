import { Link } from "react-router-dom";
import { Menu, X, User, Calendar, Stethoscope, Activity, LogOut } from "lucide-react";
import { logout } from "../api"; // Ajusta la ruta según tu estructura
import "./styles/Navbar.css";
import PropTypes from 'prop-types';

export default function Navbar({ open, setOpen }) {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username"); // Recuperar el nombre del usuario

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
          {/* Mostrar el nombre del usuario */}
          {username && (
            <div className="user-info">
              <User size={18} /> {username}
            </div>
          )}

          {/* Enlaces comunes para todos los roles */}
          <Link to="/Home" onClick={() => setOpen(false)}>
            <User size={18} /> Inicio
          </Link>
          <Link to="/citas" onClick={() => setOpen(false)}>
            <Calendar size={18} /> Citas
          </Link>
          <Link to="/pacientes" onClick={() => setOpen(false)}>
            <Stethoscope size={18} /> Ingreso Pacientes
          </Link>
          <Link to="/historia-clinica" onClick={() => setOpen(false)}>
            <Stethoscope size={18} /> Historia Clinica
          </Link>
          {/* Enlaces específicos basados en el rol */}
          {(role == 1 || role == 2 || role == 3 || role == 4 || role == 5) && (
            <div>
              <button className="submenu-btn">
                <Activity size={18} /> Atención Médica
              </button>
              <div className="submenu">
                {(role == 1 || role == 3) && (
                  <Link to="/odontologia" onClick={() => setOpen(false)}>Odontología</Link>
                )}
                {(role == 1 || role == 4) && (
                  <Link to="/fisioterapia" onClick={() => setOpen(false)}>Fisioterapia</Link>
                )}
                {(role == 1 || role == 5) && (
                  <Link to="/atencita" onClick={() => setOpen(false)}>Enfermería</Link>
                )}
                {(role == 1 || role == 2) && (
                  <Link to="/medicina-general" onClick={() => setOpen(false)}>Medicina General</Link>
                )}
              </div>
            </div>
          )}

          {/* Botón de logout */}
          <button onClick={logout} className="logout-button">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </nav>
      </div>
    </>
  );
  
}
Navbar.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};