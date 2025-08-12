// PacienteForm.jsx
import React, { useState, useEffect } from "react";
// CAMBIO CRÍTICO: Usar 'api' en lugar de 'axios' para todas las llamadas al backend
import api from "../api"; 
import './styles/pacientes.css';

// Función para formatear YYYY-MM-DD a DD/MM/YYYY para mostrar en inputs de texto
const formatDateToDisplay = (dateStr) => {
    if (!dateStr) return "";
    // Si ya tiene formato DD/MM/YYYY, no hace nada. Si viene de YYYY-MM-DD, lo formatea.
    if (dateStr.includes("/")) return dateStr;
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
};

// Función para formatear DD/MM/YYYY a YYYY-MM-DD para enviar al backend
const formatDateForBackend = (dateStr) => {
    if (!dateStr) return "";
    // Si ya tiene formato YYYY-MM-DD, no hace nada. Si viene de DD/MM/YYYY, lo formatea.
    if (dateStr.includes("-")) return dateStr;
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
};

// CAMBIO CLAVE: Aceptar userAllowedCompanies como prop
export default function PacienteForm({ guardarPaciente, pacienteEditando, userAllowedCompanies }) {
    // --- ESTADOS DEL FORMULARIO ---
    const [formData, setFormData] = useState({
        pacie_ced_pacie: "",
        pacie_cod_empr: "", // Código de la empresa, crucial para el filtro
        pacie_tip_pacie: "",
        pacie_emp_famil: "",
        pacie_nom_pacie: "",
        pacie_ape_pacie: "",
        pacie_dir_pacie: "",
        pacie_parr_pacie: "", // Campo Parroquia/Cantón
        pacie_barr_pacie: "",
        pacie_tel_pacie: "",
        pacie_zon_pacie: "",
        pacie_cod_sexo: "",
        pacie_cod_estc: "",
        pacie_cod_relig: "",
        pacie_cod_pais: "",
        pacie_fec_nac: "", 
        pacie_parr_nacim: "", // Campo Parroquia de Nacimiento
        pacie_emai_pacie: "",
        pacie_cod_inst: "",
        pacie_cod_disc: 0, // Inicializar como número 0 o 1
        pacie_por_disc: 0,
        pacie_nom_cont: "",
        pacie_dir_cont: "",
        pacie_tel_con: "",
        pacie_cod_etnia: "",
        pacie_enf_catas: 0, // Inicializar como número 0 o 1
        pacie_cod_sangr: "",
        pacie_cod_osex: "",
        pacie_cod_gener: "",
        pacie_late_pacie: "",
        pacie_est_pacie: "A",
    });

    // --- OTROS ESTADOS ---
    const [errores, setErrores] = useState({});
    // Estados para listas maestras de selects
    const [tiposPacientes, settiposPacientes] = useState([]);
    const [zonas, setZonas] = useState([]);
    const [sexos, setSexos] = useState([]);
    const [estadosCiviles, setEstadosCiviles] = useState([]);
    const [religiones, setReligiones] = useState([]);
    const [paises, setPaises] = useState([]);
    const [etnias, setEtnias] = useState([]);
    const [orientacionesSexuales, setOrientacionesSexuales] = useState([]);
    const [generos, setGeneros] = useState([]);
    // const [lateralidades, setLateralidades] = useState([]); // Comentado si no se usa
    const [empresas, setEmpresas] = useState([]); // Lista de empresas (FILTRADA)
    const [instituciones, setInstrucciones] = useState([]);
    const [tiposSangre, setTiposSangre] = useState([]);
    const [tiposDiscapacidad, setTiposDiscapacidad] = useState([]);
    
    // Estados para control de UI/Errores de envío
    const [loading, setLoading] = useState(false); // Para mostrar estado de carga
    const [submitError, setSubmitError] = useState(null); // Errores al enviar el formulario
    const [verificandoCedula, setVerificandoCedula] = useState(false); // Estado de verificación de cédula


    // Función para verificar cédula en el backend (usa 'api' para enviar el token)
    const verificarCedulaExistente = async (cedula) => {
        if (!cedula) return false;
        
        try {
            setVerificandoCedula(true);
            // CAMBIO CRÍTICO: Usar /api/v1 para la ruta de verificación
            let url = `/api/v1/verificar-cedula?cedula=${cedula}`; 
            
            if (pacienteEditando && pacienteEditando.pacie_cod_pacie) { 
                url += `&id=${pacienteEditando.pacie_cod_pacie}`;
            }
            
            // CAMBIO CRÍTICO: Usar 'api' para la llamada
            const response = await api.get(url); 
            console.log("DEBUG PacienteForm: Verificación de cédula, existe:", response.data.existe); // Log
            return response.data.existe;
        } catch (error) {
            console.error("Error verificando cédula:", error);
            // Mostrar mensaje de error más específico si viene del backend
            setSubmitError(error.response?.data?.message || "Error al verificar la cédula. Intente de nuevo.");
            return false;
        } finally {
            setVerificandoCedula(false);
        }
    };

    // Manejador para cuando el campo de cédula pierde el foco (blur)
    const handleCedulaBlur = async () => {
        // No verificar la cédula si estamos editando y la cédula no ha cambiado
        if (pacienteEditando && pacienteEditando.pacie_ced_pacie === formData.pacie_ced_pacie) {
            return;
        }
        if (!formData.pacie_ced_pacie) {
            setErrores({ ...errores, pacie_ced_pacie: "" }); // Limpiar error si está vacío
            return;
        }
        
        const existe = await verificarCedulaExistente(formData.pacie_ced_pacie);
        if (existe) {
            setErrores({
                ...errores,
                pacie_ced_pacie: "Esta cédula ya está registrada para otro paciente"
            });
        } else {
            setErrores({
                ...errores,
                pacie_ced_pacie: ""
            });
        }
    };

    // useEffect: Obtener datos de las tablas relacionadas (listas maestras para los selects)
    // CAMBIO CLAVE: Ahora el efecto solo se ejecuta si userAllowedCompanies NO es null/undefined
    useEffect(() => {
        // userAllowedCompanies es undefined al inicio hasta que el padre lo setea desde localStorage.
        // Solo procedemos a cargar los datos maestros una vez que sepamos las empresas permitidas.
        if (userAllowedCompanies === undefined) { 
            return; 
        }

        const fetchData = async () => {
            try {
         // CORRIGE LAS URLS DE TODAS LAS LLAMADAS A LOS DATOS MAESTROS
        
        // ANTES:
        // const responsetiposPacientes = await api.get("/api/v1/tipos-pacientes");
        // AHORA:
        const responsetiposPacientes = await api.get("/api/v1/pacientes/tipos-pacientes");
        settiposPacientes(responsetiposPacientes.data);

        // ANTES:
        // const responseZonas = await api.get("/api/v1/zonas");
        // AHORA:
        const responseZonas = await api.get("/api/v1/pacientes/zonas");
        setZonas(responseZonas.data);

        // Repite este patrón para todas las demás:
        const responseSexos = await api.get("/api/v1/pacientes/sexos");
        setSexos(responseSexos.data);

        const responseEstadosCiviles = await api.get("/api/v1/pacientes/estados-civiles");
        setEstadosCiviles(responseEstadosCiviles.data);
        
        const responseReligiones = await api.get("/api/v1/pacientes/religiones");
        setReligiones(responseReligiones.data);

        const responsePaises = await api.get("/api/v1/pacientes/paises");
        setPaises(responsePaises.data);

        const responseEtnias = await api.get("/api/v1/pacientes/etnias");
        setEtnias(responseEtnias.data);

        const responseOrientacionesSexuales = await api.get("/api/v1/pacientes/orientaciones-sexuales");
        setOrientacionesSexuales(responseOrientacionesSexuales.data);

        const responseGeneros = await api.get("/api/v1/pacientes/generos");
        setGeneros(responseGeneros.data);

        const responseInstrucciones = await api.get("/api/v1/pacientes/instrucciones");
        setInstrucciones(responseInstrucciones.data);

        const responseTiposSangre = await api.get("/api/v1/pacientes/tipos-sangre");
        setTiposSangre(responseTiposSangre.data);

        const responseTiposDiscapacidad = await api.get("/api/v1/pacientes/tipos-discapacidad");
        setTiposDiscapacidad(responseTiposDiscapacidad.data);

        const allEmpresas = await api.get("/api/v1/pacientes/empresas");
                
                let filteredEmpresas = [];
                // Solo filtra si userAllowedCompanies tiene elementos (es decir, el usuario tiene acceso a empresas)
                if (userAllowedCompanies.length > 0) { 
                    filteredEmpresas = allEmpresas.data.filter(emp =>
                        userAllowedCompanies.includes(emp.empr_cod_empr)
                    );
                } else {
                    // Si userAllowedCompanies es un array vacío, significa que el usuario no tiene acceso a ninguna empresa.
                    // No hay empresas para filtrar, por lo que la lista filtrada queda vacía.
                    console.warn("DEBUG PacienteForm: userAllowedCompanies es un array vacío. El usuario no tiene empresas asignadas en el token.");
                }
                
                setEmpresas(filteredEmpresas);

                // Si solo hay una empresa permitida, preselecciónala y setea el formData
                if (filteredEmpresas.length === 1) {
                    setFormData(prev => ({
                        ...prev,
                        pacie_cod_empr: filteredEmpresas[0].empr_cod_empr // Setea el ID de la única empresa (como número para el estado)
                    }));
                } else if (filteredEmpresas.length === 0 && userAllowedCompanies.length > 0) {
                     // Esto ocurre si el userAllowedCompanies tiene IDs, pero esos IDs no existen en la lista total de empresas
                     setSubmitError("Sus empresas asignadas no se encontraron en la base de datos.");
                } else if (userAllowedCompanies.length === 0 && !pacienteEditando) { // Si el usuario no tiene ninguna empresa asignada en el JWT Y no está editando
                     setSubmitError("No tiene empresas asignadas para registrar pacientes.");
                }

            } catch (error) {
                console.error("Error al obtener datos maestros:", error);
                setSubmitError(error.response?.data?.message || "Error al cargar datos maestros. Recargue la página.");
            }
        };
        fetchData();
        // userAllowedCompanies es una dependencia crucial para que este efecto se re-ejecute
        // cuando la lista de empresas permitidas del usuario cambia después de la carga inicial.
    }, [userAllowedCompanies]); // CAMBIO CLAVE: userAllowedCompanies como dependencia

    // useEffect: Actualizar el formulario si se está editando un paciente
    useEffect(() => {
        if (pacienteEditando) {
            // Formatear la fecha para que el input type="date" la entienda (YYYY-MM-DD)
            const pacienteFormateado = {
                ...pacienteEditando,
                // Convierte la fecha de la BD a YYYY-MM-DD para el input type="date"
                pacie_fec_nac: pacienteEditando.pacie_fec_nac ? new Date(pacienteEditando.pacie_fec_nac).toISOString().split('T')[0] : "",
                // Asegura que todos los campos que puedan ser null/undefined de la API sean "" o 0
                pacie_parr_pacie: pacienteEditando.pacie_parr_pacie || "",
                pacie_barr_pacie: pacienteEditando.pacie_barr_pacie || "",
                pacie_tel_pacie: pacienteEditando.pacie_tel_pacie || "",
                pacie_zon_pacie: pacienteEditando.pacie_zon_pacie || "",
                pacie_cod_sexo: pacienteEditando.pacie_cod_sexo || "",
                pacie_cod_estc: pacienteEditando.pacie_cod_estc || "",
                pacie_cod_relig: pacienteEditando.pacie_cod_relig || "",
                pacie_cod_pais: pacienteEditando.pacie_cod_pais || "",
                pacie_parr_nacim: pacienteEditando.pacie_parr_nacim || "",
                pacie_emai_pacie: pacienteEditando.pacie_emai_pacie || "",
                pacie_cod_inst: pacienteEditando.pacie_cod_inst || "",
                pacie_por_disc: pacienteEditando.pacie_por_disc || 0, // Numérico
                pacie_nom_cont: pacienteEditando.pacie_nom_cont || "",
                pacie_dir_cont: pacienteEditando.pacie_dir_cont || "",
                pacie_tel_con: pacienteEditando.pacie_tel_con || "",
                pacie_cod_etnia: pacienteEditando.pacie_cod_etnia || "",
                pacie_cod_sangr: pacienteEditando.pacie_cod_sangr || "",
                pacie_cod_osex: pacienteEditando.pacie_cod_osex || "",
                pacie_cod_gener: pacienteEditando.pacie_cod_gener || "",
                pacie_late_pacie: pacienteEditando.pacie_late_pacie || "",
                pacie_est_pacie: pacienteEditando.pacie_est_pacie || "A",
                pacie_emp_famil: pacienteEditando.pacie_emp_famil || "",
                // Asegurar que pacie_cod_empr siempre sea un string para el value del select
                pacie_cod_empr: pacienteEditando.pacie_cod_empr ? String(pacienteEditando.pacie_cod_empr) : "",

                // Asegurar que los campos checkbox se manejen como 0 o 1
                pacie_cod_disc: pacienteEditando.pacie_cod_disc === true || pacienteEditando.pacie_cod_disc === 1 ? 1 : 0,
                pacie_enf_catas: pacienteEditando.pacie_enf_catas === true || pacienteEditando.pacie_enf_catas === 1 ? 1 : 0,
            };
            setFormData(pacienteFormateado);
            setErrores({}); // Limpiar errores al iniciar edición
            setSubmitError(null); // Limpiar errores de submit
        } else {
            // Resetear el formulario a sus valores iniciales si no se está editando
            setFormData({
                pacie_ced_pacie: "",
                // Resetear pacie_cod_empr de manera inteligente:
                // Si solo hay una empresa permitida, preselecciónala. Sino, dejar vacío.
                // Asegurarse que el valor sea un STRING para el select.
                pacie_cod_empr: empresas.length === 1 && userAllowedCompanies.length > 0 ? String(empresas[0].empr_cod_empr) : "",
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
                pacie_cod_disc: 0,
                pacie_por_disc: 0,
                pacie_nom_cont: "",
                pacie_dir_cont: "",
                pacie_tel_con: "",
                pacie_cod_etnia: "",
                pacie_enf_catas: 0,
                pacie_cod_sangr: "",
                pacie_cod_osex: "",
                pacie_cod_gener: "",
                pacie_late_pacie: "",
                pacie_est_pacie: "A",
            });
            setErrores({});
            setSubmitError(null);
        }
    }, [pacienteEditando, empresas, userAllowedCompanies]); // Añadir 'empresas' y 'userAllowedCompanies' como dependencia para resetear inteligente

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({ // Usar la forma funcional de setFormData
            ...prev,
            // Si es un checkbox, actualiza con 1 si está marcado, 0 si no.
            // Para cualquier otro tipo de input, usa el valor del input.
            // Para selects de IDs numéricos, el valor que se guarda en el estado es un STRING.
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));

        // Limpiar errores al escribir
        setErrores(prev => ({ ...prev, [name]: "" })); // Usar forma funcional de setErrores
        setSubmitError(null); 
    };

    // Validar el formulario antes de enviar
    const validarFormulario = () => {
        let nuevosErrores = {};

        if (!formData.pacie_ced_pacie) nuevosErrores.pacie_ced_pacie = "La cédula es obligatoria.";
        if (!formData.pacie_nom_pacie) nuevosErroes.pacie_nom_pacie = "El nombre es obligatorio.";
        if (!formData.pacie_ape_pacie) nuevosErrores.pacie_ape_pacie = "El apellido es obligatorio.";
        if (!formData.pacie_fec_nac) nuevosErrores.pacie_fec_nac = "La fecha de nacimiento es obligatoria.";
        if (!formData.pacie_cod_empr) nuevosErrores.pacie_cod_empr = "La empresa es obligatoria."; 

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0; 
    };

    // Manejar el envío del formulario
        const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError(null); 
    
        if (!validarFormulario()) {
            setSubmitError("Por favor, corrige los campos obligatorios.");
            setLoading(false);
            return;
        }

        // Si es un nuevo paciente, verificar si la cédula ya existe
        if (!pacienteEditando) {
            const cedulaDuplicada = await verificarCedulaExistente(formData.pacie_ced_pacie);
            if (cedulaDuplicada) {
                setErrores(prevErrores => ({
                    ...prevErrores,
                    pacie_ced_pacie: "Esta cédula ya está registrada para otro paciente."
                }));
                setLoading(false);
                setSubmitError("La cédula ingresada ya existe.");
                return;
            }
        }
        
        // --- CAMBIO CLAVE AQUÍ: Ajustar la construcción de dataToSend ---
        // Asegurarse de que todos los valores sean del tipo correcto
        const dataToSend = {
            ...formData, // Esto copia todas las propiedades de formData
            pacie_fec_nac: formatDateForBackend(formData.pacie_fec_nac), // Formatear fecha
            pacie_cod_disc: formData.pacie_cod_disc ? 1 : 0, // 0 o 1 para checkbox
            pacie_enf_catas: formData.pacie_enf_catas ? 1 : 0, // 0 o 1 para checkbox
            pacie_por_disc: Number(formData.pacie_por_disc) || 0, // Asegurar que es número

            // Convertir IDs de selects a números si tu backend los espera como números estrictos
            // aunque usualmente el backend puede hacer el parseInt. Para estar seguros:
            pacie_cod_empr: parseInt(formData.pacie_cod_empr),
            pacie_tip_pacie: formData.pacie_tip_pacie ? parseInt(formData.pacie_tip_pacie) : null,
            pacie_zon_pacie: formData.pacie_zon_pacie ? parseInt(formData.pacie_zon_pacie) : null,
            pacie_cod_sexo: formData.pacie_cod_sexo ? parseInt(formData.pacie_cod_sexo) : null,
            pacie_cod_estc: formData.pacie_cod_estc ? parseInt(formData.pacie_cod_estc) : null,
            pacie_cod_relig: formData.pacie_cod_relig ? parseInt(formData.pacie_cod_relig) : null,
            pacie_cod_pais: formData.pacie_cod_pais ? parseInt(formData.pacie_cod_pais) : null,
            pacie_cod_inst: formData.pacie_cod_inst ? parseInt(formData.pacie_cod_inst) : null,
            pacie_cod_etnia: formData.pacie_cod_etnia ? parseInt(formData.pacie_cod_etnia) : null,
            pacie_cod_osex: formData.pacie_cod_osex ? parseInt(formData.pacie_cod_osex) : null,
            pacie_cod_gener: formData.pacie_cod_gener ? parseInt(formData.pacie_cod_gener) : null,
            pacie_cod_sangr: formData.pacie_cod_sangr ? parseInt(formData.pacie_cod_sangr) : null,

            // Asegurarse de que pacie_parr_nacim sea un string, no un objeto Date si viene de algún lado.
            // Esto ya debería estar bien si usas inputs de texto o fecha con formatos específicos.
            pacie_parr_nacim: formData.pacie_parr_nacim || "",
            
            // Los campos de texto como telefono, email, etc. ya deberían ser strings.
        };

        // Si tienes campos de texto que pueden ser cadenas vacías pero tu BD espera NULL para ellas,
        // podrías convertirlas explícitamente a NULL aquí. Por ejemplo:
        // pacie_emai_pacie: formData.pacie_emai_pacie === "" ? null : formData.pacie_emai_pacie,
        // pacie_emp_famil: formData.pacie_emp_famil === "" ? null : formData.pacie_emp_famil,
        // ... etc.

        // FIN CAMBIO EN dataToSend

        const exito = await guardarPaciente(dataToSend);
        if (!exito) {
            // ... (resto del código) ...
        }
        setLoading(false); 
    };

    return (
        <form onSubmit={handleSubmit} className="paciente-form">
            <h2>{pacienteEditando ? "Editar Paciente" : "Agregar Paciente"}</h2>

            {submitError && (
                <div className="error-message"> 
                    {submitError}
                </div>
            )}

            {/* Sección de Datos Personales */}
            <div className="form-section">
                <h3>🧑 Datos Personales</h3>
                <div className="form-grid">
                    {/* Cédula */}
                    <div className="form-group">
                        <label>Cédula: *</label> 
                        <input
                            type="text"
                            name="pacie_ced_pacie"
                            value={formData.pacie_ced_pacie}
                            onChange={handleChange}
                            onBlur={handleCedulaBlur} 
                            disabled={verificandoCedula || loading} 
                            className={errores.pacie_ced_pacie ? "input-error" : ""} 
                        />
                        {verificandoCedula && <span className="verificando">Verificando...</span>}
                        {errores.pacie_ced_pacie && <span className="error-text">{errores.pacie_ced_pacie}</span>}
                    </div>

                    {/* Nombre */}
                    <div className="form-group">
                        <label>Nombre: *</label>
                        <input
                            type="text"
                            name="pacie_nom_pacie"
                            value={formData.pacie_nom_pacie}
                            onChange={handleChange}
                            className={errores.pacie_nom_pacie ? "input-error" : ""}
                        />
                        {errores.pacie_nom_pacie && <span className="error-text">{errores.pacie_nom_pacie}</span>}
                    </div>

                    {/* Apellido */}
                    <div className="form-group">
                        <label>Apellido: *</label>
                        <input
                            type="text"
                            name="pacie_ape_pacie"
                            value={formData.pacie_ape_pacie}
                            onChange={handleChange}
                            className={errores.pacie_ape_pacie ? "input-error" : ""}
                        />
                        {errores.pacie_ape_pacie && <span className="error-text">{errores.pacie_ape_pacie}</span>}
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
                        <label>Fecha de Nacimiento: *</label>
                        <input
                            type="date" 
                            name="pacie_fec_nac"
                            value={formData.pacie_fec_nac || ""} 
                            onChange={handleChange}
                            className={errores.pacie_fec_nac ? "input-error" : ""}
                        />
                        {errores.pacie_fec_nac && <span className="error-text">{errores.pacie_fec_nac}</span>}
                    </div>

                    {/* Empresa */}
                    <div className="form-group">
                        <label>Empresa: *</label>
                        <select
                            name="pacie_cod_empr"
                            value={formData.pacie_cod_empr}
                            onChange={handleChange}
                            className={errores.pacie_cod_empr ? "input-error" : ""}
                            // Deshabilitar el select si solo hay una opción disponible
                            disabled={empresas.length === 1 && userAllowedCompanies.length > 0} 
                        >
                            <option value="">Seleccione una empresa</option>
                            {/* Renderiza solo las empresas a las que el usuario tiene acceso */}
                            {empresas.map((empresa) => (
                                <option key={empresa.empr_cod_empr} value={empresa.empr_cod_empr}>
                                    {empresa.empr_nom_empr}
                                </option>
                            ))}
                        </select>
                        {errores.pacie_cod_empr && <span className="error-text">{errores.pacie_cod_empr}</span>}
                        {/* Mensaje si no hay empresas disponibles para el usuario */}
                        {empresas.length === 0 && !loading && userAllowedCompanies && userAllowedCompanies.length > 0 && (
                            <span className="error-text">No hay empresas disponibles para su usuario.</span>
                        )}
                        {empresas.length === 0 && !loading && userAllowedCompanies && userAllowedCompanies.length === 0 && (
                            <span className="error-text">No tiene empresas asignadas en su perfil.</span>
                        )}

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
                            <option value="A">Activo</option>
                            <option value="I">Inactivo</option>
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

                    {/* Parroquia/Cantón */}
                    <div className="form-group">
                        <label>Cantón:</label>
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
                            className={errores.pacie_tel_pacie ? "input-error" : ""}
                            maxLength={10}
                        />
                        {errores.pacie_tel_pacie && <span className="error-text">{errores.pacie_tel_pacie}</span>}
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

                    {/* Correo Electrónico (comentado en tu original, se mantiene comentado) */}
                    {/*
                    <div className="form-group">
                        <label>Correo Electrónico:</label>
                        <input
                            type="email"
                            name="pacie_emai_pacie"
                            value={formData.pacie_emai_pacie}
                            onChange={handleChange}
                            className={errores.pacie_emai_pacie ? "input-error" : ""}
                        />
                        {errores.pacie_emai_pacie && <span className="error-text">{errores.pacie_emai_pacie}</span>}
                    </div>
                    */}

                    {/* Nombre de Contacto de Emergencia */}
                    <div className="form-group">
                        <label>Nombre de Contacto de Emergencia:</label>
                        <input
                            type="text"
                            name="pacie_nom_cont"
                            value={formData.pacie_nom_cont}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Teléfono de Contacto de Emergencia */}
                    <div className="form-group">
                        <label>Teléfono de Contacto de Emergencia:</label>
                        <input
                            type="text"
                            name="pacie_tel_con"
                            value={formData.pacie_tel_con}
                            onChange={handleChange}
                            maxLength={10}
                        />
                    </div>
                </div>
            </div>

            {/* Sección de Salud */}
            <div className="form-section">
                <h3>🏥 Información de Salud</h3>
                <div className="form-grid">
                    {/* Discapacidad (Checkbox) */}
                    <div className="form-group">
                        <label>Discapacidad:</label>
                        <input
                            type="checkbox"
                            name="pacie_cod_disc"
                            checked={formData.pacie_cod_disc === 1} // Compara con 1
                            onChange={handleChange}
                            className="small-checkbox"
                        />
                    </div>

                    {/* Mostrar campos condicionales si hay discapacidad */}
                    {formData.pacie_cod_disc === 1 && ( 
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
                                            {tipo.disc_nom_disc}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Enfermedad Catastrófica (Checkbox) */}
                    <div className="form-group">
                        <label>Enfermedad Catastrófica:</label>
                        <input
                            type="checkbox"
                            name="pacie_enf_catas"
                            checked={formData.pacie_enf_catas === 1} // Compara con 1
                            onChange={handleChange}
                            className="small-checkbox"
                        />
                    </div>
                </div>
            </div>
            
            {/* Mensaje de error de envío (submitError) */}
            {submitError && (
                <div className="error-message"> 
                    {submitError}
                </div>
            )}
            
            {/* Botón de envío */}
            <button 
                type="submit" 
                className="submit-button" 
                disabled={loading} 
            >
                {loading ? (
                    "Procesando..."
                ) : (
                    pacienteEditando ? "Actualizar Paciente" : "Agregar Paciente"
                )}
            </button>
        </form>
    );
}