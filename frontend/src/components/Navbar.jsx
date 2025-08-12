// src/components/Navbar.jsx (Código con Lógica de Acordeón Corregida)

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from "react-router-dom"; // Se usa NavLink para detectar la ruta activa
import {
  Menu, X, User, LogOut, MapPin, ChevronDown, Home, Calendar, UserPlus,
  ClipboardList, Stethoscope, HeartPulse, ShieldCheck, Activity, Users, FileText, BarChart2, BriefcaseMedical
} from "lucide-react"; // Se importa BriefcaseMedical para Fisioterapia
import { useAuth } from '../components/context/AuthContext';
import api from '../api';
import "./styles/Navbar.css";
import PropTypes from "prop-types";

export default function Navbar({ open, setOpen }) {
  const { user, logout, activeLocation, selectActiveLocation } = useAuth();
  const navigate = useNavigate();
  const role = user ? user.role : null;
  const fullName = user ? user.fullName : null;
  const [availableLocations, setAvailableLocations] = useState([]);
  
  // Estado para manejar qué submenú del acordeón está abierto.
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      if (user) {
        try {
          const response = await api.get('/api/v1/citas/lugares-atencion');
          setAvailableLocations(response.data.data || []);
        } catch (error) {
          console.error("Error al cargar ubicaciones para la navbar:", error);
        }
      }
    };
    fetchLocations();
  }, [user]);
  
  // Función que controla la apertura y cierre del acordeón.
  const handleSubmenuToggle = (submenuId) => {
    setOpenSubmenu(prev => (prev === submenuId ? null : submenuId));
  };
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) { // Cierra el menú en móviles al hacer clic
      setOpen(false);
    }
  };

  return (
    <>
      <button className="menu-button" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1>Dispensario Médico</h1>
        </div>

        <div className="sidebar-content">
          <nav>
            {fullName && (
              <div className="user-info">
                <User size={18} /> <span>{fullName}</span>
              </div>
            )}
            
            {availableLocations.length > 1 && (
              <div className="location-selector">
                <MapPin size={16} />
                <select value={activeLocation || ''} onChange={(e) => selectActiveLocation(e.target.value)}>
                  {availableLocations.map(loc => (
                    <option key={loc.disuc_cod_disuc} value={loc.disuc_cod_disuc}>
                      Trabajando en: {loc.disuc_nom_disuc}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ENLACES PRINCIPALES - Se usa NavLink para que el CSS pueda aplicar un estilo activo */}
            <NavLink to="/home" className="nav-link" onClick={handleLinkClick}><Home size={18} /><span>Inicio</span></NavLink>
            <NavLink to="/citas" className="nav-link" onClick={handleLinkClick}><Calendar size={18} /><span>Citas</span></NavLink>
            <NavLink to="/pacientes" className="nav-link" onClick={handleLinkClick}><UserPlus size={18} /><span>Ingreso Pacientes</span></NavLink>
            <NavLink to="/historia-clinica" className="nav-link" onClick={handleLinkClick}><ClipboardList size={18} /><span>Historia Clínica</span></NavLink>
            
            {/* SUBMENÚ ACORDEÓN: ATENCIÓN MÉDICA */}
            {(role == 1 || role == 2 || role == 3 || role == 4 || role == 5) && (
              <div className="submenu-container">
                <button className="submenu-btn" onClick={() => handleSubmenuToggle('atencion')}>
                  <Stethoscope size={18} /> 
                  <span>Atención Médica</span>
                  <ChevronDown className={`submenu-arrow ${openSubmenu === 'atencion' ? 'open' : ''}`} size={16} />
                </button>
                <div className={`submenu ${openSubmenu === 'atencion' ? 'open' : ''}`}>
                  <div className="submenu-content">
                    {(role == 1 || role == 2) && (<NavLink to="/medicina-general" onClick={handleLinkClick}>Medicina General</NavLink>)}
                    {(role == 1 || role == 3) && (<NavLink to="/odontologia" onClick={handleLinkClick}>Odontología</NavLink>)}
                    {(role == 1 || role == 4) && (<NavLink to="/fisioterapia" onClick={handleLinkClick}>Fisioterapia</NavLink>)}
                    {(role == 1 || role == 5) && (<NavLink to="/enfermeria" onClick={handleLinkClick}>Enfermería</NavLink>)}
                  </div>
                </div>
              </div>
            )}

            {/* SUBMENÚ ACORDEÓN: REPORTES */}
            <div className="submenu-container">
              <button className="submenu-btn" onClick={() => handleSubmenuToggle('reportes')}>
                <BarChart2 size={18} /> 
                <span>Reportes</span>
                <ChevronDown className={`submenu-arrow ${openSubmenu === 'reportes' ? 'open' : ''}`} size={16} />
              </button>
              <div className={`submenu ${openSubmenu === 'reportes' ? 'open' : ''}`}>
                <div className="submenu-content">
                  <NavLink to="/reporte-atenciones" onClick={handleLinkClick}><FileText size={16} /><span>Atenciones</span></NavLink>
                  <NavLink to="/enfermreport" onClick={handleLinkClick}><HeartPulse size={16} /><span>Atenciones Enfermería</span></NavLink>
                  <NavLink to="/cie10report" onClick={handleLinkClick}><Activity size={16} /><span>Reporte CIE10</span></NavLink>
                  <NavLink to="/prevencionreport" onClick={handleLinkClick}><ShieldCheck size={16} /><span>Reporte Prevención</span></NavLink>
                  <NavLink to="/morbireport" onClick={handleLinkClick}><BriefcaseMedical size={16} /><span>Reporte Morbilidad</span></NavLink>
                </div>
              </div>
            </div>

            {role == 1 && (
              <NavLink to="/admin/usuarios" className="nav-link" onClick={handleLinkClick}>
                <Users size={18} /> <span>Gestionar Usuarios</span>
              </NavLink>
            )}
          </nav>
        </div>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} /> <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}

Navbar.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};