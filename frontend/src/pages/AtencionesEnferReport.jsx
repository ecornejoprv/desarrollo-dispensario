import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Grid, Card, CardContent,
  TextField, MenuItem, Select, FormControl,
  InputLabel, Button, Table, TableBody,
  TableCell, TableContainer, TableHead,
  TableRow, Paper, Pagination, CircularProgress,
  Alert, IconButton, Tooltip
} from '@mui/material';
import { 
  PictureAsPdf as PdfIcon, 
  GridOn as ExcelIcon,
  FilterAlt as FilterIcon,
  Refresh as RefreshIcon,
  Summarize as StatsIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { BarChart, PieChart } from '@mui/x-charts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AtencionesEnferReport = () => {
  // Estados para los datos
  const [data, setData] = useState({
    atenciones: [],
    estadisticas: [],
    medicos: [],
    actividades: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    page: 1,
    limit: 10,
    medicoId: '',
    actividadId: '',
    fechaDesde: null,
    fechaHasta: null
  });

  // Obtener datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          page: filters.page,
          limit: filters.limit,
          searchTerm: filters.searchTerm || undefined,
          medicoId: filters.medicoId || undefined,
          actividadId: filters.actividadId || undefined,
          fechaDesde: filters.fechaDesde ? format(filters.fechaDesde, 'yyyy-MM-dd') : undefined,
          fechaHasta: filters.fechaHasta ? format(filters.fechaHasta, 'yyyy-MM-dd') : undefined
        };

        // Eliminar parámetros undefined
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        const [medicosRes, actividadesRes, atencionesRes, estadisticasRes] = await Promise.all([
          axios.get('/api/v1/medicos'),
          axios.get('/api/v1/tiposactividades?tipo=POSTCONSULTA'),
          axios.get('/api/v1/atenciones', { params }),
          axios.get('/api/v1/atenciones/estadisticas', { params })
        ]);

        setData({
          medicos: medicosRes.data.data || [],
          actividades: actividadesRes.data.data || [],
          atenciones: atencionesRes.data.data || [],
          estadisticas: estadisticasRes.data.data || []
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.page, filters.limit, filters.searchTerm, filters.medicoId, filters.actividadId, filters.fechaDesde, filters.fechaHasta]);

  // Resto del código permanece igual...
  // Manejar cambios en filtros
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Resetear a primera página al cambiar filtros
    }));
  };

  // Resetear filtros
  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      page: 1,
      limit: 10,
      medicoId: '',
      actividadId: '',
      fechaDesde: null,
      fechaHasta: null
    });
  };

  // Formatear fechas
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: es });
  };

  // Exportar a Excel
  const exportToExcel = () => {
    // Implementar lógica de exportación a Excel
    console.log('Exportar a Excel', data.atenciones);
    alert('Funcionalidad de exportación a Excel en desarrollo');
  };

  // Exportar a PDF
  const exportToPDF = () => {
    // Implementar lógica de exportación a PDF
    console.log('Exportar a PDF', data.atenciones);
    alert('Funcionalidad de exportación a PDF en desarrollo');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        {/* Encabezado */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Reporte de Atenciones de Enfermería</Typography>
          <Box>
            <Tooltip title="Exportar a Excel">
              <IconButton onClick={exportToExcel} color="primary">
                <ExcelIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar a PDF">
              <IconButton onClick={exportToPDF} color="error" sx={{ ml: 1 }}>
                <PdfIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Buscar paciente o médico"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Médico</InputLabel>
                  <Select
                    value={filters.medicoId}
                    onChange={(e) => handleFilterChange('medicoId', e.target.value)}
                    label="Médico"
                  >
                    <MenuItem value="">Todos los médicos</MenuItem>
                    {data.medicos.map(medico => (
                      <MenuItem key={medico.medic_cod_medic} value={medico.medic_cod_medic}>
                        {medico.medic_nom_medic} {medico.medic_ape_medic}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Actividad</InputLabel>
                  <Select
                    value={filters.actividadId}
                    onChange={(e) => handleFilterChange('actividadId', e.target.value)}
                    label="Actividad"
                  >
                    <MenuItem value="">Todas las actividades</MenuItem>
                    {data.actividades.map(actividad => (
                      <MenuItem key={actividad.acti_cod_acti} value={actividad.acti_cod_acti}>
                        {actividad.acti_nom_acti}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha desde"
                  value={filters.fechaDesde}
                  onChange={(date) => handleFilterChange('fechaDesde', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha hasta"
                  value={filters.fechaHasta}
                  onChange={(date) => handleFilterChange('fechaHasta', date)}
                  minDate={filters.fechaDesde}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={() => window.location.reload()} // Forzar recarga con nuevos filtros
                >
                  Aplicar Filtros
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetFilters}
                >
                  Limpiar Filtros
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StatsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Atenciones</Typography>
                </Box>
                <Typography variant="h4" align="center">
                  {data.estadisticas.map(stat => stat.total_atenciones)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StatsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Pacientes Únicos</Typography>
                </Box>
                <Typography variant="h4" align="center">
                  {[...new Set(data.atenciones.map(a => a.paciente_nombre))].length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StatsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Médicos Involucrados</Typography>
                </Box>
                <Typography variant="h4" align="center">
                  {data.estadisticas.map(stat => stat.medico_nombre).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficos */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Atenciones por Médico
                </Typography>
                <Box sx={{ height: 300 }}>
                  <BarChart
                    xAxis={[{
                      scaleType: 'band',
                      data: data.estadisticas.map(stat => stat.medico_nombre),
                      label: 'Médicos'
                    }]}
                    series={[{
                      data: data.estadisticas.map(stat => stat.total_atenciones),
                      color: '#36A2EB'
                    }]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distribución por Actividad
                </Typography>
                <Box sx={{ height: 300 }}>
                  <PieChart
                    series={[{
                      data: data.estadisticas.map((stat, index) => ({
                        value: stat.total_atenciones,
                        label: stat.tipo_atencion,
                        color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index % 5]
                      })),
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    }]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de Atenciones */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detalle de Atenciones ({data.atenciones.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Paciente</TableCell>
                    <TableCell>Médico</TableCell>
                    <TableCell>Actividad</TableCell>
                    <TableCell>Especialidad</TableCell>
                    <TableCell>Sucursal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.atenciones.length > 0 ? (
                    data.atenciones
                      .slice((filters.page - 1) * filters.limit, filters.page * filters.limit)
                      .map((atencion) => (
                        <TableRow key={atencion.post_cod_post}>
                          <TableCell>{formatDate(atencion.post_fec_post)}</TableCell>
                          <TableCell>
                            {atencion.pacie_nom_pacie} {atencion.pacie_ape_pacie}
                          </TableCell>
                          <TableCell>
                            {atencion.medic_nom_medic} 
                          </TableCell>
                          <TableCell>{atencion.acti_nom_acti}</TableCell>
                          <TableCell>{atencion.especialidad}</TableCell>
                          <TableCell>{atencion.sucursal}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No se encontraron atenciones con los filtros seleccionados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            {data.atenciones.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Mostrando {(filters.page - 1) * filters.limit + 1}-
                  {Math.min(filters.page * filters.limit, data.atenciones.length)} de {data.atenciones.length} registros
                </Typography>
                <Pagination
                  count={Math.ceil(data.atenciones.length / filters.limit)}
                  page={filters.page}
                  onChange={(e, value) => handleFilterChange('page', value)}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default AtencionesEnferReport;