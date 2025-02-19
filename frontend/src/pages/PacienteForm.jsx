import React, { useState, useEffect } from "react";

export default function PacienteForm({ guardarPaciente, pacienteEditando }) {
  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    pacie_nom_pacie: "",
    pacie_ape_pacie: "",
    pacie_fec_nac: "",
    pacie_cod_sexo: "",
    pacie_cod_etnia: "",
    pacie_cod_relig: "",
    pacie_cod_inst: "",
    pacie_cod_osex: "",
    pacie_cod_idgen: "",
    pacie_cod_tisa: "",
    pacie_cod_estc: "",
    pacie_cod_tise: "",
    pacie_dir_pacie: "",
    pacie_tel_pacie: "",
    pacie_cor_pacie: "",
    pacie_fec_ingr: "",
    pacie_est_pacie: "Activo",
  });

  // Cargar datos del paciente si está en modo edición
  useEffect(() => {
    if (pacienteEditando) {
      setFormData(pacienteEditando);
    }
  }, [pacienteEditando]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    guardarPaciente(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="paciente-form">
      <h2>{pacienteEditando ? "Editar Paciente" : "Agregar Paciente"}</h2>

      {/* Campos del formulario */}
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          name="pacie_nom_pacie"
          value={formData.pacie_nom_pacie}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Apellido:</label>
        <input
          type="text"
          name="pacie_ape_pacie"
          value={formData.pacie_ape_pacie}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Fecha de Nacimiento:</label>
        <input
          type="date"
          name="pacie_fec_nac"
          value={formData.pacie_fec_nac}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Teléfono:</label>
        <input
          type="text"
          name="pacie_tel_pacie"
          value={formData.pacie_tel_pacie}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Correo:</label>
        <input
          type="email"
          name="pacie_cor_pacie"
          value={formData.pacie_cor_pacie}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Estado:</label>
        <select
          name="pacie_est_pacie"
          value={formData.pacie_est_pacie}
          onChange={handleChange}
          required
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      <button type="submit">{pacienteEditando ? "Actualizar" : "Agregar"}</button>
    </form>
  );
}