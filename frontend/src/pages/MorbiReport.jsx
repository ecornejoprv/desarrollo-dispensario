import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Checkbox,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  Divider
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from 'axios';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Paleta de colores para los gráficos
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#A4DE6C', '#D0ED57', '#FFA500',
  '#8DD3C7', '#FFFFB3', '#BEBADA', '#FB8072', '#80B1D3'
];

const SistemasReportPage = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSistemas, setSelectedSistemas] = useState([]);
  const [sistemasOpciones, setSistemasOpciones] = useState([]);
  const [filters, setFilters] = useState({
    fechaDesde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Últimos 30 días
    fechaHasta: new Date().toISOString().split('T')[0] // Hoy
  });
  const [mostrarGraficos, setMostrarGraficos] = useState(true);
  const tableRef = useRef(null);

  // Obtener opciones de sistemas
  useEffect(() => {
    const fetchOpciones = async () => {
      try {
        const response = await axios.get('/api/v1/sistemas/opciones');
        setSistemasOpciones(response.data);
      } catch (err) {
        console.error('Error al cargar opciones:', err);
        setError('No se pudieron cargar los sistemas disponibles');
      }
    };
    fetchOpciones();
  }, []);

  // Obtener datos con filtros
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        fechaDesde: filters.fechaDesde || undefined,
        fechaHasta: filters.fechaHasta || undefined,
        sistema: selectedSistemas.length === 1 ? selectedSistemas[0] : undefined
      };

      // Eliminar parámetros undefined
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await axios.get('/api/v1/sistemas/reporte', { params });
      setAllData(response.data.data);
      setFilteredData(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar el reporte');
      console.error('Error al obtener datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar datos localmente cuando cambia la selección múltiple
  useEffect(() => {
    if (selectedSistemas.length === 0) {
      setFilteredData(allData);
    } else if (selectedSistemas.length > 1) { // Solo filtro local si son múltiples
      const filtered = allData.filter(item => 
        selectedSistemas.includes(item.nombre_sistema)
      );
      setFilteredData(filtered);
    }
    // Si es solo 1 sistema, se hace fetch al servidor
  }, [selectedSistemas, allData]);

  // Manejador de cambio para los checkboxes
  const handleSistemasChange = (event) => {
    const { value } = event.target;
    setSelectedSistemas(value);
    
    // Si solo seleccionan 1 sistema, hacemos fetch al servidor
    if (value.length === 1) {
      fetchData();
    }
  };

  // Manejador de cambio para fechas
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Aplicar filtros (fechas)
  const applyFilters = () => {
    fetchData();
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      fechaDesde: '',
      fechaHasta: ''
    });
    setSelectedSistemas([]);
    fetchData();
  };

  // Función para preparar datos para gráficos
  const getChartData = () => {
    if (!filteredData || filteredData.length === 0) return null;

    // Ordenar datos por total de atenciones (descendente)
    const sortedData = [...filteredData].sort((a, b) => b.total_atenciones - a.total_atenciones);

    // Datos para gráfico de barras
    const barData = sortedData.map(item => ({
      name: item.nombre_sistema,
      value: item.total_atenciones || 0
    }));

    // Datos para gráfico de pastel (solo top 8 para mejor visualización)
    const pieData = sortedData.slice(0, 8).map(item => ({
      name: item.nombre_sistema,
      value: item.total_atenciones || 0
    }));

    return { barData, pieData };
  };

  const chartData = getChartData();

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(item => ({
        "Sistema": item.nombre_sistema || 'N/A',
        "Total de Atenciones": item.total_atenciones || 0,
        "Fecha Desde": filters.fechaDesde || 'Todo',
        "Fecha Hasta": filters.fechaHasta || 'Todo'
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ReporteSistemas");
    
    // Agregar hoja con datos de gráficos si existen
    if (chartData) {
      const chartSheet = XLSX.utils.json_to_sheet([
        { "Tipo de Gráfico": "Distribución por Sistema (Barras)" },
        ...chartData.barData.map(item => ({
          "Sistema": item.name,
          "Total de Atenciones": item.value
        })),
        {},
        { "Tipo de Gráfico": "Distribución por Sistema (Pastel - Top 8)" },
        ...chartData.pieData.map(item => ({
          "Sistema": item.name,
          "Total de Atenciones": item.value
        }))
      ]);
      XLSX.utils.book_append_sheet(workbook, chartSheet, "DatosGraficos");
    }
    
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Reporte_Sistemas_${fecha}.xlsx`);
  };

  // Exportar a PDF
  const exportToPDF = async () => {
    if (!tableRef.current) return;
    setLoading(true);
    try {
      // Capturar gráficos si están visibles
      let chartImages = [];
      if (mostrarGraficos && chartData) {
        const chartContainers = [
          document.getElementById('bar-chart-container'),
          document.getElementById('pie-chart-container')
        ].filter(Boolean);
        
        for (const container of chartContainers) {
          const canvas = await html2canvas(container);
          chartImages.push(canvas.toDataURL('image/png'));
        }
      }

      // Capturar tabla
      const canvasTable = await html2canvas(tableRef.current);
      const imgDataTable = canvasTable.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape');
      
      // Agregar gráficos al PDF
      for (const imgData of chartImages) {
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
        pdf.addPage();
      }
      
      // Agregar tabla al PDF
      const imgPropsTable = pdf.getImageProperties(imgDataTable);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeightTable = (imgPropsTable.height * pdfWidth) / imgPropsTable.width;
      pdf.addImage(imgDataTable, 'PNG', 10, 10, pdfWidth, pdfHeightTable);
      
      // Agregar información de filtros
      pdf.setFontSize(10);
      pdf.text(`Filtros aplicados: ${filters.fechaDesde || 'Todo'} - ${filters.fechaHasta || 'Todo'}`, 10, 10);
      
      const fecha = new Date().toISOString().slice(0, 10);
      pdf.save(`Reporte_Sistemas_${fecha}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      setError(`Error al generar PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Barra superior con color primario y botones */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 2,
          p: 3,
          mb: 4,
          boxShadow: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700, letterSpacing: 1 }}
        >
          Reporte de Sistemas por Atenciones
        </Typography>
        <ButtonGroup variant="contained" disabled={loading || filteredData.length === 0}>
          <Button 
            startIcon={<ExcelIcon />} 
            onClick={exportToExcel}
            color="success"
            sx={{ fontWeight: 700 }}
          >
            Excel
          </Button>
          <Button 
            startIcon={<PdfIcon />} 
            onClick={exportToPDF}
            color="error"
            sx={{ fontWeight: 700 }}
          >
            PDF
          </Button>
        </ButtonGroup>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="sistemas-multiple-checkbox-label">Filtrar por sistemas</InputLabel>
              <Select
                labelId="sistemas-multiple-checkbox-label"
                id="sistemas-multiple-checkbox"
                multiple
                value={selectedSistemas}
                onChange={handleSistemasChange}
                renderValue={(selected) => selected.length === 0 ? 'Todos los sistemas' : selected.join(', ')}
                inputProps={{
                  'aria-label': 'Seleccionar sistemas',
                }}
                label="Filtrar por sistemas"
              >
                {sistemasOpciones.map((sistema) => (
                  <MenuItem key={sistema} value={sistema}>
                    <Checkbox checked={selectedSistemas.indexOf(sistema) > -1} />
                    <ListItemText primary={sistema} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Fecha desde"
              type="date"
              name="fechaDesde"
              value={filters.fechaDesde}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Fecha hasta"
              type="date"
              name="fechaHasta"
              value={filters.fechaHasta}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={applyFilters}
              disabled={loading}
            >
              Aplicar Filtros
            </Button>
            <Button
              variant="outlined"
              startIcon={mostrarGraficos ? <PieChartIcon /> : <BarChartIcon />}
              onClick={() => setMostrarGraficos(!mostrarGraficos)}
            >
              {mostrarGraficos ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Gráficos estadísticos */}
      {mostrarGraficos && chartData && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Gráfico de barras */}
          <Grid item xs={12} md={8}>
            <Card id="bar-chart-container" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                Distribución de Atenciones por Sistema
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.barData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Total de atenciones']}
                      labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Total de atenciones" fill="#8884d8">
                      {chartData.barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Gráfico de pastel */}
          <Grid item xs={12} md={4}>
            <Card id="pie-chart-container" sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <PieChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                Top 8 Sistemas (Porcentaje)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Total de atenciones']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabla */}
      {loading ? (
        <CircularProgress sx={{ display: 'block', margin: '40px auto' }} size={60} />
      ) : (
        <TableContainer 
          component={Paper} 
          ref={tableRef} 
          elevation={4}
          sx={{ borderRadius: 2, mb: 6 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: 17 }}>
                  Sistema
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: 17 }} align="right">
                  Total de Atenciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <TableRow 
                    key={row.nombre_sistema}
                    sx={{
                      backgroundColor: idx % 2 === 0 ? 'grey.50' : 'white',
                      '&:hover': { backgroundColor: 'primary.50' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{row.nombre_sistema}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.total_atenciones}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: 16 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No se encontraron datos para los filtros seleccionados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default SistemasReportPage;