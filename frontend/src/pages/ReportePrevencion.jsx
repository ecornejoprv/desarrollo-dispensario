import React, { useState, useEffect, useRef } from "react";
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Box, Chip, 
  FormControl, InputLabel, Select, MenuItem, Grid, Alert,
  Button, ButtonGroup, Checkbox, ListItemText, Card, Divider
} from "@mui/material";
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  BarChart as BarChartIcon
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import api from "../api";

// Paleta de colores para los gráficos
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#A4DE6C', '#D0ED57', '#FFA500',
  '#8DD3C7', '#FFFFB3', '#BEBADA', '#FB8072', '#80B1D3'
];

const ReportePrevencion = () => {
  const [generos, setGeneros] = useState([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState("");
  const [estadisticas, setEstadisticas] = useState([]);
  const [tiposPrevencion, setTiposPrevencion] = useState([]);
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [loading, setLoading] = useState({
    filtros: true,
    datos: false
  });
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  // Obtener géneros disponibles
  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        setLoading(prev => ({ ...prev, filtros: true }));
        setError(null);
        
        const response = await api.get("/api/v1/reportes/api/generos");
        const data = response.data?.data || response.data;
        const generosData = Array.isArray(data) ? data : [data];
        
        setGeneros([
          { value: "", label: "TODOS" }, 
          ...generosData.map(g => ({
            value: g.idgen_cod_idgen || g.value || "",
            label: g.idgen_nom_idgen || g.label || "Sin nombre"
          }))
        ]);
        setError(null);
      } catch (error) {
        setGeneros([
          { value: "", label: "TODOS" },
          { value: "1", label: "MASCULINO" },
          { value: "2", label: "FEMENINO" },
          { value: "3", label: "NO INGRE" }
        ]);
        setError(`Error cargando géneros: ${error.message}`);
      } finally {
        setLoading(prev => ({ ...prev, filtros: false }));
      }
    };
    cargarFiltros();
  }, []);

  // Obtener estadísticas
  const obtenerEstadisticas = async () => {
  try {
    setLoading(prev => ({ ...prev, datos: true }));
    setError(null);
    
    const params = {};
    if (generoSeleccionado) params.genero = generoSeleccionado;
    if (tiposSeleccionados.length > 0) params.tipoPrevencion = tiposSeleccionados.join(",");
    
    const response = await api.get(
      "/api/v1/prevencion/estadisticas-prevencion", 
      { params }
    );
    const data = response.data?.data || response.data;
    const estadisticasData = Array.isArray(data.estadisticas) ? data.estadisticas : Array.isArray(data) ? data : [];
    setEstadisticas(estadisticasData);

    // Extraer los tipos únicos de prevención
    const tiposUnicos = [...new Set(estadisticasData.map(item => item.tipo_prevencion).filter(Boolean))];
    setTiposPrevencion(tiposUnicos);

  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        error.toString() || 
                        'Error desconocido al obtener estadísticas';
    setError(`Error obteniendo estadísticas: ${errorMessage}`);
    setEstadisticas([]);
  } finally {
    setLoading(prev => ({ ...prev, datos: false }));
  }
};

  useEffect(() => {
    if (generos.length > 0 && generoSeleccionado !== undefined) {
      obtenerEstadisticas();
    }
    // eslint-disable-next-line
  }, [generoSeleccionado, tiposSeleccionados]);

  // Filtrar en frontend los resultados según los tipos seleccionados
  const estadisticasFiltradas = tiposSeleccionados.length === 0
    ? estadisticas
    : estadisticas.filter(item => tiposSeleccionados.includes(item.tipo_prevencion));

  // Función para preparar datos para gráficos
  const getChartData = () => {
    if (!estadisticasFiltradas || estadisticasFiltradas.length === 0) return null;

    // Agrupar por tipo de prevención
    const dataByType = estadisticasFiltradas.reduce((acc, item) => {
      const tipo = item.tipo_prevencion || 'NO ESPECIFICADO';
      const existing = acc.find(t => t.name === tipo);
      if (existing) {
        existing.value += item.total || 0;
      } else {
        acc.push({ 
          name: tipo,
          value: item.total || 0,
          fullName: tipo
        });
      }
      return acc;
    }, []);

    return { barData: dataByType };
  };

  const chartData = getChartData();

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      estadisticasFiltradas.map(item => ({
        "Tipo de Prevención": item.tipo_prevencion || 'N/A',
        "Género": item.genero || 'N/A',
        "Total": item.total || 0,
        "Observaciones": item.observaciones || 'N/A'
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ReportePrevencion");
    
    // Agregar hoja con datos del gráfico
    if (chartData) {
      const chartSheet = XLSX.utils.json_to_sheet(
        chartData.barData.map(item => ({
          "Tipo de Prevención": item.name,
          "Total": item.value
        }))
      );
      XLSX.utils.book_append_sheet(workbook, chartSheet, "DatosGrafico");
    }
    
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Reporte_Prevencion_${fecha}.xlsx`);
  };

  // Exportar a PDF
  const exportToPDF = async () => {
    if (!tableRef.current) return;
    setLoading(prev => ({ ...prev, datos: true }));
    try {
      // Capturar tabla
      const canvasTable = await html2canvas(tableRef.current);
      const imgDataTable = canvasTable.toDataURL('image/png');
      
      // Capturar gráfico si existe
      let imgDataChart = null;
      if (chartData) {
        const chartElement = document.getElementById('bar-chart-container');
        if (chartElement) {
          const canvasChart = await html2canvas(chartElement);
          imgDataChart = canvasChart.toDataURL('image/png');
        }
      }
      
      const pdf = new jsPDF('landscape');
      
      // Agregar gráfico al PDF si existe
      if (imgDataChart) {
        const imgPropsChart = pdf.getImageProperties(imgDataChart);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
        const pdfHeightChart = (imgPropsChart.height * pdfWidth) / imgPropsChart.width;
        pdf.addImage(imgDataChart, 'PNG', 10, 10, pdfWidth, pdfHeightChart);
        pdf.addPage();
      }
      
      // Agregar tabla al PDF
      const imgPropsTable = pdf.getImageProperties(imgDataTable);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeightTable = (imgPropsTable.height * pdfWidth) / imgPropsTable.width;
      pdf.addImage(imgDataTable, 'PNG', 10, 10, pdfWidth, pdfHeightTable);
      
      const fecha = new Date().toISOString().slice(0, 10);
      pdf.save(`Reporte_Prevencion_${fecha}.pdf`);
    } catch (error) {
      setError(`Error al generar PDF: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, datos: false }));
    }
  };

  const isLoading = loading.filtros || loading.datos;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Reporte de Actividades de Prevención
        </Typography>
        <ButtonGroup variant="contained" disabled={isLoading || estadisticasFiltradas.length === 0}>
          <Button startIcon={<ExcelIcon />} onClick={exportToExcel} color="success">Excel</Button>
          <Button startIcon={<PdfIcon />} onClick={exportToPDF} color="error">PDF</Button>
        </ButtonGroup>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Género</InputLabel>
            <Select
              value={generoSeleccionado}
              onChange={(e) => setGeneroSeleccionado(e.target.value)}
              disabled={loading.filtros}
              label="Género"
              sx={{ minWidth: 200 }}
            >
              {generos.map((genero, index) => (
                <MenuItem key={genero.value || `genero-${index}`} value={genero.value}>
                  {genero.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Prevención</InputLabel>
            <Select
              label="Tipo de Prevención"
              multiple
              value={tiposSeleccionados}
              onChange={e => setTiposSeleccionados(e.target.value)}
              renderValue={selected => selected.join(', ')}
              disabled={loading.datos || tiposPrevencion.length === 0}
            >
              {tiposPrevencion.map(tipo => (
                <MenuItem key={tipo} value={tipo}>
                  <Checkbox checked={tiposSeleccionados.indexOf(tipo) > -1} />
                  <ListItemText primary={tipo} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading.filtros ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Cargando filtros...
          </Typography>
        </Box>
      ) : isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
      ) : estadisticasFiltradas.length === 0 ? (
        <Paper elevation={0} sx={{ 
          p: 3, 
          textAlign: 'center', 
          backgroundColor: 'grey.50',
          border: '1px dashed',
          borderColor: 'grey.300'
        }}>
          <Typography variant="body1" color="textSecondary">
            No se encontraron registros con los filtros seleccionados
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Gráfico estadístico */}
          {chartData && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Card id="bar-chart-container" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                    <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Distribución por Tipo de Prevención
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ width: '100%', height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.barData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={120} 
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [value, 'Total']}
                          labelFormatter={(label) => {
                            const item = chartData.barData.find(d => d.name === label);
                            return item ? `${item.name}` : label;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="value" name="Total">
                          {chartData.barData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tabla de datos */}
          <TableContainer 
            component={Paper} 
            elevation={3} 
            sx={{ borderRadius: 2 }}
            ref={tableRef}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo de Prevención</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Género</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estadisticasFiltradas.map((item, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                      '&:hover': { backgroundColor: 'action.selected' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: '500' }}>
                      {item.tipo_prevencion || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {item.genero || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={item.total || 0} 
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      {item.observaciones?.split(';').slice(0, 3).join('; ') || 'N/A'}
                      {item.observaciones?.split(';').length > 3 && '...'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default ReportePrevencion;