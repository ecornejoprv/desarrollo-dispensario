import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  Box,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Autocomplete,
  Grid,
  Chip,
  FormControlLabel,
  Checkbox,
  Collapse,
  Switch,
  RadioGroup,
  Radio
} from "@mui/material";
import { Add, Delete, Search, Close } from "@mui/icons-material";
import api from "../api";
import styles from "./styles/Fisioterapia.module.css";
import AtencionList from "../components/AtencionList";
import { Popper } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AirIcon from "@mui/icons-material/Air";
import SpeedIcon from "@mui/icons-material/Speed";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import HeightIcon from "@mui/icons-material/Height";
import CalculateIcon from "@mui/icons-material/Calculate";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PrintIcon from "@mui/icons-material/LocalHospital";

const especialidades = [
  "Todas",
  "Medicina",
  "Odontologia",
  "Fisioterapia",
  "Enfermeria",
];

// Definición de terapias y sus técnicas
const terapiasOptions = {
  "Terapia Física": [
    "Electroterapia",
    "Ultrasonido",
    "Láser",
    "Magnetoterapia",
    "Compresas calientes",
    "Compresas frias",
    "Contraste",
    "Masoterapia",
    "Manipulación manual",
    "Movilidad activa",
    "Movilidad pasiva",
    "Fortalecimiento",
    "Terapia Invasiva",
  ],
  "Terapia Neurológica": [
    "Electroterapia",
    "Ultrasonido",
    "Láser",
    "Magnetoterapia",
    "Método Bobath",
    "Disco vestibular",
    "Masoterapia",
    "Reducción de la marcha",
    "Ejercicios faciales",
    "Movilidad pasiva",
    "Movilidad activa",
    "AVD",
    "Terapia Invasiva",
  ],
  "Terapia Respiratoria": [
    "Compresas calientes",
    "Compresas frias",
    "Contraste",
    "Nebulizaciones",
    "Ejercicios respiratorios",
    "Terapia Invasiva",
  ],
  "Terapia Geriátrica": [
    "Electroterapia",
    "Ultrasonido",
    "Láser",
    "Magnetoterapia",
    "Compresas calientes",
    "Compresas frias",
    "Contraste",
    "Movilidad activa",
    "Movilidad pasiva",
    "Fortalecimiento",
    "Reducción de la marcha",
    "AVD",
    "Masoterapia",
    "Terapia Invasiva",
  ],
  "Terapia Pediátrica": [
    "Compresas calientes",
    "Compresas frias",
    "Contraste",
    "Masoterapia",
    "Método de Bobath",
    "Estimulación temprana",
    "Terapia Invasiva",
  ],
};

