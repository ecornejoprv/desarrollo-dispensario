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
  Radio,
} from "@mui/material";
import { Popper } from "@mui/material";
import {
  Add,
  Delete,
  Search,
  Close,
  Print as PrintIcon,
  AssignmentInd,
  MedicalServices,
} from "@mui/icons-material";
import api from "../api";
import styles from "./styles/Fisioterapia.module.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import AtencionList from "../components/AtencionList";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AirIcon from "@mui/icons-material/Air";
import SpeedIcon from "@mui/icons-material/Speed";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import HeightIcon from "@mui/icons-material/Height";
import CalculateIcon from "@mui/icons-material/Calculate";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AntecedentesCompletos from "../components/Antecedentes";
import EvaluacionOsteomuscularModal from "../components/EvaluacionOsteomuscularModal";
import { formatDateDDMMYYYY } from "../components/utils/formatters.js";
import { useAuth } from "../components/context/AuthContext";
import { RecetaMedicaPrint } from "../components/RecetaMedicaPrint";

const especialidades = [
  "Todas",
  "Medicina",
  "Odontologia",
  "Fisioterapia",
  "Enfermeria",
];

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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
  const [datosEmpleado, setDatosEmpleado] = useState({
    departamento: "",
    seccion: "",
    cargo: "",
    fechaIngreso: null,
  });
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
  const [signosAlarma, setSignosAlarma] = useState([]);
  const [openConfirmCancelModal, setOpenConfirmCancelModal] = useState(false);
  const [tipoSesion, setTipoSesion] = useState("numero");
  const [openCancelCitaModal, setOpenCancelCitaModal] = useState(false);
  const [citaParaCancelarId, setCitaParaCancelarId] = useState(null);
  const [numeroSesion, setNumeroSesion] = useState(1);
  const [openEvalOsteoModal, setOpenEvalOsteoModal] = useState(false);
  const [horaAtencion, setHoraAtencion] = useState(
    new Date().toTimeString().split(" ")[0].substring(0, 5)
  );
  const [atencionGuardadaId, setAtencionGuardadaId] = useState(null);
  const [imprimiendoReceta, setImprimiendoReceta] = useState(false);
  const cie10SearchRef = useRef(null);

  useEffect(() => {
    const fetchCitasPendientes = async () => {
      if (authLoading) return;
      if (!user?.especialista) {
        setError(
          "No se pudo obtener el ID del especialista del perfil de usuario."
        );
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.get(
          `/api/v1/atenciones/citas-pendientes/${user.especialista}`
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
  }, [user, authLoading]);

  const obtenerDatosEmpleado = async () => {
    if (!paciente?.pacie_ced_pacie) return;
    try {
      const response = await api.get(
        `/api/v1/empleados/${paciente.pacie_ced_pacie}/empresa/${paciente.pacie_cod_empr}`
      );
      setDatosEmpleado(
        response.data || {
          departamento: "",
          seccion: "",
          cargo: "",
          fechaIngreso: null,
        }
      );
    } catch (error) {
      console.error("Error al obtener datos del empleado:", error);
      setDatosEmpleado({
        departamento: "",
        seccion: "",
        cargo: "",
        fechaIngreso: null,
      });
    }
  };

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

  const handleCancelarCita = async (citaId) => {
    setCitaParaCancelarId(citaId);
    setOpenCancelCitaModal(true);
  };

  const confirmarCancelacionCita = async () => {
    if (!citaParaCancelarId) return;
    try {
      await api.delete(`/api/v1/citas/${citaParaCancelarId}`);
      setCitasPendientes((prevCitas) =>
        prevCitas.filter((cita) => cita.cita_cod_cita !== citaParaCancelarId)
      );
      setSnackbarMessage("Cita cancelada correctamente.");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error al cancelar la cita:", error);
      setSnackbarMessage("No se pudo cancelar la cita. Inténtalo de nuevo.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      setOpenCancelCitaModal(false);
      setCitaParaCancelarId(null);
    }
  };

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

  useEffect(() => {
    if (paciente) {
      obtenerDatosEmpleado();
    }
  }, [paciente]);

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };
  const cambiarRegistrosPorPagina = (e) => {
    setRegistrosPorPagina(parseInt(e.target.value, 10));
    setPaginaActual(1);
  };
  const handleCambiarEspecialidad = (e) => {
    setEspecialidadSeleccionada(e.target.value);
    setPaginaActual(1);
  };

  const verificarTipoAtencion = async (pacienteId) => {
    try {
      const especialidad = user?.especialidad;
      if (!especialidad)
        throw new Error("No se pudo obtener la especialidad del usuario.");
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
    const tipo = await verificarTipoAtencion(cita.cita_cod_pacie);
    setTipoAtencion(tipo);
    setSelectedCita(cita);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setAtencionGuardadaId(null);
    setSelectedCita(null);
    setMotivoConsulta("");
    setEnfermedadActual("");
    setObservaciones("");
    setDiagnosticos([]);
    setPrescripciones([]);
    setReferencias([]);
    setIndicacionesGenerales([]);
    setSignosAlarma([]);
    setNumeroSesion(1);
    setHoraAtencion(new Date().toTimeString().split(" ")[0].substring(0, 5));
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
        terapias: {},
        tecnicasSeleccionadas: {},
      },
    ]);
  };

  const eliminarDiagnostico = (index) => {
    setDiagnosticos(diagnosticos.filter((_, i) => i !== index));
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
    if (!selectedCita || !validarCampos()) return;

    try {
      const secuencialResponse = await api.post("/api/v1/secuencias/receta", {
        locationId: selectedCita.cita_cod_sucu,
      });
      if (!secuencialResponse.data.success) {
        throw new Error(
          secuencialResponse.data.message ||
            "No se pudo generar el secuencial de la receta."
        );
      }
      const numeroReceta = secuencialResponse.data.secuencial;

      const atencionData = {
        aten_cod_paci: selectedCita.cita_cod_pacie,
        aten_cod_cita: selectedCita.cita_cod_cita,
        aten_cod_medi: user.especialista,
        aten_cod_disu: selectedCita.cita_cod_sucu,
        aten_esp_aten: user.especialidad,
        aten_fec_aten: new Date().toISOString().split("T")[0],
        aten_hor_aten: horaAtencion,
        aten_mot_cons: motivoConsulta,
        aten_enf_actu: enfermedadActual,
        aten_obs_ate: observaciones,
        aten_tip_aten: tipoAtencion,
        aten_num_sesi:
          tipoSesion === "numero" ? numeroSesion.toString() : "PROGRAMADA",
        aten_num_receta: numeroReceta,
      };

      const response = await api.post("/api/v1/atenciones/registrar-atencion", {
        atencionData,
        diagnosticos,
        prescripciones,
        referencias,
        indicacionesGenerales,
        signosAlarma,
      });

      if (response.data) {
        const atencionCreada = response.data.atencion;
        setSnackbarMessage("Atención registrada correctamente.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setAtencionGuardadaId(atencionCreada.aten_cod_aten);
        const responseCitas = await api.get(
          `/api/v1/atenciones/citas-pendientes/${user.especialista}`
        );
        setCitasPendientes(responseCitas.data);
      }
    } catch (error) {
      console.error("Error completo al guardar la atención:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Error al guardar la atención";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handlePrintReceta = () => {
    if (atencionGuardadaId) {
      setImprimiendoReceta(true);
    } else {
      setSnackbarMessage("Debe guardar la atención antes de imprimir.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    }
  };

  const agregarSignoAlarma = () => {
    setSignosAlarma([...signosAlarma, { signa_des_signa: "" }]);
  };

  const eliminarSignoAlarma = (index) => {
    const nuevosSignos = signosAlarma.filter((_, i) => i !== index);
    setSignosAlarma(nuevosSignos);
  };

  const handleSignoAlarmaChange = (index, value) => {
    const nuevosSignos = [...signosAlarma];
    nuevosSignos[index].signa_des_signa = value;
    setSignosAlarma(nuevosSignos);
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

  return (
    <Container className={styles.container}>
      {imprimiendoReceta && atencionGuardadaId && (
        <RecetaMedicaPrint
          atencionId={atencionGuardadaId}
          onPrintFinish={() => setImprimiendoReceta(false)}
        />
      )}
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
                <TableCell>{formatDateDDMMYYYY(cita.cita_fec_cita)}</TableCell>
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
                  <Button
                    className={`${styles.button} ${styles.cancelButton}`}
                    onClick={() => handleCancelarCita(cita.cita_cod_cita)}
                    sx={{ ml: 1 }}
                  >
                    Cancelar
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
            <Card className={styles.patientCard}>
              <CardHeader
                avatar={<AssignmentInd color="primary" />}
                title="Datos del Paciente"
                titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
              />
              <CardContent className={styles.patientCardContent}>
                {/* --- COLUMNA IZQUIERDA (AHORA INCLUYE LOS BOTONES) --- */}
                <div className={styles.mainInfo}>
                  <Typography variant="h5" className={styles.patientName}>
                    {paciente.pacie_nom_pacie} {paciente.pacie_ape_pacie}
                  </Typography>

                  <div className={styles.demographicGrid}>
                    <div className={styles.infoItem}>
                      <strong>Cédula</strong>
                      <span>{paciente.pacie_ced_pacie}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Edad</strong>
                      <span>{calcularEdad(paciente.pacie_fec_nac)} años</span>
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Sexo</strong>
                      <span>{paciente.sexo_nom_sexo}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Nacimiento</strong>
                      <span>{formatDateDDMMYYYY(paciente.pacie_fec_nac)}</span>
                    </div>
                  </div>

                  {/* --- CAMBIO PRINCIPAL: Los botones se mueven aquí --- */}
                  {/* Usamos un Box para agrupar los botones y darles espaciado. */}
                  <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setOpenHistoriaClinicaModal(true)}
                      startIcon={<MedicalServices />}
                    >
                      Historia Clínica
                    </Button>
                  </Box>
                </div>

                {/* --- COLUMNA DERECHA (sin cambios) --- */}
                <div className={styles.workInfo}>
                  <div className={styles.infoItem}>
                    <strong>Departamento:</strong>
                    <span>
                      {datosEmpleado?.departamento || "No disponible"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Cargo:</strong>
                    <span>{datosEmpleado?.cargo || "No disponible"}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Sección:</strong>
                    <span>{datosEmpleado?.seccion || "No disponible"}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Fecha de Ingreso:</strong>
                    <span>
                      {datosEmpleado?.fechaIngreso
                        ? formatDateDDMMYYYY(datosEmpleado.fechaIngreso)
                        : "No disponible"}
                    </span>
                  </div>
                </div>
              </CardContent>

              {/* El contenedor <CardActions> que estaba aquí se ha eliminado. */}
            </Card>
          )}
          <div className="my-8">
            {paciente && (
              <div className={styles.pacienteInfo}>
                {/* Información del paciente */}
                <AntecedentesCompletos pacienteId={paciente.pacie_cod_pacie} />
              </div>
            )}
          </div>
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
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={tipoSesion}
                    onChange={(e) => setTipoSesion(e.target.value)}
                  >
                    <FormControlLabel
                      value="numero"
                      control={<Radio size="small" />}
                      label="Número Sesión"
                    />
                    <FormControlLabel
                      value="programada"
                      control={<Radio size="small" />}
                      label="Programada"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3} md={2}>
                {tipoSesion === "numero" ? (
                  <TextField
                    label="N°"
                    type="number"
                    value={numeroSesion}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setNumeroSesion("");
                      } else {
                        const num = parseInt(value);
                        if (!isNaN(num)) {
                          setNumeroSesion(Math.max(1, num));
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        setNumeroSesion(1);
                      }
                    }}
                    onWheel={(e) => e.target.blur()}
                    inputProps={{ min: 1 }}
                    fullWidth
                  />
                ) : (
                  <TextField
                    label="N°"
                    value="PROGRAMADA"
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                )}
              </Grid>

              {/* 👇 AQUÍ SE AÑADE EL CAMPO DE HORA */}
              <Grid item xs={12} sm={3} md={2}>
                <TextField
                  label="Hora de Atención"
                  type="time"
                  value={horaAtencion}
                  onChange={(e) => setHoraAtencion(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }} // Opcional: incrementos de 5 minutos
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 2, // Margen superior añadido
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
                  <MenuItem value="Definitivo">Definitivo</MenuItem>
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
                          <MenuItem value="Stat">Stat</MenuItem>
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

          <Typography variant="h6" gutterBottom>
            Signos de Alarma
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
                {signosAlarma.length > 0 ? (
                  signosAlarma.map((signo, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          value={signo.signa_des_signa}
                          onChange={(e) =>
                            handleSignoAlarmaChange(index, e.target.value)
                          }
                          placeholder="Especifique un signo de alarma (ej. Fiebre persistente)"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => eliminarSignoAlarma(index)}
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
                      No hay signos de alarma agregados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={agregarSignoAlarma}
            sx={{ mb: 3 }}
          >
            Agregar Signo de Alarma
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
            {atencionGuardadaId ? (
              // VISTA POST-GUARDADO
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handlePrintReceta}
                  startIcon={<PrintIcon />}
                >
                  Imprimir Receta
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleCloseModal}
                >
                  Finalizar
                </Button>
              </>
            ) : (
              // VISTA ANTES DE GUARDAR
              <>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleConfirmCancel}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGuardarAtencion}
                >
                  Guardar Atención
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Modal para buscar CIE10 */}
      <Modal open={openCie10Modal} onClose={() => setOpenCie10Modal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "15%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 1400,
            maxWidth: "90vw",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
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
            onChange={(_, value) => {
              if (value) {
                handleSelectCie10(value);
                setOpenCie10Modal(false);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar CIE10"
                fullWidth
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": {
                    padding: "8px 12px",
                  },
                }}
              />
            )}
            componentsProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, 4],
                    },
                  },
                ],
                sx: {
                  minWidth: "fit-content !important",
                  width: "100%",
                  zIndex: 9999,
                  "& .MuiAutocomplete-paper": {
                    width: "100% !important",
                    maxHeight: "150vh",
                    overflow: "hidden",
                    boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
                    marginTop: "4px !important",
                    border: "1px solid #e0e0e0",
                  },
                  "& .MuiAutocomplete-listbox": {
                    padding: 0,
                    maxHeight: "none",
                  },
                },
              },
            }}
            ListboxProps={{
              style: {
                maxHeight: "500px",
                overflow: "auto",
              },
            }}
            renderOption={(props, option) => (
              <li
                {...props}
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  margin: 0,
                  width: "100%",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: 500,
                      color: "#1976d2",
                      display: "inline-block",
                      width: "100px",
                    }}
                  >
                    {option.cie10_id_cie10}
                  </span>
                  <span>{option.cie10_nom_cie10}</span>
                </div>
              </li>
            )}
            freeSolo
            autoHighlight
            noOptionsText="No se encontraron resultados"
            blurOnSelect
          />
        </Box>
      </Modal>

      {/* Modal de confirmación para cancelar la cita */}
      <Modal
        open={openCancelCitaModal}
        onClose={() => setOpenCancelCitaModal(false)}
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
            ¿Estás seguro de cancelar la cita?
          </Typography>
          <Typography variant="body1" gutterBottom>
            Esta acción no se puede deshacer.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              marginTop: "20px",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setOpenCancelCitaModal(false)}
            >
              No, volver
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmarCancelacionCita}
            >
              Sí, cancelar
            </Button>
          </Box>
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
                    {formatDateDDMMYYYY(paciente.pacie_fec_nac)}
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
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Departamento:</strong>{" "}
                    {datosEmpleado?.departamento || "No disponible"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography>
                    <strong>Sección:</strong>{" "}
                    {datosEmpleado?.seccion || "No disponible"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography>
                    <strong>Cargo:</strong>{" "}
                    {datosEmpleado?.cargo || "No disponible"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}></Grid>
                {datosEmpleado?.fechaIngreso && (
                  <Grid item xs={12} md={6}>
                    <Typography>
                      <strong>Fecha de Ingreso:</strong>{" "}
                      {formatDateDDMMYYYY(datosEmpleado.fechaIngreso)}
                    </Typography>
                  </Grid>
                )}
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

      {openEvalOsteoModal && (
        <EvaluacionOsteomuscularModal
          open={openEvalOsteoModal}
          onClose={() => setOpenEvalOsteoModal(false)}
          pacienteId={selectedCita?.cita_cod_pacie}
          pacienteData={paciente}
        />
      )}

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
