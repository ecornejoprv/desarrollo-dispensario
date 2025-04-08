import React, { useState, useEffect } from "react";
import axios from "axios";
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
    pacie_cod_disc: "",
    pacie_por_disc: "",
    pacie_nom_cont: "",
    pacie_dir_cont: "",
    pacie_tel_con: "",
    pacie_cod_etnia: "",
    pacie_enf_catas: "",
    pacie_cod_sangr: "",
    pacie_cod_osex: "",
    pacie_cod_gener: "",
    pacie_late_pacie: "",
    pacie_est_pacie: "A",
  });

  const [errores, setErrores] = useState({});
  const [tiposPacientes, settiposPacientes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [sexos, setSexos] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [religiones, setReligiones] = useState([]);
  const [paises, setPaises] = useState([]);
  const [etnias, setEtnias] = useState([]);
  const [orientacionesSexuales, setOrientacionesSexuales] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [lateralidades, setLateralidades] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [instituciones, setInstrucciones] = useState([]);
  const [tiposSangre, setTiposSangre] = useState([]);
  const [tiposDiscapacidad, setTiposDiscapacidad] = useState([]);

  // Función para formatear YYYY-MM-DD a DD/MM/YYYY para mostrar
  const formatDateToDisplay = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) return dateStr;
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Función para formatear DD/MM/YYYY a YYYY-MM-DD para enviar al backend
  const formatDateForBackend = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) return dateStr;
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  // Obtener datos de las tablas relacionadas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responsetiposPacientes = await axios.get("/api/tipos-pacientes");
        settiposPacientes(responsetiposPacientes.data);

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

        const responseEmpresas = await axios.get("/api/empresas");
        setEmpresas(responseEmpresas.data);

        const responseInstrucciones = await axios.get("/api/instrucciones");
        setInstrucciones(responseInstrucciones.data);

        const responseTiposSangre = await axios.get("/api/tipos-sangre");
        setTiposSangre(responseTiposSangre.data);

        const responseTiposDiscapacidad = await axios.get("/api/tipos-discapacidad");
        setTiposDiscapacidad(responseTiposDiscapacidad.data);

      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchData();
  }, []);

  // Actualizar el formulario si se está editando un paciente
  useEffect(() => {
    if (pacienteEditando) {
      // Formatear la fecha para mostrarla en DD/MM/YYYY
      const pacienteFormateado = {
        ...pacienteEditando,
        pacie_fec_nac: formatDateToDisplay(pacienteEditando.pacie_fec_nac)
      };
      setFormData(pacienteFormateado);
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
        pacie_cod_disc: "",
        pacie_por_disc: "",
        pacie_nom_cont: "",
        pacie_dir_cont: "",
        pacie_tel_con: "",
        pacie_cod_etnia: "",
        pacie_enf_catas: "",
        pacie_cod_sangr: "",
        pacie_cod_osex: "",
        pacie_cod_gener: "",
        pacie_late_pacie: "",
        pacie_est_pacie: "A",
      });
    }
  }, [pacienteEditando]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });

    // Limpiar errores al escribir
    setErrores({ ...errores, [name]: "" });
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
    
    // Crear copia del formData y formatear la fecha para el backend
    const dataToSend = {
      ...formData,
       pacie_fec_nac: formatDateForBackend(formData.pacie_fec_nac),
      // pacie_cod_disc: formData.pacie_cod_disc ? 1 : 0,
      // pacie_enf_catas: formData.pacie_enf_catas ? 1 : 0,
       pacie_est_pacie: "A" // Mantiene el estado como "A"
    };

    guardarPaciente(dataToSend);
    
    // Resetear el formulario
    setFormData({
      pacie_ced_pacie: "",
      pacie_nom_pacie: "",
      pacie_ape_pacie: "",
      pacie_tel_pacie: "",
      pacie_emai_pacie: "",
      pacie_fec_nac: "",
      pacie_est_pacie: "A",
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

          {/* Tipo Paciente */}
          <div className="form-group">
            <label>Tipo Paciente:</label>
            <select
              name="pacie_tip_pacie"
              value={formData.pacie_tip_pacie}
              onChange={handleChange}
            >
              <option value="">Seleccione un tipo</option>
              {tiposPacientes.map((tiposPacientes) => (
                <option key={tiposPacientes.tipa_cod_tipa} value={tiposPacientes.tipa_cod_tipa}>
                  {tiposPacientes.tipa_nom_tipa}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de Nacimiento */}
          <div className="form-group">
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              name="pacie_fec_nac"
              value={
                formData.pacie_fec_nac && formData.pacie_fec_nac.includes("/") 
                  ? formatDateForBackend(formData.pacie_fec_nac) 
                  : formData.pacie_fec_nac || ""
              }
              onChange={handleChange}
            />
            {errores.pacie_fec_nac && <span className="error">{errores.pacie_fec_nac}</span>}
          </div>

          {/* Empresa */}
          <div className="form-group">
            <label>Empresa:</label>
            <select
              name="pacie_cod_empr"
              value={formData.pacie_cod_empr}
              onChange={handleChange}
            >
              <option value="">Seleccione una empresa</option>
              {empresas.map((empresas) => (
                <option key={empresas.empr_cod_empr} value={empresas.empr_cod_empr}>
                  {empresas.empr_nom_empr}
                </option>
              ))}
            </select>
          </div>

          {/* Zona */}
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
                <option key={sexo.sexo_cod_sexo} value={sexo.sexo_cod_sexo}>
                  {sexo.sexo_nom_sexo}
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

          {/* Religión */}
          <div className="form-group">
            <label>Religión:</label>
            <select
              name="pacie_cod_relig"
              value={formData.pacie_cod_relig}
              onChange={handleChange}
            >
              <option value="">Seleccione una religión</option>
              {religiones.map((religion) => (
                <option key={religion.relig_cod_relig} value={religion.relig_cod_relig}>
                  {religion.relig_nom_relig}
                </option>
              ))}
            </select>
          </div>

          {/* País */}
          <div className="form-group">
            <label>País:</label>
            <select
              name="pacie_cod_pais"
              value={formData.pacie_cod_pais}
              onChange={handleChange}
            >
              <option value="">Seleccione un país</option>
              {paises.map((pais) => (
                <option key={pais.pais_cod_pais} value={pais.pais_cod_pais}>
                  {pais.pais_nom_pais}
                </option>
              ))}
            </select>
          </div>

          {/* Institución */}
          <div className="form-group">
            <label>Instrucción:</label>
            <select
              name="pacie_cod_inst"
              value={formData.pacie_cod_inst}
              onChange={handleChange}
            >
              <option value="">Seleccione una</option>
              {instituciones.map((institucion) => (
                <option key={institucion.instr_cod_inst} value={institucion.instr_cod_inst}>
                  {institucion.instr_nom_inst}
                </option>
              ))}
            </select>
          </div>

          {/* Etnia */}
          <div className="form-group">
            <label>Etnia:</label>
            <select
              name="pacie_cod_etnia"
              value={formData.pacie_cod_etnia}
              onChange={handleChange}
            >
              <option value="">Seleccione una etnia</option>
              {etnias.map((etnia) => (
                <option key={etnia.etnia_cod_etnia} value={etnia.etnia_cod_etnia}>
                  {etnia.etnia_nom_etnia}
                </option>
              ))}
            </select>
          </div>

          {/* Orientación Sexual */}
          <div className="form-group">
            <label>Orientación Sexual:</label>
            <select
              name="pacie_cod_osex"
              value={formData.pacie_cod_osex}
              onChange={handleChange}
            >
              <option value="">Seleccione una orientación sexual</option>
              {orientacionesSexuales.map((orientacion) => (
                <option key={orientacion.dmosex_cod_osex} value={orientacion.dmosex_cod_osex}>
                  {orientacion.dmosex_nom_osex}
                </option>
              ))}
            </select>
          </div>

          {/* Género */}
          <div className="form-group">
            <label>Género:</label>
            <select
              name="pacie_cod_gener"
              value={formData.pacie_cod_gener}
              onChange={handleChange}
            >
              <option value="">Seleccione un género</option>
              {generos.map((genero) => (
                <option key={genero.idgen_cod_idgen} value={genero.idgen_cod_idgen}>
                  {genero.idgen_nom_idgen}
                </option>
              ))}
            </select>
          </div>

          {/* Lateralidad */}
          <div className="form-group">
            <label>Lateralidad:</label>
            <select
              name="pacie_late_pacie"
              value={formData.pacie_late_pacie}
              onChange={handleChange}
            >
              <option value="">Seleccione una lateralidad</option>
              <option value="DE">DIESTRA</option>
              <option value="IZ">ZURDA</option>
              <option value="AM">AMBIDIESTRO</option>
            </select>
          </div>

          {/* Tipo de Sangre */}
          <div className="form-group">
            <label>Tipo de Sangre:</label>
            <select
              name="pacie_cod_sangr"
              value={formData.pacie_cod_sangr}
              onChange={handleChange}
            >
              <option value="">Seleccione un tipo de sangre</option>
              {tiposSangre.map((tipo) => (
                <option key={tipo.tisan_cod_tisa} value={tipo.tisan_cod_tisa}>
                  {tipo.tisan_nom_tisa}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div className="form-group">
            <label>Estado:</label>
            <select
              name="pacie_est_pacie"
              value={formData.pacie_est_pacie}
              onChange={handleChange}
            >
              <option value="A">A</option>
              <option value="I">I</option>
            </select>
          </div>

          {/* Empresa Familiar (condicional) */}
          {formData.pacie_tip_pacie === "3" && (
            <div className="form-group">
              <label>Empresa Familiar:</label>
              <input
                type="text"
                name="pacie_emp_famil"
                value={formData.pacie_emp_famil}
                onChange={handleChange}
              />
            </div>
          )}
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
          {/* Discapacidad */}
          <div className="form-group">
            <label>Discapacidad:</label>
            <input
              type="checkbox"
              name="pacie_cod_disc"
              checked={formData.pacie_cod_disc === 1}
              onChange={handleChange}
              className="small-checkbox"
            />
          </div>

          {/* Mostrar campos condicionales si hay discapacidad */}
          {formData.pacie_cod_disc && (
            <>
              {/* Porcentaje de Discapacidad */}
              <div className="form-group">
                <label>Porcentaje de Discapacidad:</label>
                <input
                  type="number"
                  name="pacie_por_disc"
                  value={formData.pacie_por_disc}
                  onChange={handleChange}
                  className="small-input"
                />
              </div>

              {/* Tipo de Discapacidad */}
              <div className="form-group">
                <label>Tipo de Discapacidad:</label>
                <select
                  name="pacie_tipo_disc"
                  value={formData.pacie_tipo_disc}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un tipo</option>
                  {tiposDiscapacidad.map((tipo) => (
                    <option key={tipo.disc_cod_disc} value={tipo.disc_cod_disc}>
                      {tipo.disc_nombre_disc}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Enfermedad Catastrófica */}
          <div className="form-group">
            <label>Enfermedad Catastrófica:</label>
            <input
              type="checkbox"
              name="pacie_enf_catas"
              checked={formData.pacie_enf_catas === 1}
              onChange={handleChange}
              className="small-checkbox"
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