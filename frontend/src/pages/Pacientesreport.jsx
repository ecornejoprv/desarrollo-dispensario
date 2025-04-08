import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Grid, Card, CardContent,
  TextField, MenuItem, Select, FormControl,
  InputLabel, Button, Table, TableBody,
  TableCell, TableContainer, TableHead,
  TableRow, Paper, Pagination
} from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PacientesReport = () => {
  // Estados para los datos
  const [pacientes, setPacientes] = useState([]);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sexoFilter, setSexoFilter] = useState('');
  const [tipoSangreFilter, setTipoSangreFilter] = useState('');
  const [estadoCivilFilter, setEstadoCivilFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  
  // Estados para datos de filtros
  const [sexos, setSexos] = useState([]);
  const [tiposSangre, setTiposSangre] = useState([]);
  const [estadosCiviles, setEstadosCiviles] = useState([]);

  // Obtener datos de pacientes
  const fetchPacientes = async () => {
    try {
      setLoading(true);
      let url = `/api/v1/pacientes?page=${page}&limit=${limit}`;
      
      if (searchTerm) url += `&search=${searchTerm}`;
      if (sexoFilter) url += `&sexo=${sexoFilter}`;
      if (tipoSangreFilter) url += `&tipoSangre=${tipoSangreFilter}`;
      if (estadoCivilFilter) url += `&estadoCivil=${estadoCivilFilter}`;
      if (fechaDesde) url += `&fechaDesde=${fechaDesde.toISOString()}`;
      if (fechaHasta) url += `&fechaHasta=${fechaHasta.toISOString()}`;
      
      const response = await axios.get(url);
      setPacientes(response.data.pacientes);
      setTotalPacientes(response.data.total);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Obtener datos para filtros
  const fetchFilterData = async () => {
    try {
      const [sexosRes, tiposSangreRes, estadosCivilesRes] = await Promise.all([
        axios.get('/api/v1/sexos'),
        axios.get('/api/v1/tipos-sangre'),
        axios.get('/api/v1/estados-civiles')
      ]);
      
      setSexos(sexosRes.data);
      setTiposSangre(tiposSangreRes.data);
      setEstadosCiviles(estadosCivilesRes.data);
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  };

  useEffect(() => {
    fetchPacientes();
    fetchFilterData();
  }, [page, limit, searchTerm, sexoFilter, tipoSangreFilter, estadoCivilFilter, fechaDesde, fechaHasta]);

  // Datos para gráficos
  const getGeneroDistribution = () => {
    const distribution = {};
    sexos.forEach(sexo => {
      distribution[sexo.sexo_nom_sexo] = 0;
    });
    
    pacientes.forEach(paciente => {
      const sexo = sexos.find(s => s.sexo_cod_sexo === paciente.pacie_cod_sexo);
      if (sexo) {
        distribution[sexo.sexo_nom_sexo]++;
      }
    });
    
    return {
      labels: Object.keys(distribution),
      data: Object.values(distribution),
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    };
  };

  const getTipoSangreDistribution = () => {
    const distribution = {};
    tiposSangre.forEach(tipo => {
      distribution[tipo.tisan_nom_tisa] = 0;
    });
    
    pacientes.forEach(paciente => {
      const tipo = tiposSangre.find(t => t.tisan_cod_tisa === paciente.pacie_cod_sangr);
      if (tipo) {
        distribution[tipo.tisan_nom_tisa]++;
      }
    });
    
    return {
      labels: Object.keys(distribution),
      data: Object.values(distribution),
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    };
  };

  const generoData = getGeneroDistribution();
  const tipoSangreData = getTipoSangreDistribution();

  // Manejar cambio de página
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm('');
    setSexoFilter('');
    setTipoSangreFilter('');
    setEstadoCivilFilter('');
    setFechaDesde(null);
    setFechaHasta(null);
    setPage(1);
  };

  if (loading) return <Typography>Cargando datos...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Pacientes
      </Typography>
      
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
                label="Buscar por nombre o cédula"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sexo</InputLabel>
                <Select
                  value={sexoFilter}
                  onChange={(e) => setSexoFilter(e.target.value)}
                  label="Sexo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {sexos.map((sexo) => (
                    <MenuItem key={sexo.sexo_cod_sexo} value={sexo.sexo_cod_sexo}>
                      {sexo.sexo_nom_sexo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Sangre</InputLabel>
                <Select
                  value={tipoSangreFilter}
                  onChange={(e) => setTipoSangreFilter(e.target.value)}
                  label="Tipo de Sangre"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {tiposSangre.map((tipo) => (
                    <MenuItem key={tipo.tisan_cod_tisa} value={tipo.tisan_cod_tisa}>
                      {tipo.tisan_nom_tisa}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Estado Civil</InputLabel>
                <Select
                  value={estadoCivilFilter}
                  onChange={(e) => setEstadoCivilFilter(e.target.value)}
                  label="Estado Civil"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {estadosCiviles.map((estado) => (
                    <MenuItem key={estado.estci_cod_estc} value={estado.estci_cod_estc}>
                      {estado.estci_nom_estc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                selected={fechaDesde}
                onChange={(date) => setFechaDesde(date)}
                selectsStart
                startDate={fechaDesde}
                endDate={fechaHasta}
                placeholderText="Fecha desde"
                className="date-picker"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                selected={fechaHasta}
                onChange={(date) => setFechaHasta(date)}
                selectsEnd
                startDate={fechaDesde}
                endDate={fechaHasta}
                minDate={fechaDesde}
                placeholderText="Fecha hasta"
                className="date-picker"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={resetFilters} sx={{ mr: 2 }}>
                Limpiar Filtros
              </Button>
              <Button variant="outlined" onClick={fetchPacientes}>
                Aplicar Filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Resumen */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Pacientes
              </Typography>
              <Typography variant="h4">{totalPacientes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hombres
              </Typography>
              <Typography variant="h4">
                {generoData.data[0] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Mujeres
              </Typography>
              <Typography variant="h4">
                {generoData.data[1] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Promedio Edad
              </Typography>
              <Typography variant="h4">
                {pacientes.length > 0 
                  ? Math.round(pacientes.reduce((sum, p) => {
                      const birthDate = new Date(p.pacie_fec_nac);
                      const age = new Date().getFullYear() - birthDate.getFullYear();
                      return sum + age;
                    }, 0) / pacientes.length)
                  : 0} años
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
                Distribución por Género
              </Typography>
              <Box sx={{ height: 300 }}>
                <PieChart
                  series={[
                    {
                      data: generoData.labels.map((label, index) => ({
                        value: generoData.data[index],
                        label,
                        color: generoData.colors[index % generoData.colors.length]
                      })),
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Tipo de Sangre
              </Typography>
              <Box sx={{ height: 300 }}>
                <BarChart
                  xAxis={[
                    {
                      scaleType: 'band',
                      data: tipoSangreData.labels,
                    },
                  ]}
                  series={[
                    {
                      data: tipoSangreData.data,
                      color: '#36A2EB'
                    },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabla de Pacientes */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lista de Pacientes
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cédula</TableCell>
                  <TableCell>Nombre Completo</TableCell>
                  <TableCell>Sexo</TableCell>
                  <TableCell>Edad</TableCell>
                  <TableCell>Tipo Sangre</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pacientes.map((paciente) => {
                  const birthDate = new Date(paciente.pacie_fec_nac);
                  const age = new Date().getFullYear() - birthDate.getFullYear();
                  const sexo = sexos.find(s => s.sexo_cod_sexo === paciente.pacie_cod_sexo)?.sexo_nom_sexo || '';
                  const tipoSangre = tiposSangre.find(t => t.tisan_cod_tisa === paciente.pacie_cod_sangr)?.tisan_nom_tisa || '';
                  
                  return (
                    <TableRow key={paciente.pacie_cod_pacie}>
                      <TableCell>{paciente.pacie_ced_pacie}</TableCell>
                      <TableCell>{`${paciente.pacie_nom_pacie} ${paciente.pacie_ape_pacie}`}</TableCell>
                      <TableCell>{sexo}</TableCell>
                      <TableCell>{age}</TableCell>
                      <TableCell>{tipoSangre}</TableCell>
                      <TableCell>{paciente.pacie_tel_pacie}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            p: 0.5,
                            borderRadius: 1,
                            bgcolor: paciente.pacie_est_pacie === 'A' ? 'success.light' : 'error.light',
                            color: paciente.pacie_est_pacie === 'A' ? 'success.contrastText' : 'error.contrastText'
                          }}
                        >
                          {paciente.pacie_est_pacie === 'A' ? 'Activo' : 'Inactivo'}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Paginación */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(totalPacientes / limit)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PacientesReport;