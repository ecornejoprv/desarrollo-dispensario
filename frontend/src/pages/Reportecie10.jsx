import React, { useState, useEffect } from "react";
import {
  Container, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Box, Chip, alpha, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select,
  MenuItem, Grid, TextField, Card, Divider, Avatar, useTheme,Switch, FormControlLabel
} from "@mui/material";
import { FileDownload, PictureAsPdf, BarChart as BarChartIcon, PieChart as PieChartIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import api from "../api";
import styles from "./styles/reporteDiagnosticos.module.css";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReporteTop10Diagnosticos = () => {
   const [mostrarTop10, setMostrarTop10] = useState(true);
  const theme = useTheme();
  const [generos, setGeneros] = useState([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openObservaciones, setOpenObservaciones] = useState(false);
  const [observacionesActuales, setObservacionesActuales] = useState("");
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [mostrarGraficos, setMostrarGraficos] = useState(true);
 const [incluirDiagnosticosZ, setIncluirDiagnosticosZ] = useState(false);
  // Obtener géneros disponibles
  const obtenerGeneros = async () => {
    try {
      const response = await api.get("/api/v1/reportes/api/generos");
      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        setGeneros([{ value: "", label: "TODOS" }, ...data.map(g => ({
          value: g.idgen_cod_idgen,
          label: g.idgen_nom_idgen
        }))]);
      }
    } catch (error) {
      setGeneros([{ value: "", label: "TODOS" }]);
    }
  };

  // Obtener empresas disponibles
  const obtenerEmpresas = async () => {
    try {
      const response = await api.get("/api/v1/reporte-combinado/top10-diagnosticos");
      const empresas = response.data.data.filtros.empresas || [];
      setEmpresas([{ value: "", label: "TODAS" }, ...empresas]);
    } catch (error) {
      setEmpresas([{ value: "", label: "TODAS" }]);
    }
  };
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#A4DE6C', '#D0ED57', '#FFA500',
  '#8DD3C7', '#FFFFB3', '#BEBADA', '#FB8072', '#80B1D3',
  '#FDB462', '#B3DE69', '#FCCDE5', '#D9D9D9', '#BC80BD'
];
  // Obtener diagnósticos
  const obtenerDiagnosticos = async () => {
    setLoading(true);
    try {
       const params = {
        genero: generoSeleccionado || undefined,
        empresa: empresaSeleccionada || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        incluirZ: incluirDiagnosticosZ ? 'true' : 'false',
        top10: mostrarTop10 ? 'true' : 'false'
      };
      // Eliminar parámetros undefined
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await api.get(
        "/api/v1/reporte-combinado/top10-diagnosticos", 
        { params }
      );
      
      if (response.data.success) {
         const datosProcesados = response.data.data.diagnosticos?.map(item => ({
          ...item,
          codigoCie10: item.cie10_id_cie10 || item.diag_cod_cie10 // Usar el campo correcto
        })) || [];
       setDiagnosticos(datosProcesados);
        setTotalRegistros(response.data.data.total || 0);
      } else {
        throw new Error(response.data.message || "Error en la respuesta del servidor");
      }
    } catch (error) {
      setDiagnosticos([]);
      setTotalRegistros(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerGeneros();
    obtenerEmpresas();
  }, []);

  useEffect(() => {
    obtenerDiagnosticos();
  }, [generoSeleccionado, empresaSeleccionada, fechaInicio, fechaFin,incluirDiagnosticosZ, mostrarTop10]);

  // Función para preparar datos para gráficos
  const getChartData = () => {
    if (!diagnosticos || diagnosticos.length === 0) return null;

    // Datos para gráfico de barras (top 10)
    const barData = diagnosticos.map(item => ({
      name: item.cie10_id_cie10,
      value: item.cantidad,
      fullName: item.diagnostico
    }));

    // Datos para gráfico de pastel (distribución por género)
    const genderData = diagnosticos.reduce((acc, item) => {
      const gender = item.genero || "NO ESPECIFICADO";
      const existing = acc.find(g => g.name === gender);
      if (existing) {
        existing.value += item.cantidad;
      } else {
        acc.push({ name: gender, value: item.cantidad });
      }
      return acc;
    }, []);

    return { barData, genderData };
  };

  const chartData = getChartData();

  const exportarAExcel = () => {
    if (!diagnosticos.length) {
      alert("No hay datos para exportar");
      return;
    }
  
    const datosExcel = diagnosticos.map((item) => ({
      "Código CIE10": item.cie10_id_cie10,
      "Diagnóstico": item.diagnostico,
      "Cantidad": item.cantidad,
      "Género": item.genero || "NO ESPECIFICADO",
      "Empresa": item.empresa || "SIN EMPRESA",
      "Fecha de Cita": item.fecha_cita ? item.fecha_cita.substring(0, 10) : "",
      "Observaciones": item.observaciones || "N/A"
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    XLSX.utils.book_append_sheet(wb, ws, "Top 10 Diagnósticos");
    
    // Agregar hoja con datos de gráficos
    if (chartData) {
      const chartSheet = XLSX.utils.json_to_sheet([
        { "Tipo de Gráfico": "Distribución por Diagnóstico" },
        ...chartData.barData.map(item => ({
          "Código": item.name,
          "Diagnóstico": item.fullName,
          "Cantidad": item.value
        })),
        {},
        { "Tipo de Gráfico": "Distribución por Género" },
        ...chartData.genderData.map(item => ({
          "Género": item.name,
          "Cantidad": item.value
        }))
      ]);
      XLSX.utils.book_append_sheet(wb, chartSheet, "Datos Gráficos");
    }
    
    XLSX.writeFile(wb, `Top10_Diagnosticos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportarAPDF = async () => {
    if (!diagnosticos.length) {
      alert("No hay datos para exportar");
      return;
    }
    
    // Convertir gráficos a imágenes
    const [barChartImg, pieChartImg] = await Promise.all([
      convertToImage('bar-chart-container'),
      convertToImage('pie-chart-container')
    ]);

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Top 10 Diagnósticos", 14, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Filtros: ${generoSeleccionado ? generos.find(g => g.value === generoSeleccionado)?.label : "Todos"} | ${empresaSeleccionada || "Todas las empresas"}`,
      14, 22
    );
    doc.text(`Total registros: ${totalRegistros}`, 14, 28);
    
    // Agregar gráficos al PDF
    if (barChartImg) {
      doc.addImage(barChartImg, 'PNG', 15, 35, 180, 80);
    }
    
    if (pieChartImg) {
      doc.addPage();
      doc.addImage(pieChartImg, 'PNG', 15, 20, 180, 80);
    }
    
    // Agregar tabla de datos
    doc.addPage();
    autoTable(doc, {
      head: [["Código", "Diagnóstico", "Cantidad", "Género", "Empresa", "Fecha de Cita"]],
      body: diagnosticos.map(item => [
        item.cie10_id_cie10,
        item.diagnostico,
        item.cantidad.toString(),
        item.genero || "NO ESPECIFICADO",
        item.empresa || "SIN EMPRESA",
        item.fecha_cita ? item.fecha_cita.substring(0, 10) : ""
      ]),
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: "#3182ce", textColor: "#ffffff", fontStyle: "bold" }
    });
    
    doc.save(`Top10_Diagnosticos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const convertToImage = async (elementId) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return null;
      const canvas = await html2canvas(element);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error al convertir a imagen:', error);
      return null;
    }
  };

  const verObservaciones = (obs) => {
    setObservacionesActuales(obs);
    setOpenObservaciones(true);
  };

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Typography variant="h5" gutterBottom className={styles.title} sx={{ mb: 3 }}>
        Top 10 Diagnósticos por Género, Empresa y Fecha
      </Typography>

      {/* Filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="genero-label">Género</InputLabel>
            <Select
              labelId="genero-label"
              value={generoSeleccionado}
              label="Género"
              onChange={(e) => setGeneroSeleccionado(e.target.value)}
            >
              {generos.map((genero) => (
                <MenuItem key={genero.value} value={genero.value}>
                  {genero.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id="empresa-label">Empresa</InputLabel>
            <Select
              labelId="empresa-label"
              value={empresaSeleccionada}
              label="Empresa"
              onChange={(e) => setEmpresaSeleccionada(e.target.value)}
            >
              {empresas.map((empresa) => (
                <MenuItem key={empresa.value} value={empresa.value}>
                  {empresa.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Fecha Inicio"
            InputLabelProps={{ shrink: true }}
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Fecha Fin"
            InputLabelProps={{ shrink: true }}
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={2}>
    <FormControlLabel
      control={
        <Switch
          checked={incluirDiagnosticosZ}
          onChange={() => setIncluirDiagnosticosZ(!incluirDiagnosticosZ)}
          color="primary"
        />
      }
      label="Incluir códigos Z"
      labelPlacement="start"
      sx={{ ml: 0, justifyContent: "space-between", width: "100%" }}
    />
  </Grid>
  <Grid item xs={12} md={2}>
    <FormControlLabel
      control={
        <Switch
          checked={mostrarTop10}
          onChange={() => setMostrarTop10(!mostrarTop10)}
          color="primary"
        />
      }
      label="Mostrar Top 10"
      labelPlacement="start"
      sx={{ ml: 0, justifyContent: "space-between", width: "100%" }}
    />
  </Grid>
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setMostrarGraficos(!mostrarGraficos)}
            startIcon={mostrarGraficos ? <PieChartIcon /> : <BarChartIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {mostrarGraficos ? "Ocultar gráficos" : "Mostrar gráficos"}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={exportarAExcel}
            startIcon={<FileDownload />}
            disabled={!diagnosticos.length}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Excel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<PictureAsPdf />}
            onClick={exportarAPDF}
            disabled={!diagnosticos.length}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            PDF
          </Button>
        </Grid>
      </Grid>

      {/* Resumen */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: "#f8fafc", borderRadius: "8px" }}>
        <Typography variant="body1">
          <strong>Total general de diagnósticos:</strong> {totalRegistros}
        </Typography>
      </Box>

      {/* Resultados */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : diagnosticos.length === 0 ? (
        <Paper elevation={0} sx={{
          p: 3,
          textAlign: "center",
          border: "1px dashed #e2e8f0",
          backgroundColor: "#f8fafc"
        }}>
          <Typography variant="body1" color="textSecondary">
            No se encontraron diagnósticos registrados para los filtros seleccionados.
          </Typography>
        </Paper>
      ) : (
        <Box>
   {mostrarGraficos && chartData && (
  <Grid container spacing={3} sx={{ mb: 3 }}>
    <Grid item xs={12}>
      <Card id="bar-chart-container" sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
          <BarChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          Top 10 Diagnósticos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ width: '100%', height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.barData}
              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, 'Cantidad']}
                labelFormatter={(label) => {
                  const item = chartData.barData.find(d => d.name === label);
                  return item ? `${item.fullName}` : label;
                }}
              />
              <Legend 
                formatter={(value, entry, index) => {
                  const item = chartData.barData[index];
                  return `${item.name} - ${item.fullName}`;
                }}
              />
              <Bar dataKey="value" name="Cantidad">
                {chartData.barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    name={`${entry.name} - ${entry.fullName}`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    </Grid>
              {/* <Grid item xs={12} md={6}>
                <Card id="pie-chart-container" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                    <PieChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Distribución por Género
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={chartData.genderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {chartData.genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Cantidad']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid> */}
            </Grid>
          )}
          
          {/* Tabla de datos */}
          <Paper elevation={0} sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            p: 2,
            borderRadius: "8px 8px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3
          }}>
            <Typography variant="h6" fontWeight={600}>
              Detalle de diagnósticos
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              Total: {totalRegistros}
            </Typography>
          </Paper>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderTop: "none",
              borderRadius: "0 0 8px 8px"
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold' }}>Código CIE10</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold' }}>Diagnóstico</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold' }} align="center">Cantidad</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold' }}>Género</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold' }}>Empresa</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100], fontWeight: 'bold' }}>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diagnosticos.map((item, index) => (
                  <TableRow
                    key={`${item.diag_cod_cie10}-${index}`}
                    hover
                    sx={{
                      "&:nth-of-type(even)": { backgroundColor: "#f8fafc" },
                      "&:hover": { backgroundColor: "#f0f7ff" },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      {item.codigoCie10}
                    </TableCell>
                    <TableCell>
                      {item.diagnostico}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.cantidad}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {item.genero || "NO ESPECIFICADO"}
                    </TableCell>
                    <TableCell>
                      {item.empresa || "SIN EMPRESA"}
                    </TableCell>
                    <TableCell>
                      {item.fecha_inicio_rango && item.fecha_fin_rango ? (
          `${new Date(item.fecha_inicio_rango).toLocaleDateString('es-ES')} - ${new Date(item.fecha_fin_rango).toLocaleDateString('es-ES')}`
        ) : ""}
                    </TableCell>
                    <TableCell>
                      {item.observaciones ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => verObservaciones(item.observaciones)}
                          sx={{
                            textTransform: "none",
                            fontSize: "0.75rem",
                          }}
                        >
                          Ver
                        </Button>
                      ) : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Diálogo de observaciones */}
      <Dialog
        open={openObservaciones}
        onClose={() => setOpenObservaciones(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Observaciones del diagnóstico</DialogTitle>
        <DialogContent>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
            }}
          >
            {observacionesActuales}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenObservaciones(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReporteTop10Diagnosticos;