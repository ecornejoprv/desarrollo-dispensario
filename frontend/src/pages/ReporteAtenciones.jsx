// src/pages/reportes/ReporteAtenciones.jsx (Código Absolutamente Completo y Corregido)
// ==============================================================================
// @summary: Componente para generar reportes de atenciones.
//           Se corrige el error 'useCallback is not defined' añadiendo 'useCallback'
//           a la lista de importaciones desde 'react'. Este hook se utiliza para
//           optimizar la función de búsqueda de atenciones.
// ==============================================================================

// --- CAMBIO CLAVE: Se añade 'useCallback' a la importación de React ---
import React, { useState, useEffect, useCallback } from "react";
import {
  Container, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel,
  FormControl, CircularProgress, Box, IconButton, ListSubheader, Chip, alpha,
} from "@mui/material";
import { Search, ArrowBack, ArrowForward } from "@mui/icons-material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import api from "../api";
import styles from "./styles/reporteAtenciones.module.css";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../components/context/AuthContext";

const ReporteAtenciones = () => {
  const { activeLocation } = useAuth();
  // Estados para el reporte
  const [atenciones, setAtenciones] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [medicoId, setMedicoId] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAtenciones, setTotalAtenciones] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [limit] = useState(10);

  useEffect(() => {
    const cargarMedicos = async () => {
      if (!activeLocation) return; // No hacer nada si no hay una ubicación activa

      setLoadingMedicos(true);
      try {
        const response = await api.get("/api/v1/medicos", {
          params: { locationId: activeLocation } // Se envía la ubicación activa al backend
        });

        // Se filtra en el frontend por las especialidades deseadas
        const especialidadesDeseadas = ["Medicina", "Fisioterapia", "Odontologia"];
        const medicosFiltrados = (response.data || []).filter(medico => 
            especialidadesDeseadas.includes(medico.espe_nom_espe)
        );

        setMedicos(medicosFiltrados);
      } catch (error) {
        console.error("Error al cargar médicos:", error);
        setMedicos([]);
      } finally {
        setLoadingMedicos(false);
      }
    };

    cargarMedicos();
  }, [activeLocation]);
  const obtenerAtenciones = useCallback(async () => {
    if (!fechaInicio || !fechaFin) return;

    setLoading(true);
    try {
      const params = { fechaInicio, fechaFin, page, limit };
      if (medicoId) {
        params.medicoId = medicoId;
      }
      const response = await api.get("/api/v1/atenciones/reporte-atenciones", { params });
      setAtenciones(response.data.atenciones || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalAtenciones(response.data.total || 0);
    } catch (error) {
      console.error("Error al obtener atenciones:", error);
      setAtenciones([]);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, medicoId, page, limit]);

  useEffect(() => {
    obtenerAtenciones();
  }, [page, obtenerAtenciones]);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPages) {
      setPage(nuevaPagina);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const medicosAgrupados = Array.isArray(medicos)
    ? medicos.reduce((acc, medico) => {
        const especialidad = medico.espe_nom_espe || "Sin especialidad";
        if (!acc[especialidad]) {
          acc[especialidad] = [];
        }
        acc[especialidad].push(medico);
        return acc;
      }, {})
    : {};

  const obtenerTodasLasAtenciones = async () => {
    try {
      const params = { fechaInicio, fechaFin };
      if (medicoId) params.medicoId = medicoId;
      const response = await api.get("/api/v1/atenciones/reporte-atenciones", {
        params: { ...params, limit: 10000 },
      });
      return response.data.atenciones || [];
    } catch (error) {
      console.error("Error al obtener todas las atenciones para exportar:", error);
      return [];
    }
  };

  const diasEnRango = (fechaInicio, fechaFin) => {
    const diff = new Date(fechaFin) - new Date(fechaInicio);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const obtenerDiaSemana = (fecha) => {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return dias[new Date(fecha).getUTCDay()];
  };

  const obtenerAtencionesPorFecha = (atenciones) => {
    const porFecha = atenciones.reduce((acc, { aten_fec_aten }) => {
      const fecha = formatFecha(aten_fec_aten);
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(porFecha).sort((a, b) => {
        const [dayA, monthA, yearA] = a[0].split('/');
        const [dayB, monthB, yearB] = b[0].split('/');
        return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
    });
  };

  const formatearDatos = (atenciones) => {
    return atenciones.map((aten, index) => {
      const diagnosticos = aten.diagnosticos?.map((diag, diagIndex) => ({
        [`Diagnóstico ${diagIndex + 1} - Código`]: diag.codigo || "N/A",
        [`Diagnóstico ${diagIndex + 1} - Nombre`]: diag.nombre || "N/A"
      })) || [];
      const rowData = {
        "#": index + 1, "Fecha": formatFecha(aten.aten_fec_aten), "Día": obtenerDiaSemana(aten.aten_fec_aten),
        "Hora": aten.aten_hor_aten?.substring(0, 5), "Paciente": `${aten.pacie_nom_pacie} ${aten.pacie_ape_pacie}`,
        "Cédula": aten.pacie_ced_pacie, "Médico": aten.medic_nom_medic, "Especialidad": aten.espe_nom_espe || "N/A",
        "Empresa": aten.empr_nom_empr || "N/A", "Motivo": aten.aten_mot_cons || "N/A", "Tipo": aten.aten_tip_aten
      };
      return Object.assign({}, rowData, ...diagnosticos);
    });
  };

  const generarMetricas = (atenciones) => {
    const porEmpresa = atenciones.reduce((acc, { empr_nom_empr }) => {
      const key = empr_nom_empr || "Sin empresa"; acc[key] = (acc[key] || 0) + 1; return acc;
    }, {});
    const porMedico = atenciones.reduce((acc, { medic_nom_medic, espe_nom_espe }) => {
      const key = `${medic_nom_medic} (${espe_nom_espe || "Sin especialidad"})`; acc[key] = (acc[key] || 0) + 1; return acc;
    }, {});
    const porEspecialidad = atenciones.reduce((acc, { espe_nom_espe }) => {
      const key = espe_nom_espe || "Sin especialidad"; acc[key] = (acc[key] || 0) + 1; return acc;
    }, {});
    return {
      porEmpresa: Object.entries(porEmpresa).sort((a, b) => b[1] - a[1]),
      porMedico: Object.entries(porMedico).sort((a, b) => b[1] - a[1]),
      porEspecialidad: Object.entries(porEspecialidad).sort((a, b) => b[1] - a[1]),
    };
  };

  const exportarAExcel = async () => {
    const todasLasAtenciones = await obtenerTodasLasAtenciones();
    if (todasLasAtenciones.length === 0) { alert("No hay datos para exportar"); return; }
    const metricas = generarMetricas(todasLasAtenciones);
    const datosFormateados = formatearDatos(todasLasAtenciones);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(datosFormateados), "Atenciones");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(metricas.porEmpresa.map(([e, c]) => ({ Empresa: e, "Total Atenciones": c }))), "Por Empresa");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(metricas.porMedico.map(([m, c]) => ({ Médico: m.split(" (")[0], Especialidad: m.match(/\(([^)]+)\)/)[1], "Total Atenciones": c, "Promedio diario": (c / diasEnRango(fechaInicio, fechaFin)).toFixed(1) }))), "Por Médico");
    const atencionesPorFecha = obtenerAtencionesPorFecha(todasLasAtenciones);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([...atencionesPorFecha.map(([f, c]) => ({ Fecha: f, "Total Atenciones": c })), { Fecha: "TOTAL PERÍODO", "Total Atenciones": todasLasAtenciones.length }]), "Por Fecha");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(metricas.porEspecialidad.map(([e, c]) => ({ Especialidad: e, "Total Atenciones": c, "Médicos involucrados": metricas.porMedico.filter(([m]) => m.includes(e)).length }))), "Por Especialidad");
    XLSX.writeFile(wb, `Reporte_Atenciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportarAPDF = async () => {
    const todasLasAtenciones = await obtenerTodasLasAtenciones();
    if (todasLasAtenciones.length === 0) { alert("No hay datos para exportar"); return; }
    const doc = new jsPDF({ orientation: "landscape", unit: "mm" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text(`Reporte de Atenciones (${formatFecha(fechaInicio)} a ${formatFecha(fechaFin)})`, 14, 15);
    const bodyData = todasLasAtenciones.map((aten, i) => [i + 1, formatFecha(aten.aten_fec_aten), aten.aten_hor_aten?.substring(0, 5), `${aten.pacie_nom_pacie} ${aten.pacie_ape_pacie}`, aten.pacie_ced_pacie, aten.medic_nom_medic, aten.espe_nom_espe || "N/A", aten.diagnosticos?.map(d => `${d.codigo} - ${d.nombre}`).join(", ") || "S/D", aten.aten_mot_cons || "S/M", aten.aten_tip_aten]);
    autoTable(doc, {
      head: [["#", "Fecha", "Hora", "Paciente", "Cédula", "Médico", "Especialidad", "Diagnósticos", "Motivo", "Tipo"]],
      body: bodyData, startY: 25, styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: "#3182ce", textColor: "#ffffff", fontStyle: "bold" },
    });
    doc.save(`Reporte_Atenciones_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Typography variant="h5" gutterBottom className={styles.title} sx={{ mb: 3 }}>Reporte de Atenciones Médicas</Typography>
      <Paper elevation={0} className={styles.filterContainer} sx={{ background: "linear-gradient(to right, #f6f9fc, #f0f4f8)", border: "1px solid #e0e6ed" }}>
        <Box className={styles.filterGrid}>
          <Box className={styles.dateFieldContainer}>
            <Typography variant="body2" className={styles.dateLabel} sx={{ fontWeight: 600, color: "#4a5568" }}>Fecha Inicio</Typography>
            <TextField type="date" value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setPage(1); }} variant="outlined" size="small" className={styles.dateInput} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", "&:hover fieldset": { borderColor: "#3182ce" } } }} InputLabelProps={{ shrink: true }} />
          </Box>
          <Box className={styles.dateFieldContainer}>
            <Typography variant="body2" className={styles.dateLabel} sx={{ fontWeight: 600, color: "#4a5568" }}>Fecha Fin</Typography>
            <TextField type="date" value={fechaFin} onChange={(e) => { setFechaFin(e.target.value); setPage(1); }} variant="outlined" size="small" className={styles.dateInput} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", "&:hover fieldset": { borderColor: "#3182ce" } } }} InputLabelProps={{ shrink: true }} />
          </Box>
          <Box className={styles.filterItem}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: "#4a5568", fontWeight: 600 }}>Médico</InputLabel>
              <Select value={medicoId} onChange={(e) => { setMedicoId(e.target.value); setPage(1); }} label="Médico" disabled={loadingMedicos} sx={{ borderRadius: "8px" }}>
                <MenuItem value=""><em>Todos los médicos</em></MenuItem>
                {Object.entries(medicosAgrupados).map(([especialidad, medicosGrupo]) => [
                  <ListSubheader key={`subheader-${especialidad}`} sx={{ background: "#f0f4f8", fontWeight: 600 }}>{especialidad}</ListSubheader>,
                  medicosGrupo.map((medico) => (
                    <MenuItem key={medico.medic_cod_medic} value={medico.medic_cod_medic}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{medico.medic_nom_medic}</Typography>
                        {medico.medic_ced_medic && (<Typography variant="caption" color="textSecondary">{medico.medic_ced_medic}</Typography>)}
                      </Box>
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>
          </Box>
          <Box className={styles.filterItem}>
            <Button variant="contained" color="primary" onClick={() => { setPage(1); obtenerAtenciones(); }} disabled={loading || !fechaInicio || !fechaFin} startIcon={loading ? <CircularProgress size={20} /> : <Search />} className={styles.searchButton} fullWidth sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, height: "40px", boxShadow: "none", "&:hover": { boxShadow: "none", backgroundColor: "#2b6cb0" } }}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </Box>
        </Box>
      </Paper>
      <Typography variant="body1" className={styles.totalAtenciones} sx={{ mt: 2, mb: 1, display: "inline-block" }}>
        Total de atenciones: <strong>{totalAtenciones || 0}</strong>
      </Typography>
      <TableContainer component={Paper} className={styles.tableContainer} elevation={0} sx={{ border: "1px solid #e0e6ed", borderRadius: "12px", overflowX: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell><TableCell>Fecha</TableCell><TableCell>Hora</TableCell>
              <TableCell>Paciente</TableCell><TableCell>Sexo</TableCell><TableCell>Cédula</TableCell>
              <TableCell>Empresa</TableCell><TableCell>Médico</TableCell><TableCell>Especialidad</TableCell>
              <TableCell>Diagnóstico(s)</TableCell><TableCell>Motivo</TableCell><TableCell>Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={12} align="center" sx={{ py: 4 }}><CircularProgress size={24} /><Typography variant="body2" mt={1} color="textSecondary">Cargando...</Typography></TableCell></TableRow>
            ) : atenciones.length > 0 ? (
              atenciones.map((aten, index) => (
                <TableRow key={aten.aten_cod_aten} hover sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:nth-of-type(even)": { backgroundColor: "#f8fafc" }, "&:hover": { backgroundColor: "#f0f7ff" } }}>
                  <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                  <TableCell>{formatFecha(aten.aten_fec_aten)}</TableCell>
                  <TableCell>{aten.aten_hor_aten?.substring(0, 5)}</TableCell>
                  <TableCell><Typography variant="body2" fontWeight={500}>{aten.pacie_nom_pacie} {aten.pacie_ape_pacie}</Typography></TableCell>
                  <TableCell>{aten.sexo_nom_sexo}</TableCell>
                  <TableCell>{aten.pacie_ced_pacie}</TableCell>
                  <TableCell>{aten.empr_nom_empr || "N/A"}</TableCell>
                  <TableCell>{aten.medic_nom_medic}</TableCell>
                  <TableCell>{aten.espe_nom_espe || "N/A"}</TableCell>
                  <TableCell>{aten.diagnosticos?.length > 0 ? (<Box>{aten.diagnosticos.map((diag, i) => (<Box key={i} mb={1}><Typography variant="body2" fontWeight={500}>{diag.codigo} - {diag.nombre}</Typography></Box>))}</Box>) : (<Typography variant="body2" color="textSecondary">S/D</Typography>)}</TableCell>
                  <TableCell>{aten.aten_mot_cons || "S/M"}</TableCell>
                  <TableCell><Chip label={aten.aten_tip_aten} size="small" sx={{ fontWeight: 500, backgroundColor: aten.aten_tip_aten === "Primera" ? alpha("#3182ce", 0.1) : alpha("#e2e8f0", 0.8), color: aten.aten_tip_aten === "Primera" ? "#3182ce" : "#4a5568" }} /></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={12} align="center" sx={{ py: 4 }}><Typography variant="body2" color="textSecondary">{fechaInicio && fechaFin ? "No se encontraron atenciones" : "Seleccione un rango de fechas"}</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {atenciones.length > 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3} mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => cambiarPagina(page - 1)} disabled={page === 1} sx={{ border: "1px solid #e2e8f0", "&:hover": { backgroundColor: "#ebf4ff" } }}><ArrowBack sx={{ color: page === 1 ? "#cbd5e0" : "#4a5568" }} /></IconButton>
            <Typography variant="body2" sx={{ color: "#4a5568", fontWeight: 500 }}>Página {page} de {totalPages}</Typography>
            <IconButton onClick={() => cambiarPagina(page + 1)} disabled={page === totalPages} sx={{ border: "1px solid #e2e8f0", "&:hover": { backgroundColor: "#ebf4ff" } }}><ArrowForward sx={{ color: page === totalPages ? "#cbd5e0" : "#4a5568" }} /></IconButton>
          </Box>
        </Box>
      )}
      <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 3 }}>
        <Button variant="contained" color="success" onClick={exportarAExcel} startIcon={<FileDownloadIcon />} disabled={!fechaInicio || !fechaFin}>Exportar a Excel</Button>
        <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />} onClick={exportarAPDF} disabled={!fechaInicio || !fechaFin}>Exportar a PDF</Button>
      </Box>
    </Container>
  );
};

export default ReporteAtenciones;