const Fisioterapia = () => {
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [enfermedadActual, setEnfermedadActual] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openCie10Modal, setOpenCie10Modal] = useState(false);
  const [cie10Options, setCie10Options] = useState([]);
  const [selectedDiagnosticoIndex, setSelectedDiagnosticoIndex] =
    useState(null);
  const [openHistoriaClinicaModal, setOpenHistoriaClinicaModal] =
    useState(false);
  const [paciente, setPaciente] = useState(null);
  const [atenciones, setAtenciones] = useState([]);
  const [totalAtenciones, setTotalAtenciones] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [mostrarEspecialidad, setMostrarEspecialidad] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] =
    useState("Todas");
  const [tipoAtencion, setTipoAtencion] = useState("Subsecuente");
  const [prescripciones, setPrescripciones] = useState([]);
  const [productoOptions, setProductoOptions] = useState([]);
  const [referencias, setReferencias] = useState([]);
  const [indicacionesGenerales, setIndicacionesGenerales] = useState([]);
  const [openConfirmCancelModal, setOpenConfirmCancelModal] = useState(false);
  const [tipoSesion, setTipoSesion] = useState('numero');
  const [numeroSesion, setNumeroSesion] = useState(1);

  const cie10SearchRef = useRef(null);
  const navigate = useNavigate();

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  useEffect(() => {
    const fetchCitasPendientes = async () => {
      try {
        const medicoId = localStorage.getItem("especialista");
        if (!medicoId) {
          setError("No se pudo obtener el ID del especialista.");
          return;
        }

        const response = await api.get(
          `/api/v1/atenciones/citas-pendientes/${medicoId}`
        );
        setCitasPendientes(response.data);
      } catch (error) {
        setError("Error al obtener las citas pendientes.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitasPendientes();
  }, []);

  const obtenerDatosPaciente = async (pacienteId) => {
    try {
      const pacienteResponse = await api.get(`/api/v1/pacientes/${pacienteId}`);
      setPaciente(pacienteResponse.data);

      const atencionesResponse = await api.get(
        `/api/v1/atenciones/paciente/${pacienteId}/especialidad/${especialidadSeleccionada}`,
        {
          params: {
            limit: registrosPorPagina,
            offset: (paginaActual - 1) * registrosPorPagina,
          },
        }
      );
      setAtenciones(atencionesResponse.data.atenciones);
      setTotalAtenciones(atencionesResponse.data.total);

      setMostrarEspecialidad(especialidadSeleccionada === "Todas");
    } catch (error) {
      console.error("Error al obtener los datos del paciente:", error);
    }
  };

  useEffect(() => {
    if (selectedCita) {
      obtenerDatosPaciente(selectedCita.cita_cod_pacie);
    }
  }, [
    selectedCita,
    especialidadSeleccionada,
    paginaActual,
    registrosPorPagina,
  ]);

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  const cambiarRegistrosPorPagina = (e) => {
    const nuevoRegistrosPorPagina = parseInt(e.target.value, 10);
    setRegistrosPorPagina(nuevoRegistrosPorPagina);
    setPaginaActual(1);
  };

  const handleCambiarEspecialidad = (e) => {
    setEspecialidadSeleccionada(e.target.value);
    setPaginaActual(1);
  };

  const verificarTipoAtencion = async (pacienteId) => {
    try {
      const especialidad = localStorage.getItem("especialidad");
      if (!especialidad) {
        throw new Error("No se pudo obtener la especialidad del usuario.");
      }

      const response = await api.get(
        `/api/v1/atenciones/paciente/${pacienteId}/especialidad/${especialidad}`
      );

      const totalAtenciones = parseInt(response.data.total, 10);
      return totalAtenciones === 0 ? "Primera" : "Subsecuente";
    } catch (error) {
      console.error("Error al verificar el tipo de atención:", error);
      return "Subsecuente";
    }
  };

  const handleAtenderCita = async (cita) => {
    setSelectedCita(cita);
    const tipo = await verificarTipoAtencion(cita.cita_cod_pacie);
    setTipoAtencion(tipo);
    setOpenModal(true);
    buscarProductos("", cita.cita_cod_sucu);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCita(null);
    setMotivoConsulta("");
    setEnfermedadActual("");
    setObservaciones("");
    setDiagnosticos([]);
    setPrescripciones([]);
    setReferencias([]);
    setIndicacionesGenerales([]);
    setNumeroSesion(1);
  };

  const agregarDiagnostico = () => {
    setDiagnosticos([
      ...diagnosticos,
      {
        diag_cod_cie10: null,
        cie10_id_cie10: "",
        cie10_nom_cie10: "",
        diag_obs_diag: "",
        diag_est_diag: "Presuntivo",
        terapias: {}, // Objeto para almacenar terapias seleccionadas
        tecnicasSeleccionadas: {}, // Objeto para técnicas seleccionadas por terapia
      },
    ]);
  };

  const eliminarDiagnostico = (index) => {
    const nuevosDiagnosticos = diagnosticos.filter((_, i) => i !== index);
    setDiagnosticos(nuevosDiagnosticos);
  };

  const buscarCie10 = async (query) => {
    try {
      const response = await api.get(`/api/v1/cie10/buscar?query=${query}`);
      setCie10Options(response.data);
    } catch (error) {
      console.error("Error al buscar códigos CIE10:", error);
    }
  };

  const handleSelectCie10 = (cie10) => {
    const nuevosDiagnosticos = [...diagnosticos];
    nuevosDiagnosticos[selectedDiagnosticoIndex].diag_cod_cie10 =
      cie10.cie10_cod_cie10;
    nuevosDiagnosticos[selectedDiagnosticoIndex].cie10_id_cie10 =
      cie10.cie10_id_cie10;
    nuevosDiagnosticos[selectedDiagnosticoIndex].cie10_nom_cie10 =
      cie10.cie10_nom_cie10;
    setDiagnosticos(nuevosDiagnosticos);
    setOpenCie10Modal(false);
  };

  const validarCampos = () => {
    for (const diagnostico of diagnosticos) {
      if (!diagnostico.cie10_id_cie10) {
        setSnackbarMessage(
          "Todos los diagnósticos deben tener un CIE10 seleccionado."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }

      // Verificar que al menos una terapia esté seleccionada
      const terapiasSeleccionadas = Object.keys(
        diagnostico.terapias || {}
      ).filter((terapia) => diagnostico.terapias[terapia]);

      if (terapiasSeleccionadas.length === 0) {
        setSnackbarMessage(
          "Debe seleccionar al menos una terapia para cada diagnóstico."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return false;
      }
    }

    return true;
  };

  const handleGuardarAtencion = async () => {
    try {
      if (!selectedCita || !selectedCita.cita_cod_pacie) {
        setSnackbarMessage("Error: No se pudo obtener el ID del paciente.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      if (!motivoConsulta.trim() || !enfermedadActual.trim()) {
        setSnackbarMessage(
          "El motivo de consulta y la enfermedad actual son obligatorios."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      if (!validarCampos()) {
        return;
      }
      

      // Preparar datos para enviar al backend
      const atencionData = {
        aten_cod_paci: selectedCita.cita_cod_pacie,
        aten_cod_cita: selectedCita.cita_cod_cita,
        aten_cod_medi: localStorage.getItem("especialista"),
        aten_cod_disu: selectedCita.cita_cod_sucu,
        aten_esp_aten: localStorage.getItem("especialidad"),
        aten_fec_aten: new Date().toISOString().split("T")[0],
        aten_hor_aten: new Date().toTimeString().split(" ")[0],
        aten_mot_cons: motivoConsulta,
        aten_enf_actu: enfermedadActual,
        aten_obs_ate: observaciones,
        aten_tip_aten: tipoAtencion,
        aten_num_sesi: tipoSesion === 'numero' ? numeroSesion.toString() : 'PROGRAMADA'
      };

      const diagnosticosParaEnviar = diagnosticos.map((diagnostico) => ({
        diag_cod_cie10: diagnostico.diag_cod_cie10,
        cie10_id_cie10: diagnostico.cie10_id_cie10,
        cie10_nom_cie10: diagnostico.cie10_nom_cie10,
        diag_obs_diag: diagnostico.diag_obs_diag,
        diag_est_diag: diagnostico.diag_est_diag,
        terapias: diagnostico.terapias || {},
        tecnicasSeleccionadas: diagnostico.tecnicasSeleccionadas || {},
      }));

      console.log("Datos a enviar:", {
        atencionData,
        diagnosticos: diagnosticosParaEnviar,
        prescripciones,
        referencias,
        indicacionesGenerales,
      });

      const response = await api.post("/api/v1/atenciones/registrar-atencion", {
        atencionData,
        diagnosticos: diagnosticosParaEnviar,
        prescripciones,
        referencias,
        indicacionesGenerales,
      });

      if (response.data) {
        setSnackbarMessage("Atención registrada correctamente.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleCloseModal();

        const medicoId = localStorage.getItem("especialista");
        const responseCitas = await api.get(
          `/api/v1/atenciones/citas-pendientes/${medicoId}`
        );
        setCitasPendientes(responseCitas.data);
      }
    } catch (error) {
      console.error("Error completo:", error);
      let errorMessage = "Error al guardar la atención";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleConfirmCancel = () => {
    setOpenConfirmCancelModal(true);
  };

  const handleCancelAtencion = () => {
    setOpenConfirmCancelModal(false);
    handleCloseModal();
  };

  const handleCloseConfirmCancelModal = () => {
    setOpenConfirmCancelModal(false);
  };

  // Funciones para manejar terapias
  const toggleTerapia = (diagnosticoIndex, terapia) => {
    const nuevosDiagnosticos = [...diagnosticos];

    // Inicializar el objeto de terapias si no existe
    if (!nuevosDiagnosticos[diagnosticoIndex].terapias) {
      nuevosDiagnosticos[diagnosticoIndex].terapias = {};
    }

    // Inicializar el objeto de técnicas seleccionadas para esta terapia si no existe
    if (!nuevosDiagnosticos[diagnosticoIndex].tecnicasSeleccionadas) {
      nuevosDiagnosticos[diagnosticoIndex].tecnicasSeleccionadas = {};
    }

    if (!nuevosDiagnosticos[diagnosticoIndex].tecnicasSeleccionadas[terapia]) {
      nuevosDiagnosticos[diagnosticoIndex].tecnicasSeleccionadas[terapia] = {};
    }

    // Toggle de la terapia
    nuevosDiagnosticos[diagnosticoIndex].terapias[terapia] =
      !nuevosDiagnosticos[diagnosticoIndex].terapias[terapia];

    setDiagnosticos(nuevosDiagnosticos);
  };

  const toggleTecnica = (diagnosticoIndex, terapia, tecnica) => {
    const nuevosDiagnosticos = [...diagnosticos];

    // Asegurarse de que existe el objeto para las técnicas de esta terapia
    if (!nuevosDiagnosticos[diagnosticoIndex].tecnicasSeleccionadas[terapia]) {
      nuevosDiagnosticos[diagnosticoIndex].tecnicasSeleccionadas[terapia] = {};
    }

    // Toggle de la técnica
    nuevosDiagnosticos[diagnosticoIndex].tecnicasSeleccionadas[terapia][
      tecnica
    ] =
      !nuevosDiagnosticos[diagnosticoIndex].tecnicasSeleccionadas[terapia][
        tecnica
      ];

    setDiagnosticos(nuevosDiagnosticos);
  };

  // Funciones para manejar las prescripciones (igual que en MedicinaGeneral)
  const agregarPrescripcion = (tipo = "Empresa") => {
    const { empresa } = obtenerEmpresaYSucursal(selectedCita.cita_cod_sucu);

    const nuevaPrescripcion = {
      pres_cod_empr: empresa,
      pres_tip_pres: tipo,
      pres_cod_prod: tipo === "Empresa" ? null : "",
      pres_nom_prod: "",
      pres_can_pres: 1,
      pres_cod_unid: 1,
      pres_dos_pres: "",
      pres_adm_pres: "Oral",
      pres_fre_pres: "Cada 8 horas",
      pres_dur_pres: 1,
      pres_ind_pres: "",
      _siglas_unid: tipo === "Empresa" ? "UN" : "",
      disponible: 0,
    };

    setPrescripciones([...prescripciones, nuevaPrescripcion]);
  };

  const eliminarPrescripcion = (index) => {
    const nuevasPrescripciones = prescripciones.filter((_, i) => i !== index);
    setPrescripciones(nuevasPrescripciones);
  };

  const mapeoSucursal = {
    1: { empresa: 182, sucursal: 3, bodega: 20 },
    2: { empresa: 182, sucursal: 3, bodega: 21 },
    3: { empresa: 192, sucursal: 182, bodega: 14 },
  };

  const obtenerEmpresaYSucursal = (cita_cod_sucu) => {
    const mapeo = mapeoSucursal[cita_cod_sucu];
    if (!mapeo) {
      throw new Error(
        `No se encontró un mapeo para cita_cod_sucu = ${cita_cod_sucu}`
      );
    }
    return mapeo;
  };

  const buscarProductos = async (query, cita_cod_sucu) => {
    try {
      // Validar que el filtro no esté vacío
      if (!query) {
        return []; // No hacer la búsqueda si el filtro está vacío
      }

      // Obtener empresa y sucursal basados en cita_cod_sucu
      const { bodega, empresa, sucursal } =
        obtenerEmpresaYSucursal(cita_cod_sucu);

      const filtro = query; // El término de búsqueda

      const response = await api.get(`/api/v1/productos/buscar`, {
        params: {
          bodega,
          empresa,
          sucursal,
          filtro,
        },
      });

      // Devolver los resultados
      return response.data;
    } catch (error) {
      console.error("Error al buscar productos:", error);
      return [];
    }
  };

  const handleSeleccionarProducto = (indexPrescripcion, value) => {
    const nuevasPrescripciones = [...prescripciones];

    if (nuevasPrescripciones[indexPrescripcion].pres_tip_pres === "Empresa") {
      nuevasPrescripciones[indexPrescripcion] = {
        ...nuevasPrescripciones[indexPrescripcion],
        pres_cod_prod: value ? String(value.codigo) : null,
        pres_nom_prod: value ? value.nombre : "",
        pres_cod_unid: value ? value.codigo_unidad : 1,
        _siglas_unid: value ? value.siglas_unidad : "",
        disponible: value ? value.disponible : 0,
      };
    }

    setPrescripciones(nuevasPrescripciones);
  };

  const handleCantidadChange = (indexPrescripcion, value) => {
    const nuevasPrescripciones = [...prescripciones];
    const prescripcion = nuevasPrescripciones[indexPrescripcion];

    if (value === null) {
      nuevasPrescripciones[indexPrescripcion] = {
        ...prescripcion,
        pres_can_pres: null,
      };
    } else if (!isNaN(value)) {
      const cantidad = Math.max(1, value);

      if (prescripcion.disponible && cantidad > prescripcion.disponible) {
        setSnackbarMessage(
          `La cantidad no puede exceder el disponible (${prescripcion.disponible}).`
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      nuevasPrescripciones[indexPrescripcion] = {
        ...prescripcion,
        pres_can_pres: cantidad,
      };
    }

    setPrescripciones(nuevasPrescripciones);
  };

  // Funciones para manejar referencias
  const agregarReferencia = () => {
    setReferencias([...referencias, { refe_des_refe: "" }]);
  };

  const eliminarReferencia = (index) => {
    const nuevasReferencias = referencias.filter((_, i) => i !== index);
    setReferencias(nuevasReferencias);
  };

  const handleReferenciaChange = (index, value) => {
    const nuevasReferencias = [...referencias];
    nuevasReferencias[index].refe_des_refe = value;
    setReferencias(nuevasReferencias);
  };

  // Funciones para manejar indicaciones generales
  const agregarIndicacionGeneral = () => {
    setIndicacionesGenerales([...indicacionesGenerales, { indi_des_indi: "" }]);
  };

  const eliminarIndicacionGeneral = (index) => {
    const nuevasIndicaciones = indicacionesGenerales.filter(
      (_, i) => i !== index
    );
    setIndicacionesGenerales(nuevasIndicaciones);
  };

  const handleIndicacionGeneralChange = (index, value) => {
    const nuevasIndicaciones = [...indicacionesGenerales];
    nuevasIndicaciones[index].indi_des_indi = value;
    setIndicacionesGenerales(nuevasIndicaciones);
  };

  const getColorByUrgency = (nivelUrgencia) => {
    switch (nivelUrgencia?.toUpperCase()) {
      case "ROJO":
        return "#ffcdd2";
      case "NARANJA":
        return "#ffe0b2";
      case "AMARILLO":
        return "#fff9c4";
      case "VERDE":
        return "#c8e6c9";
      case "AZUL":
        return "#bbdefb";
      default:
        return "#f5f5f5";
    }
  };

  if (loading) {
    return <Typography>Cargando citas pendientes...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // Maneja la impresión de la receta médica
  const handlePrintReceta = () => {
    if (!paciente) {
      setSnackbarMessage("No hay datos del paciente para imprimir");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const printWindow = window.open("", "_blank");

    // Función para convertir números a letras
    const numeroALetras = (num) => {
      const unidades = [
        "",
        "uno",
        "dos",
        "tres",
        "cuatro",
        "cinco",
        "seis",
        "siete",
        "ocho",
        "nueve",
      ];
      const decenas = [
        "",
        "diez",
        "veinte",
        "treinta",
        "cuarenta",
        "cincuenta",
        "sesenta",
        "setenta",
        "ochenta",
        "noventa",
      ];
      const especiales = [
        "once",
        "doce",
        "trece",
        "catorce",
        "quince",
        "dieciséis",
        "diecisiete",
        "dieciocho",
        "diecinueve",
      ];

      num = parseInt(num) || 1;
      if (num < 1) num = 1;
      if (num > 99) num = 99;

      if (num < 10) return unidades[num];
      if (num >= 11 && num <= 19) return especiales[num - 11];

      const decena = Math.floor(num / 10);
      const unidad = num % 10;

      if (unidad === 0) return decenas[decena];
      if (decena === 1) return "dieci" + unidades[unidad];
      if (decena === 2) return "veinti" + unidades[unidad];

      return decenas[decena] + " y " + unidades[unidad];
    };

    // Función para formatear fecha
    const formatDate = () => {
      const options = { day: "numeric", month: "long", year: "numeric" };
      return new Date().toLocaleDateString("es-ES", options);
    };

    // Separar prescripciones
    const prescripcionesEmpresa = prescripciones.filter(
      (p) => p.pres_tip_pres === "Empresa"
    );
    const prescripcionesExterna = prescripciones.filter(
      (p) => p.pres_tip_pres === "Externa"
    );

    //Capitalizar el nombre del paciente
    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receta Médica - ${paciente.pacie_nom_pacie} ${
      paciente.pacie_ape_pacie
    }</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap');
            
            body {
              font-family: 'Montserrat', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
              font-size: 13pt;
            }
            
            .page-container {
              width: 21cm;
              min-height: 29.7cm;
              margin: 0 auto;
              display: grid;
              grid-template-columns: 10.45cm 1px 10.45cm;
              gap: 0.2cm;
            }
            
            .column {
              width: 10.45cm;
              padding: 0.7cm;
              position: relative;
              box-sizing: border-box;
            }
            
            .divider {
              background: repeating-linear-gradient(
                to bottom,
                #ccc,
                #ccc 1px,
                transparent 1px,
                transparent 10px
              );
              width: 1px;
            }
            
            .header-container {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 15px;
              margin-bottom: 0.8rem;
            }
            
            .logo {
              height: 22px;
              width: auto;
              object-fit: contain;
            }
            
            .header-text {
              text-align: center;
              flex-grow: 1;
            }
            
            .clinic-name {
              font-weight: 700;
              font-size: 11pt;
              margin: 0;
            }
            
            .clinic-type {
              font-weight: 500;
              font-size: 10pt;
              margin: 0.1rem 0 0.3rem;
            }
            
            .date {
              font-size: 9pt;
              margin-bottom: 0.8rem;
              text-align: center;
            }
            
            .section-title {
              font-weight: 600;
              font-size: 10pt;
              margin: 0.6rem 0 0.3rem;
              padding-bottom: 0.1rem;
              border-bottom: 1px solid #ddd;
            }
            
            .patient-data {
              font-size: 9pt;
              line-height: 1.3;
              margin-bottom: 0.6rem;
            }
            
            .patient-data strong {
              font-weight: 600;
            }
            
            .diagnosticos-list, 
            .indicaciones-list, 
            .referencias-list,
            .prescripciones-list {
              font-size: 9pt;
              margin: 0.3rem 0;
              padding-left: 0.8rem;
            }
            
            .prescripcion-item {
              margin-bottom: 0.2rem;
            }
            
            .med-group-title {
              font-weight: 600;
              font-size: 9.5pt;
              margin: 0.6rem 0 0.3rem;
              color: #4a90e2;
            }
            
            .indicacion-farmacologica {
              font-size: 8.5pt;
              margin-bottom: 0.3rem;
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
              align-items: center;
              line-height: 1.2;
            }
            
            .med-name {
              font-weight: 600;
              width: 100%;
              margin-bottom: 0.1rem;
            }
            
            .signature {
              position: absolute;
              bottom: 0.6cm;
              width: calc(100% - 1.2cm);
              text-align: center;
              font-size: 9pt;
            }
            
            .signature-line {
              border-top: 1px solid #333;
              width: 80%;
              margin: 0 auto 0.1rem;
            }
            
            .doctor-name {
              font-weight: 600;
            }
            
            @media print {
              body {
                background: none;
                margin: 0;
                padding: 0;
              }
              
              .page-container {
                gap: 0.2cm;
              }
              
              .column {
                padding: 0.5cm;
              }
              
              .logo {
                height: 16px;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <!-- Columna Izquierda -->
            <div class="column">
              <div class="header-container">
                <img src="/provefrut.jpg" class="logo" alt="Logo Provefrut">
                <div class="header-text">
                  <p class="clinic-name">CENTRO DE SALUD TIPO B</p>
                  <p class="clinic-type">PROVEFRUT - NINTANGA</p>
                </div>
                <img src="/nintanga.jpg" class="logo" alt="Logo Nintanga">
              </div>
              
              <div class="date">Guaytacama, ${formatDate()}</div>
              
              <div class="section-title">Datos del paciente:</div>
              <div class="patient-data">
                <strong>Nombre:</strong> ${capitalize(
                  paciente.pacie_nom_pacie
                )} ${capitalize(paciente.pacie_ape_pacie)}<br>
                <strong>Cédula:</strong> ${paciente.pacie_ced_pacie}<br>
                <strong>Edad:</strong> ${calcularEdad(
                  paciente.pacie_fec_nac
                )} años<br>
                <strong>Sexo:</strong> ${capitalize(paciente.sexo_nom_sexo)}
              </div>
              
              ${
                diagnosticos.length > 0
                  ? `
                <div class="section-title">Diagnóstico(s):</div>
                <ul class="diagnosticos-list">
                  ${diagnosticos
                    .map(
                      (d) => `
                    <li>${d.cie10_id_cie10} - ${d.cie10_nom_cie10}</li>
                  `
                    )
                    .join("")}
                </ul>
              `
                  : ""
              }
              
              <div class="section-title">Receta:</div>
              
              ${
                prescripcionesEmpresa.length > 0
                  ? `
                <div class="med-group-title">MEDICACIÓN INTERNA (EMPRESA)</div>
                <div class="prescripciones-list">
                  ${prescripcionesEmpresa
                    .map((p) => {
                      const cantidad = p.pres_can_pres || 1;
                      return `
                      <div class="prescripcion-item">
                        • ${capitalize(
                          p.pres_nom_prod
                        )} - # ${cantidad} (${numeroALetras(cantidad)}) ${
                        p._siglas_unid || "UN"
                      }
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              `
                  : ""
              }
              
              ${
                prescripcionesExterna.length > 0
                  ? `
                <div class="med-group-title">MEDICACIÓN EXTERNA (FARMACIA)</div>
                <div class="prescripciones-list">
                  ${prescripcionesExterna
                    .map((p) => {
                      const cantidad = p.pres_can_pres || 1;
                      return `
                      <div class="prescripcion-item">
                        • ${capitalize(
                          p.pres_nom_prod
                        )} - # ${cantidad} (${numeroALetras(cantidad)}) ${
                        p._siglas_unid || "UN"
                      }
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              `
                  : ""
              }          
            </div>
            
            <!-- Línea divisoria punteada -->
            <div class="divider"></div>
            
            <!-- Columna Derecha -->
            <div class="column">
              <div class="header-container">
                <img src="/provefrut.jpg" class="logo" alt="Logo Provefrut">
                <div class="header-text">
                  <p class="clinic-name">CENTRO DE SALUD TIPO B</p>
                  <p class="clinic-type">PROVEFRUT - NINTANGA</p>
                </div>
                <img src="/nintanga.jpg" class="logo" alt="Logo Nintanga">
              </div>
              
              <div class="date">Guaytacama, ${formatDate()}</div>
              
              <div class="section-title">Datos del paciente:</div>
              <div class="patient-data">
                <strong>Nombre:</strong> ${capitalize(
                  paciente.pacie_nom_pacie
                )} ${capitalize(paciente.pacie_ape_pacie)}<br>
                <strong>Cédula:</strong> ${paciente.pacie_ced_pacie}<br>
                <strong>Edad:</strong> ${calcularEdad(
                  paciente.pacie_fec_nac
                )} años<br>
                <strong>Sexo:</strong> ${capitalize(paciente.sexo_nom_sexo)}
              </div>
              
              ${
                prescripciones.length > 0
                  ? `
                <div class="section-title">Indicaciones Farmacológicas:</div>
                <div class="prescripciones-list">
                  ${prescripciones
                    .map(
                      (p) => `
                    <div class="indicacion-farmacologica">
                      <div class="med-name">${capitalize(p.pres_nom_prod)}</div>
                      ${
                        p.pres_dos_pres
                          ? `<span>Dosis: ${p.pres_dos_pres}</span>`
                          : ""
                      }
                      <span>Vía: ${capitalize(p.pres_adm_pres || "Oral")}</span>
                      <span>Frecuencia: ${
                        p.pres_fre_pres || "Cada 8 horas"
                      }</span>
                      ${
                        p.pres_dur_pres
                          ? `<span>Duración: ${p.pres_dur_pres} día(s)</span>`
                          : ""
                      }
                      ${
                        p.pres_ind_pres
                          ? `<span style="width:100%;">Indicaciones: ${p.pres_ind_pres}</span>`
                          : ""
                      }
                    </div>
                  `
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
              
              ${
                indicacionesGenerales.length > 0
                  ? `
                <div class="section-title">Indicaciones Generales:</div>
                <ul class="indicaciones-list">
                  ${indicacionesGenerales
                    .map(
                      (ind) => `
                    <li>${ind.indi_des_indi}</li>
                  `
                    )
                    .join("")}
                </ul>
              `
                  : ""
              }
              
              ${
                referencias.length > 0
                  ? `
                <div class="section-title">Referencias:</div>
                <ul class="referencias-list">
                  ${referencias
                    .map(
                      (ref) => `
                    <li>${ref.refe_des_refe}</li>
                  `
                    )
                    .join("")}
                </ul>
              `
                  : ""
              }              
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Container className={styles.container}>
      <Typography variant="h4" gutterBottom className={styles.title}>
        Citas Pendientes - Fisioterapia
      </Typography>
      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table className={styles.table}>
          <TableHead className={styles.tableHead}>
            <TableRow>
              <TableCell className={styles.tableHeadCell}>ID Cita</TableCell>
              <TableCell className={styles.tableHeadCell}>Fecha</TableCell>
              <TableCell className={styles.tableHeadCell}>Hora</TableCell>
              <TableCell className={styles.tableHeadCell}>Paciente</TableCell>
              <TableCell className={styles.tableHeadCell}>
                Nivel de Urgencia
              </TableCell>
              <TableCell className={styles.tableHeadCell}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {citasPendientes.map((cita) => (
              <TableRow key={cita.cita_cod_cita} className={styles.tableRow}>
                <TableCell>{cita.cita_cod_cita}</TableCell>
                <TableCell>
                  {new Date(cita.cita_fec_cita).toLocaleDateString()}
                </TableCell>
                <TableCell>{cita.cita_hor_cita}</TableCell>
                <TableCell>{`${cita.pacie_nom_pacie} ${cita.pacie_ape_pacie}`}</TableCell>
                <TableCell>
                  {cita.triaj_niv_urge || "No tiene triaje"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    className={styles.button}
                    onClick={() => handleAtenderCita(cita)}
                  >
                    Atender
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para registrar la atención */}
      <Modal
        open={openModal}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleCloseModal();
        }}
      >
        <Box
          className={styles.modalBox}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "1400px",
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: tipoAtencion === "Primera" ? "red" : "green" }}
          >
            Tipo de Atención: {tipoAtencion}
          </Typography>

          {/* Mostrar datos del paciente */}
          {paciente && (
            <Box
              sx={{ mb: 3, border: "1px solid #ccc", p: 2, borderRadius: 1 }}
            >
              <Typography variant="h6" gutterBottom>
                Datos del Paciente
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Nombre:</strong> {paciente.pacie_nom_pacie}{" "}
                    {paciente.pacie_ape_pacie}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Cédula:</strong> {paciente.pacie_ced_pacie}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Sexo:</strong> {paciente.sexo_nom_sexo}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Fecha de Nacimiento:</strong>{" "}
                    {new Date(paciente.pacie_fec_nac).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Edad:</strong>{" "}
                    {calcularEdad(paciente.pacie_fec_nac)} años
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Dirección:</strong> {paciente.pacie_dir_pacie}
                  </Typography>
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenHistoriaClinicaModal(true)}
                sx={{ mt: 2 }}
              >
                Historia Clínica
              </Button>
            </Box>
          )}

          {/* Mostrar datos del triaje si existen */}
          {selectedCita?.triaj_niv_urge && (
            <Box
              sx={{
                mb: 3,
                borderLeft: `4px solid ${getColorByUrgency(
                  selectedCita.triaj_niv_urge
                )}`,
                backgroundColor: "#f8f9fa",
                p: 2,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  📊 Datos de Triaje
                </Typography>
                <Chip
                  label={selectedCita.triaj_niv_urge}
                  size="small"
                  sx={{
                    backgroundColor: getColorByUrgency(
                      selectedCita.triaj_niv_urge
                    ),
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                />
              </Box>

              <Grid container spacing={1}>
                {/* Primera fila - Datos vitales */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FavoriteIcon
                      color="error"
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">
                      <strong>Frec. Cardiaca:</strong>{" "}
                      {selectedCita.triaj_fca_triaj || "--"} lpm
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AirIcon color="info" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Frec. Respiratoria:</strong>{" "}
                      {selectedCita.triaj_fre_triaj || "--"} rpm
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <SpeedIcon
                      color="primary"
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">
                      <strong>Per. Abdominal:</strong>{" "}
                      {selectedCita.triaj_par_triaj || "--"} mmHg
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ThermostatIcon
                      color="warning"
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">
                      <strong>Temperautra:</strong>{" "}
                      {selectedCita.triaj_tem_triaj || "--"} °C
                    </Typography>
                  </Box>
                </Grid>

                {/* Segunda fila - Antropometría */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <MonitorWeightIcon
                      color="secondary"
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">
                      <strong>Peso:</strong>{" "}
                      {selectedCita.triaj_pes_triaj || "--"} kg
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <HeightIcon
                      color="action"
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">
                      <strong>Talla:</strong>{" "}
                      {selectedCita.triaj_tal_triaj || "--"} cm
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CalculateIcon
                      color="success"
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">
                      <strong>IMC:</strong>{" "}
                      {selectedCita.triaj_imc_triaj || "--"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LocalHospitalIcon
                      color="error"
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">
                      <strong>SpO₂:</strong>{" "}
                      {selectedCita.triaj_sat_triaj || "--"}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Observaciones */}
              {selectedCita.triaj_obs_triaj && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    backgroundColor: "rgba(0,0,0,0.03)",
                    borderRadius: "4px",
                  }}
                >
                  <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                    <strong>📝 Observaciones:</strong>{" "}
                    {selectedCita.triaj_obs_triaj}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Sección de Motivo de Consulta, Enfermedad Actual y Observaciones */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleGuardarAtencion();
            }}
          >
<Grid container spacing={2} alignItems="center">
  <Grid item xs={12} md={2}>
    <FormControl component="fieldset">
      <RadioGroup
        row
        value={tipoSesion}
        onChange={(e) => setTipoSesion(e.target.value)}
      >
        <FormControlLabel 
          value="numero" 
          control={<Radio size="small" />} 
          label="Número" 
        />
        <FormControlLabel 
          value="programada" 
          control={<Radio size="small" />} 
          label="Programada" 
        />
      </RadioGroup>
    </FormControl>
  </Grid>

  <Grid item xs={12} md={2}>
    {tipoSesion === 'numero' ? (
      <TextField
        label="Número de Sesión"
        type="number"
        value={numeroSesion}
        onChange={(e) => setNumeroSesion(Math.max(1, parseInt(e.target.value) || 1))}
        inputProps={{ min: 1 }}
        fullWidth
      />
    ) : (
      <TextField
        value="PROGRAMADA"
        InputProps={{ readOnly: true }}
        fullWidth
      />
    )}
  </Grid>
</Grid>
            <Box
              sx={{
                mb: 3,
                p: 2,
                border: "1px solid",
                borderColor:
                  !motivoConsulta.trim() || !enfermedadActual.trim()
                    ? "#1976d2"
                    : "#e0e0e0",
                borderRadius: 1,
                transition: "all 0.3s ease",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Motivo de Consulta *"
                    fullWidth
                    multiline
                    value={motivoConsulta}
                    onChange={(e) => setMotivoConsulta(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: !motivoConsulta.trim()
                            ? "#1976d2"
                            : undefined,
                        },
                        "&:hover fieldset": {
                          borderColor: !motivoConsulta.trim()
                            ? "#1976d2"
                            : undefined,
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Enfermedad Actual *"
                    fullWidth
                    multiline
                    value={enfermedadActual}
                    onChange={(e) => setEnfermedadActual(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: !motivoConsulta.trim()
                            ? "#1976d2"
                            : undefined,
                        },
                        "&:hover fieldset": {
                          borderColor: !motivoConsulta.trim()
                            ? "#1976d2"
                            : undefined,
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Grid item xs={12} md={4}>
              <TextField
                label="Observaciones"
                fullWidth
                multiline
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                margin="normal"
              />
            </Grid>
          </Box>

          {/* Lista de diagnósticos */}
          <Typography variant="h6" gutterBottom style={{ marginTop: "20px" }}>
            Diagnósticos
          </Typography>
          {diagnosticos.map((diagnostico, indexDiagnostico) => (
            <Box
              key={indexDiagnostico}
              sx={{ mb: 3, border: "1px solid #ccc", p: 2, borderRadius: 1 }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Diagnóstico #{indexDiagnostico + 1}
              </Typography>

              {/* Campo para Código CIE10 y Nombre */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Código CIE10"
                    fullWidth
                    value={
                      diagnostico.cie10_id_cie10
                        ? `${diagnostico.cie10_id_cie10} - ${diagnostico.cie10_nom_cie10}`
                        : ""
                    }
                    margin="normal"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="outlined"
                    startIcon={<Search />}
                    onClick={() => {
                      setSelectedDiagnosticoIndex(indexDiagnostico);
                      setOpenCie10Modal(true);
                    }}
                    fullWidth
                  >
                    Buscar CIE10
                  </Button>
                </Grid>
              </Grid>

              <TextField
                label="Observación del Diagnóstico"
                fullWidth
                multiline
                value={diagnostico.diag_obs_diag}
                onChange={(e) => {
                  const nuevosDiagnosticos = [...diagnosticos];
                  nuevosDiagnosticos[indexDiagnostico].diag_obs_diag =
                    e.target.value;
                  setDiagnosticos(nuevosDiagnosticos);
                }}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Estado del Diagnóstico</InputLabel>
                <Select
                  value={diagnostico.diag_est_diag}
                  onChange={(e) => {
                    const nuevosDiagnosticos = [...diagnosticos];
                    nuevosDiagnosticos[indexDiagnostico].diag_est_diag =
                      e.target.value;
                    setDiagnosticos(nuevosDiagnosticos);
                  }}
                  label="Estado del Diagnóstico"
                >
                  <MenuItem value="Presuntivo">Presuntivo</MenuItem>
                  <MenuItem value="Confirmado">Confirmado</MenuItem>
                </Select>
              </FormControl>

              {/* Sección de Terapias */}
              <Typography
                variant="subtitle2"
                gutterBottom
                style={{ marginTop: "20px" }}
              >
                Terapias
              </Typography>

              {Object.keys(terapiasOptions).map((terapia) => {
                const terapias = diagnostico.terapias || {};
                const tecnicasSeleccionadas =
                  diagnostico.tecnicasSeleccionadas?.[terapia] || {};
                const isTerapiaSelected = terapias[terapia];

                return (
                  <Box key={terapia} sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isTerapiaSelected || false}
                          onChange={() =>
                            toggleTerapia(indexDiagnostico, terapia)
                          }
                        />
                      }
                      label={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          {terapia}
                        </Typography>
                      }
                    />

                    <Collapse in={isTerapiaSelected}>
                      <Box sx={{ ml: 4, mt: 1 }}>
                        <Grid container spacing={1}>
                          {terapiasOptions[terapia].map((tecnica) => (
                            <Grid item xs={12} sm={6} md={2} key={tecnica}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={
                                      tecnicasSeleccionadas[tecnica] || false
                                    }
                                    onChange={() =>
                                      toggleTecnica(
                                        indexDiagnostico,
                                        terapia,
                                        tecnica
                                      )
                                    }
                                  />
                                }
                                label={
                                  <Typography variant="body2">
                                    {tecnica}
                                  </Typography>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}

              {/* Botón para eliminar diagnóstico */}
              <IconButton
                color="error"
                onClick={() => eliminarDiagnostico(indexDiagnostico)}
                style={{ marginTop: "10px" }}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}

          {/* Botón para agregar diagnóstico */}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={agregarDiagnostico}
            style={{ marginTop: "20px" }}
          >
            Agregar Diagnóstico
          </Button>

          {/* Sección de Prescripciones (igual que en MedicinaGeneral) */}
          <Typography variant="h6" gutterBottom style={{ marginTop: "20px" }}>
            Prescripciones
          </Typography>
          <TableContainer component={Paper} className={styles.tableContainer}>
            <Table className={`${styles.table} ${styles.compactTable}`}>
              <TableHead>
                <TableRow>
                  <TableCell className={styles.productName}>Producto</TableCell>
                  <TableCell className={styles.quantityCell}>
                    Cantidad
                  </TableCell>
                  <TableCell className={styles.unitCell}>Unidad</TableCell>
                  <TableCell className={styles.doseCell}>Dosis</TableCell>
                  <TableCell className={styles.routeCell}>Vía</TableCell>
                  <TableCell className={styles.frequencyCell}>
                    Frecuencia
                  </TableCell>
                  <TableCell className={styles.durationCell}>Días</TableCell>
                  <TableCell className={styles.indications}>
                    Indicaciones
                  </TableCell>
                  <TableCell className={styles.actionsCell}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescripciones.map((prescripcion, indexPrescripcion) => (
                  <TableRow
                    key={indexPrescripcion}
                    sx={{
                      borderLeft:
                        prescripcion.pres_tip_pres === "Externa"
                          ? "4px solid #ff9800"
                          : "4px solid #4caf50",
                      backgroundColor:
                        prescripcion.pres_tip_pres === "Externa"
                          ? "#fff8e1"
                          : "#e8f5e9",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                  >
                    <TableCell className={styles.productName}>
                      {prescripcion.pres_tip_pres === "Empresa" ? (
                        <Autocomplete
                          options={productoOptions}
                          getOptionLabel={(option) => option.nombre || ""}
                          isOptionEqualToValue={(option, value) =>
                            option.codigo?.toString() ===
                            value?.codigo?.toString()
                          }
                          onInputChange={async (_, value) => {
                            const resultados = await buscarProductos(
                              value,
                              selectedCita.cita_cod_sucu
                            );
                            setProductoOptions(resultados);
                          }}
                          onChange={(_, value) =>
                            handleSeleccionarProducto(indexPrescripcion, value)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              fullWidth
                              placeholder="Buscar producto interno..."
                              variant="outlined"
                              style={{ minWidth: "300px" }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <li {...props} style={{ whiteSpace: "normal" }}>
                              <div>
                                <strong>{option.nombre}</strong>
                                <div
                                  style={{ fontSize: "0.8rem", color: "#666" }}
                                >
                                  {option.siglas_unidad} - Disp:{" "}
                                  {option.disponible}
                                </div>
                              </div>
                            </li>
                          )}
                          value={
                            prescripcion.pres_cod_prod
                              ? {
                                  nombre: prescripcion.pres_nom_prod,
                                  codigo: prescripcion.pres_cod_prod,
                                  siglas_unidad: prescripcion._siglas_unid,
                                  disponible: prescripcion.disponible,
                                }
                              : null
                          }
                          freeSolo
                          autoHighlight
                          fullWidth
                          PopperComponent={(props) => (
                            <Popper
                              {...props}
                              style={{
                                width: "auto",
                                minWidth: "350px",
                              }}
                              placement="bottom-start"
                            />
                          )}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          value={prescripcion.pres_nom_prod}
                          onChange={(e) => {
                            const nuevasPrescripciones = [...prescripciones];
                            nuevasPrescripciones[
                              indexPrescripcion
                            ].pres_nom_prod = e.target.value;
                            nuevasPrescripciones[
                              indexPrescripcion
                            ].pres_cod_prod = e.target.value.substring(0, 35);
                            setPrescripciones(nuevasPrescripciones);
                          }}
                          placeholder="Nombre medicamento externo"
                          variant="outlined"
                          style={{ minWidth: "300px" }}
                        />
                      )}
                    </TableCell>

                    <TableCell className={styles.quantityCell}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={prescripcion.pres_can_pres ?? ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? null
                              : parseInt(e.target.value);
                          handleCantidadChange(indexPrescripcion, value);
                        }}
                        inputProps={{
                          min: 1,
                          max:
                            prescripcion.pres_tip_pres === "Empresa"
                              ? prescripcion.disponible
                              : undefined,
                          maxLength: 3,
                          style: {
                            MozAppearance: "textfield",
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                        }}
                        sx={{
                          "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                            {
                              WebkitAppearance: "none",
                              margin: 0,
                            },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell className={styles.unitCell}>
                      {prescripcion.pres_tip_pres === "Empresa" ? (
                        <Typography
                          variant="body2"
                          sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            padding: "6px",
                          }}
                        >
                          {prescripcion._siglas_unid || "UN"}
                        </Typography>
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          value={prescripcion._siglas_unid || ""}
                          onChange={(e) => {
                            const nuevasPrescripciones = [...prescripciones];
                            nuevasPrescripciones[
                              indexPrescripcion
                            ]._siglas_unid = e.target.value.substring(0, 3);
                            setPrescripciones(nuevasPrescripciones);
                          }}
                          inputProps={{
                            maxLength: 3,
                          }}
                          variant="outlined"
                        />
                      )}
                    </TableCell>

                    <TableCell className={styles.doseCell}>
                      <TextField
                        fullWidth
                        size="small"
                        value={prescripcion.pres_dos_pres || ""}
                        onChange={(e) => {
                          const nuevasPrescripciones = [...prescripciones];
                          nuevasPrescripciones[
                            indexPrescripcion
                          ].pres_dos_pres = e.target.value.substring(0, 5);
                          setPrescripciones(nuevasPrescripciones);
                        }}
                        inputProps={{
                          maxLength: 5,
                        }}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <FormControl fullWidth size="small" variant="outlined">
                        <Select
                          value={prescripcion.pres_adm_pres || "Oral"}
                          onChange={(e) => {
                            const nuevasPrescripciones = [...prescripciones];
                            nuevasPrescripciones[
                              indexPrescripcion
                            ].pres_adm_pres = e.target.value;
                            setPrescripciones(nuevasPrescripciones);
                          }}
                          sx={{ fontSize: "0.875rem" }}
                        >
                          <MenuItem value="Oral">Oral</MenuItem>
                          <MenuItem value="Intramuscular">
                            Intramuscular
                          </MenuItem>
                          <MenuItem value="Intravenosa">Intravenosa</MenuItem>
                          <MenuItem value="Subcutanea">Subcutánea</MenuItem>
                          <MenuItem value="Sublingual">Sublingual</MenuItem>
                          <MenuItem value="Intravaginal">Intravaginal</MenuItem>
                          <MenuItem value="Inhalar">Inhalar</MenuItem>
                          <MenuItem value="Tópica">Tópica</MenuItem>
                          <MenuItem value="Rectal">Rectal</MenuItem>
                          <MenuItem value="Oftálmica">Oftálmica</MenuItem>
                          <MenuItem value="Ótica">Ótica</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <FormControl fullWidth size="small" variant="outlined">
                        <Select
                          value={prescripcion.pres_fre_pres || "Cada 8 horas"}
                          onChange={(e) => {
                            const nuevasPrescripciones = [...prescripciones];
                            nuevasPrescripciones[
                              indexPrescripcion
                            ].pres_fre_pres = e.target.value;
                            setPrescripciones(nuevasPrescripciones);
                          }}
                          sx={{ fontSize: "0.875rem" }}
                        >
                          <MenuItem value="Inmediato">Inmediato</MenuItem>
                          <MenuItem value="Cada 6 horas">Cada 6 horas</MenuItem>
                          <MenuItem value="Cada 8 horas">Cada 8 horas</MenuItem>
                          <MenuItem value="Cada 12 horas">
                            Cada 12 horas
                          </MenuItem>
                          <MenuItem value="Cada 24 horas">
                            Cada 24 horas
                          </MenuItem>
                          <MenuItem value="Cada 48 horas">
                            Cada 48 horas
                          </MenuItem>
                          <MenuItem value="En ayunas">En ayunas</MenuItem>
                          <MenuItem value="Una vez al día">
                            Una vez al día
                          </MenuItem>
                          <MenuItem value="Cada semana">Cada semana</MenuItem>
                          <MenuItem value="Otro">Otro</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell className={styles.durationCell}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={prescripcion.pres_dur_pres ?? ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? null
                              : parseInt(e.target.value);
                          const nuevasPrescripciones = [...prescripciones];
                          nuevasPrescripciones[
                            indexPrescripcion
                          ].pres_dur_pres =
                            value !== null
                              ? Math.max(1, Math.min(value, 99))
                              : null;
                          setPrescripciones(nuevasPrescripciones);
                        }}
                        inputProps={{
                          min: 1,
                          max: 99,
                          maxLength: 2,
                          style: {
                            MozAppearance: "textfield",
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                        }}
                        sx={{
                          "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                            {
                              WebkitAppearance: "none",
                              margin: 0,
                            },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell className={styles.indications}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        value={prescripcion.pres_ind_pres || ""}
                        onChange={(e) => {
                          const nuevasPrescripciones = [...prescripciones];
                          nuevasPrescripciones[
                            indexPrescripcion
                          ].pres_ind_pres = e.target.value;
                          setPrescripciones(nuevasPrescripciones);
                        }}
                        placeholder="Indicaciones especiales"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell className={styles.actionsCell}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => eliminarPrescripcion(indexPrescripcion)}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(255, 0, 0, 0.1)",
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => agregarPrescripcion("Empresa")}
            >
              Agregar Interno
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => agregarPrescripcion("Externa")}
              color="secondary"
            >
              Agregar Externo
            </Button>
          </Box>

          {/* Sección de Indicaciones Generales */}
          <Typography variant="h6" gutterBottom style={{ marginTop: "20px" }}>
            Indicaciones Generales
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Descripción
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      width: "120px",
                    }}
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {indicacionesGenerales.length > 0 ? (
                  indicacionesGenerales.map((indicacion, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          maxRows={4}
                          value={indicacion.indi_des_indi}
                          onChange={(e) =>
                            handleIndicacionGeneralChange(index, e.target.value)
                          }
                          placeholder="Especifique indicaciones generales (ej. Reposo relativo por 3 días)"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => eliminarIndicacionGeneral(index)}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255, 0, 0, 0.1)",
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      sx={{ textAlign: "center", color: "text.secondary" }}
                    >
                      No hay indicaciones generales agregadas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={agregarIndicacionGeneral}
            sx={{ mb: 3 }}
          >
            Agregar Indicación General
          </Button>

          {/* Sección de Referencias*/}
          <Typography variant="h6" gutterBottom>
            Referencias
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Descripción
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      width: "120px",
                    }}
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {referencias.length > 0 ? (
                  referencias.map((referencia, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          maxRows={4}
                          value={referencia.refe_des_refe}
                          onChange={(e) =>
                            handleReferenciaChange(index, e.target.value)
                          }
                          placeholder="Especifique la referencia (ej. Referencia a cardiología para evaluación)"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => eliminarReferencia(index)}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255, 0, 0, 0.1)",
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      sx={{ textAlign: "center", color: "text.secondary" }}
                    >
                      No hay referencias agregadas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={agregarReferencia}
            sx={{ mb: 3 }}
          >
            Agregar Referencia
          </Button>

          {/* Botones de acción (Guardar y Cancelar) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              marginTop: "20px",
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmCancel}
              className={styles.button}
            >
              Cancelar
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handlePrintReceta}
              startIcon={<PrintIcon />}
              className={styles.button}
            >
              Imprimir Receta
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGuardarAtencion}
              className={styles.button}
            >
              Guardar Atención
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para buscar CIE10 */}
      <Modal open={openCie10Modal} onClose={() => setOpenCie10Modal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Buscar CIE10
          </Typography>
          <Autocomplete
            options={cie10Options}
            getOptionLabel={(option) =>
              `${option.cie10_id_cie10} - ${option.cie10_nom_cie10}`
            }
            onInputChange={(_, value) => buscarCie10(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar CIE10"
                fullWidth
                autoFocus
                inputRef={cie10SearchRef}
              />
            )}
            onChange={(_, value) => handleSelectCie10(value)}
            freeSolo
            autoHighlight
          />
        </Box>
      </Modal>

      {/* Modal de confirmación para cancelar la atención */}
      <Modal
        open={openConfirmCancelModal}
        onClose={handleCloseConfirmCancelModal}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            ¿Estás seguro de cancelar la atención?
          </Typography>
          <Typography variant="body1" gutterBottom>
            Todos los datos no guardados se perderán.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              marginTop: "20px",
            }}
          >
            <Button variant="outlined" onClick={handleCloseConfirmCancelModal}>
              No, continuar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelAtencion}
            >
              Sí, cancelar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para mostrar la Historia Clínica */}
      <Modal
        open={openHistoriaClinicaModal}
        onClose={() => setOpenHistoriaClinicaModal(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "1200px",
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <IconButton
            onClick={() => setOpenHistoriaClinicaModal(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close />
          </IconButton>

          <Typography variant="h6" gutterBottom>
            Historia Clínica
          </Typography>
          {paciente && (
            <Box
              sx={{ mb: 3, border: "1px solid #ccc", p: 2, borderRadius: 1 }}
            >
              <Typography variant="h6" gutterBottom>
                Datos del Paciente
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Nombre:</strong> {paciente.pacie_nom_pacie}{" "}
                    {paciente.pacie_ape_pacie}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Cédula:</strong> {paciente.pacie_ced_pacie}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Sexo:</strong> {paciente.sexo_nom_sexo}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Fecha de Nacimiento:</strong>{" "}
                    {new Date(paciente.pacie_fec_nac).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Edad:</strong>{" "}
                    {calcularEdad(paciente.pacie_fec_nac)} años
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Dirección:</strong> {paciente.pacie_dir_pacie}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Especialidad</InputLabel>
              <Select
                value={especialidadSeleccionada}
                onChange={handleCambiarEspecialidad}
                label="Especialidad"
              >
                {especialidades.map((especialidad) => (
                  <MenuItem key={especialidad} value={especialidad}>
                    {especialidad}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <AtencionList
            atenciones={atenciones}
            mostrarEspecialidad={mostrarEspecialidad}
          />

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <select
              value={registrosPorPagina}
              onChange={cambiarRegistrosPorPagina}
              className={styles.select}
            >
              {[10, 20, 50, 100].map((opcion) => (
                <option key={opcion} value={opcion}>
                  Mostrar {opcion} registros
                </option>
              ))}
            </select>
            <Button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={styles.button}
            >
              Anterior
            </Button>
            <span>
              Página {paginaActual} de{" "}
              {Math.ceil(totalAtenciones / registrosPorPagina)}
            </span>
            <Button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={
                paginaActual === Math.ceil(totalAtenciones / registrosPorPagina)
              }
              className={styles.button}
            >
              Siguiente
            </Button>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenHistoriaClinicaModal(false)}
            >
              Cerrar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Fisioterapia;
