import React, { useState, useEffect } from "react";
import './styles/pacientes.css';

export default function PacienteForm({ guardarPaciente, pacienteEditando }) {
  const [formData, setFormData] = useState({
    pacie_ced_pacie: "",
    pacie_cod_empr: "",
    pacie_tip_pacie: "",
    pacie_emp_famil: "",
    pacie_nom_pacie: "",
    pacie_ape_pacie: "",
    pacie_dir_pacie: "",
    pacie_parr_pacie: "",
    pacie_barr_pacie: "",
    pacie_tel_pacie: "",
    pacie_zon_pacie: "",
    pacie_cod_sexo: "",
    pacie_cod_estc: "",
    pacie_cod_relig: "",
    pacie_cod_pais: "",
    pacie_fec_nac: "",
    pacie_parr_nacim: "",
    pacie_emai_pacie: "",
    pacie_cod_inst: "",
    pacie_cod_disc: false,
    pacie_por_disc: 0,
    pacie_nom_cont: "",
    pacie_dir_cont: "",
    pacie_tel_con: "",
    pacie_cod_etnia: "",
    pacie_enf_catas: false,
    pacie_cod_sangr: "",
    pacie_cod_osex: "",
    pacie_cod_gener: "",
    pacie_late_pacie: "",
    pacie_est_pacie: "Activo",
  });
  const [errores, setErrores] = useState({});
  useEffect(() => {
    if (pacienteEditando) {
      setFormData(pacienteEditando);
    } else {
      setFormData({
        pacie_ced_pacie: "",
        pacie_cod_empr: "",
        pacie_tip_pacie: "",
        pacie_emp_famil: "",
        pacie_nom_pacie: "",
        pacie_ape_pacie: "",
        pacie_dir_pacie: "",
        pacie_parr_pacie: "",
        pacie_barr_pacie: "",
        pacie_tel_pacie: "",
        pacie_zon_pacie: "",
        pacie_cod_sexo: "",
        pacie_cod_estc: "",
        pacie_cod_relig: "",
        pacie_cod_pais: "",
        pacie_fec_nac: "",
        pacie_parr_nacim: "",
        pacie_emai_pacie: "",
        pacie_cod_inst: "",
        pacie_cod_disc: false,
        pacie_por_disc: 0,
        pacie_nom_cont: "",
        pacie_dir_cont: "",
        pacie_tel_con: "",
        pacie_cod_etnia: "",
        pacie_enf_catas: false,
        pacie_cod_sangr: "",
        pacie_cod_osex: "",
        pacie_cod_gener: "",
        pacie_late_pacie: "",
        pacie_est_pacie: "Activo",
      });
    }
  }, [pacienteEditando]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrores({ ...errores, [name]: "" }); // Limpiar errores al escribir
  };

  const validarFormulario = () => {
    let errores = {};

    if (!formData.pacie_ced_pacie) errores.pacie_ced_pacie = "La cédula es obligatoria.";
    if (!formData.pacie_nom_pacie) errores.pacie_nom_pacie = "El nombre es obligatorio.";
    if (!formData.pacie_ape_pacie) errores.pacie_ape_pacie = "El apellido es obligatorio.";
    if (!formData.pacie_tel_pacie) errores.pacie_tel_pacie = "El teléfono es obligatorio.";
    if (!formData.pacie_emai_pacie) errores.pacie_emai_pacie = "El correo electrónico es obligatorio.";
    if (!formData.pacie_fec_nac) errores.pacie_fec_nac = "La fecha de nacimiento es obligatoria.";

    setErrores(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
    guardarPaciente(formData);
    setFormData({
      pacie_ced_pacie: "",
      pacie_nom_pacie: "",
      pacie_ape_pacie: "",
      pacie_tel_pacie: "",
      pacie_emai_pacie: "",
      pacie_fec_nac: "",
      pacie_est_pacie: "Activo",
    });
  };
  

  return (
    <form onSubmit={handleSubmit} className="paciente-form">
      <h2>{pacienteEditando ? "Editar Paciente" : "Agregar Paciente"}</h2>
  
      {/* Sección de Datos Personales */}
      <div className="form-section">
        <h3>🧑 Datos Personales</h3>
        <div className="form-grid">
          {["pacie_ced_pacie", "pacie_nom_pacie", "pacie_ape_pacie", "pacie_fec_nac", "pacie_cod_sexo", "pacie_cod_estc"].map((key) => (
            <div className="form-group" key={key}>
              <label>{key.replace(/pacie_|_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}:</label>
              <input
                type={key.includes("fec") ? "date" : "text"}
                name={key}
                value={formData[key]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
      </div>
  
      {/* Sección de Contacto */}
      <div className="form-section">
        <h3>📞 Datos de Contacto</h3>
        <div className="form-grid">
          {["pacie_dir_pacie", "pacie_parr_pacie", "pacie_tel_pacie", "pacie_emai_pacie", "pacie_nom_cont", "pacie_tel_con"].map((key) => (
            <div className="form-group" key={key}>
              <label>{key.replace(/pacie_|_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}:</label>
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>
      </div>
  
      {/* Sección de Salud */}
      <div className="form-section">
        <h3>🏥 Información de Salud</h3>
        <div className="form-grid">
          {["pacie_cod_sangr", "pacie_cod_disc", "pacie_por_disc", "pacie_enf_catas"].map((key) => (
            <div className="form-group" key={key}>
              <label>{key.replace(/pacie_|_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}:</label>
              {typeof formData[key] === 'boolean' ? (
                <input
                  type="checkbox"
                  name={key}
                  checked={formData[key]}
                  onChange={handleChange}
                />
              ) : (
                <input
                  type={key.includes("por_disc") ? "number" : "text"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
        </div>
      </div>
  
      <button type="submit" className="submit-button">
        {pacienteEditando ? "Actualizar Paciente" : "Agregar Paciente"}
      </button>
    </form>
  );
  
}
