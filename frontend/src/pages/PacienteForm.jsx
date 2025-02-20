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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    guardarPaciente(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="paciente-form">
      <h2>{pacienteEditando ? "Editar Paciente" : "Agregar Paciente"}</h2>

      <div className="form-section">
        <h3>Datos Generales</h3>
        <div className="form-grid">
          {Object.entries(formData).map(([key, value]) => (
            <div className="form-group" key={key}>
              <label>{key.replace(/pacie_|_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}:</label>
              {typeof value === 'boolean' ? (
                <input
                  type="checkbox"
                  name={key}
                  checked={value}
                  onChange={handleChange}
                />
              ) : (
                <input
                  type={key.includes("fec") ? "date" : key.includes("por_disc") ? "number" : "text"}
                  name={key}
                  value={value}
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
