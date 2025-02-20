import React, { useState, useEffect } from "react";
import axios from "axios"; // Asegúrate de instalar axios: npm install axios
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

  // Estados para los datos de las tablas relacionadas
  const [zonas, setZonas] = useState([]);
  const [sexos, setSexos] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [religiones, setReligiones] = useState([]);
  const [paises, setPaises] = useState([]);
  const [etnias, setEtnias] = useState([]);
  const [orientacionesSexuales, setOrientacionesSexuales] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [lateralidades, setLateralidades] = useState([]);

  // Obtener datos de las tablas relacionadas al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseZonas = await axios.get("/api/zonas");
        setZonas(responseZonas.data);

        const responseSexos = await axios.get("/api/sexos");
        setSexos(responseSexos.data);

        const responseEstadosCiviles = await axios.get("/api/estados-civiles");
        setEstadosCiviles(responseEstadosCiviles.data);

        const responseReligiones = await axios.get("/api/religiones");
        setReligiones(responseReligiones.data);

        const responsePaises = await axios.get("/api/paises");
        setPaises(responsePaises.data);

        const responseEtnias = await axios.get("/api/etnias");
        setEtnias(responseEtnias.data);

        const responseOrientacionesSexuales = await axios.get("/api/orientaciones-sexuales");
        setOrientacionesSexuales(responseOrientacionesSexuales.data);

        const responseGeneros = await axios.get("/api/generos");
        setGeneros(responseGeneros.data);

        const responseLateralidades = await axios.get("/api/lateralidades");
        setLateralidades(responseLateralidades.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchData();
  }, []);

  // Actualizar el formulario si se está editando un paciente
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

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrores({ ...errores, [name]: "" }); // Limpiar errores al escribir
  };

  // Validar el formulario antes de enviar
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

  // Manejar el envío del formulario
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
          {/* Cédula */}
          <div className="form-group">
            <label>Cédula:</label>
            <input
              type="text"
              name="pacie_ced_pacie"
              value={formData.pacie_ced_pacie}
              onChange={handleChange}
            />
            {errores.pacie_ced_pacie && <span className="error">{errores.pacie_ced_pacie}</span>}
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="pacie_nom_pacie"
              value={formData.pacie_nom_pacie}
              onChange={handleChange}
            />
            {errores.pacie_nom_pacie && <span className="error">{errores.pacie_nom_pacie}</span>}
          </div>

          {/* Apellido */}
          <div className="form-group">
            <label>Apellido:</label>
            <input
              type="text"
              name="pacie_ape_pacie"
              value={formData.pacie_ape_pacie}
              onChange={handleChange}
            />
            {errores.pacie_ape_pacie && <span className="error">{errores.pacie_ape_pacie}</span>}
          </div>

          {/* Fecha de Nacimiento */}
          <div className="form-group">
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              name="pacie_fec_nac"
              value={formData.pacie_fec_nac}
              onChange={handleChange}
            />
            {errores.pacie_fec_nac && <span className="error">{errores.pacie_fec_nac}</span>}
          </div>
           {/* Campo de Zona */}
          <div className="form-group">
            <label>Zona:</label>
            <select
              name="pacie_zon_pacie"
              value={formData.pacie_zon_pacie}
              onChange={handleChange}
            >
              <option value="">Seleccione una zona</option>
              {zonas.map((zona) => (
                <option key={zona.zona_cod_zona} value={zona.zona_cod_zona}>
                  {zona.zona_nom_zona}
                </option>
              ))}
            </select>
      </div>

          {/* Sexo */}
          <div className="form-group">
            <label>Sexo:</label>
            <select
              name="pacie_cod_sexo"
              value={formData.pacie_cod_sexo}
              onChange={handleChange}
            >
              <option value="">Seleccione un sexo</option>
              {sexos.map((sexo) => (
                <option key={sexo.dmsexo_cod_sexo} value={sexo.dmsexo_cod_sexo}>
                  {sexo.dmsexo_nom_sexo}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Civil */}
          <div className="form-group">
            <label>Estado Civil:</label>
            <select
              name="pacie_cod_estc"
              value={formData.pacie_cod_estc}
              onChange={handleChange}
            >
              <option value="">Seleccione un estado civil</option>
              {estadosCiviles.map((estado) => (
                <option key={estado.estci_cod_estc} value={estado.estci_cod_estc}>
                  {estado.estci_nom_estc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sección de Contacto */}
      <div className="form-section">
        <h3>📞 Datos de Contacto</h3>
        <div className="form-grid">
          {/* Dirección */}
          <div className="form-group">
            <label>Dirección:</label>
            <input
              type="text"
              name="pacie_dir_pacie"
              value={formData.pacie_dir_pacie}
              onChange={handleChange}
            />
          </div>

          {/* Parroquia */}
          <div className="form-group">
            <label>Parroquia:</label>
            <input
              type="text"
              name="pacie_parr_pacie"
              value={formData.pacie_parr_pacie}
              onChange={handleChange}
            />
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label>Teléfono:</label>
            <input
              type="text"
              name="pacie_tel_pacie"
              value={formData.pacie_tel_pacie}
              onChange={handleChange}
            />
            {errores.pacie_tel_pacie && <span className="error">{errores.pacie_tel_pacie}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Correo Electrónico:</label>
            <input
              type="email"
              name="pacie_emai_pacie"
              value={formData.pacie_emai_pacie}
              onChange={handleChange}
            />
            {errores.pacie_emai_pacie && <span className="error">{errores.pacie_emai_pacie}</span>}
          </div>

          {/* Nombre de Contacto */}
          <div className="form-group">
            <label>Nombre de Contacto:</label>
            <input
              type="text"
              name="pacie_nom_cont"
              value={formData.pacie_nom_cont}
              onChange={handleChange}
            />
          </div>

          {/* Teléfono de Contacto */}
          <div className="form-group">
            <label>Teléfono de Contacto:</label>
            <input
              type="text"
              name="pacie_tel_con"
              value={formData.pacie_tel_con}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Sección de Salud */}
      <div className="form-section">
        <h3>🏥 Información de Salud</h3>
        <div className="form-grid">
          {/* Tipo de Sangre */}
          <div className="form-group">
            <label>Tipo de Sangre:</label>
            <input
              type="text"
              name="pacie_cod_sangr"
              value={formData.pacie_cod_sangr}
              onChange={handleChange}
            />
          </div>

          {/* Discapacidad */}
          <div className="form-group">
            <label>Discapacidad:</label>
            <input
              type="checkbox"
              name="pacie_cod_disc"
              checked={formData.pacie_cod_disc}
              onChange={handleChange}
            />
          </div>

          {/* Porcentaje de Discapacidad */}
          <div className="form-group">
            <label>Porcentaje de Discapacidad:</label>
            <input
              type="number"
              name="pacie_por_disc"
              value={formData.pacie_por_disc}
              onChange={handleChange}
            />
          </div>

          {/* Enfermedad Catastrófica */}
          <div className="form-group">
            <label>Enfermedad Catastrófica:</label>
            <input
              type="checkbox"
              name="pacie_enf_catas"
              checked={formData.pacie_enf_catas}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Botón de envío */}
      <button type="submit" className="submit-button">
        {pacienteEditando ? "Actualizar Paciente" : "Agregar Paciente"}
      </button>
    </form>
  );
}