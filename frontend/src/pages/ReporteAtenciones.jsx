import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Box,
  IconButton,
  ListSubheader,
  Chip
} from '@mui/material';
import { Search, ArrowBack, ArrowForward } from '@mui/icons-material';
import api from '../api';
import styles from './styles/reporteAtenciones.module.css';

const ReporteAtenciones = () => {
  // Estados para el reporte
  const [atenciones, setAtenciones] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [medicos, setMedicos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [limit] = useState(10);

  // Obtener lista de médicos al cargar el componente
  useEffect(() => {
    const cargarMedicos = async () => {
      setLoadingMedicos(true);
      try {
        const response = await api.get('/api/v1/medicos');
        // Extraer el array data de la respuesta
        setMedicos(response.data.data || []); // Añade .data aquí
      } catch (error) {
        console.error('Error al cargar médicos:', error);
        setMedicos([]);
      } finally {
        setLoadingMedicos(false);
      }
    };
    
    cargarMedicos();
  }, []);

  // Obtener atenciones cuando cambian los filtros o la página
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      obtenerAtenciones();
    }
  }, [fechaInicio, fechaFin, medicoId, page]);

  // Función para obtener las atenciones
  const obtenerAtenciones = async () => {
    setLoading(true);
    
    try {
      const params = {
        fechaInicio,
        fechaFin,
        page,
        limit
      };
      
      if (medicoId) {
        params.medicoId = medicoId;
      }
      
      const response = await api.get('/api/v1/atenciones/reporte-atenciones', { params });
      
      setAtenciones(response.data.atenciones || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error al obtener atenciones:', error);
      setAtenciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar página
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPages) {
      setPage(nuevaPagina);
    }
  };

  // Formatear fecha
  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Agrupar médicos por especialidad para el select
  const medicosAgrupados = Array.isArray(medicos) 
    ? medicos.reduce((acc, medico) => {
        const especialidad = medico.espe_nom_espe || 'Sin especialidad';
        if (!acc[especialidad]) {
          acc[especialidad] = [];
        }
        acc[especialidad].push(medico);
        return acc;
      }, {})
    : {};

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Typography variant="h4" gutterBottom className={styles.title}>
        Reporte de Atenciones Médicas
      </Typography>
      
      {/* Filtros */}
      <Paper elevation={3} className={styles.filterContainer}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="flex-end">
          <TextField
            label="Fecha Inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
            fullWidth
            variant="outlined"
            size="small"
          />
          
          <TextField
            label="Fecha Fin"
            type="date"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value);
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
            fullWidth
            variant="outlined"
            size="small"
          />
          
          <FormControl fullWidth size="small">
            <InputLabel>Médico</InputLabel>
            <Select
              value={medicoId}
              onChange={(e) => {
                setMedicoId(e.target.value);
                setPage(1);
              }}
              label="Médico"
              disabled={loadingMedicos}
            >
              <MenuItem value="">
                <em>Todos los médicos</em>
              </MenuItem>
              
              {Object.entries(medicosAgrupados).map(([especialidad, medicosGrupo]) => [
                <ListSubheader key={especialidad}>
                  {especialidad}
                </ListSubheader>,
                ...medicosGrupo.map((medico) => (
                  <MenuItem 
                    key={medico.medic_cod_medic} 
                    value={medico.medic_cod_medic}
                  >
                    {medico.medic_nom_medic} 
                    {medico.medic_ced_medic && ` (${medico.medic_ced_medic})`}
                  </MenuItem>
                ))
              ])}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            onClick={obtenerAtenciones}
            disabled={loading || !fechaInicio || !fechaFin}
            startIcon={loading ? <CircularProgress size={20} /> : <Search />}
            size="large"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </Box>
      </Paper>
      
      {/* Resultados */}
      <TableContainer component={Paper} className={styles.tableContainer} elevation={3}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width="120px">Fecha</TableCell>
              <TableCell width="100px">Hora</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell width="120px">Cédula</TableCell>
              <TableCell>Médico</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell width="120px">Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                  <Typography variant="body2" mt={1}>Cargando atenciones...</Typography>
                </TableCell>
              </TableRow>
            ) : atenciones.length > 0 ? (
              atenciones.map((aten) => (
                <TableRow 
                  key={aten.aten_cod_aten}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{formatFecha(aten.aten_fec_aten)}</TableCell>
                  <TableCell>{aten.aten_hor_aten?.substring(0, 5)}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {aten.pacie_nom_pacie} {aten.pacie_ape_pacie}
                    </Typography>
                  </TableCell>
                  <TableCell>{aten.pacie_ced_pacie}</TableCell>
                  <TableCell>{aten.medic_nom_medic}</TableCell>
                  <TableCell>{aten.espe_nom_espe || 'N/A'}</TableCell>
                  <TableCell className={styles.motivoCell}>
                    {aten.aten_mot_cons || 'Sin motivo registrado'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={aten.aten_tip_aten} 
                      size="small"
                      color={
                        aten.aten_tip_aten === 'Primera' ? 'primary' : 'default'
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {fechaInicio && fechaFin 
                      ? 'No se encontraron atenciones con los filtros seleccionados'
                      : 'Seleccione un rango de fechas para buscar atenciones'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Paginación */}
      {atenciones.length > 0 && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          mt={2}
          mb={4}
        >
          <IconButton 
            onClick={() => cambiarPagina(page - 1)} 
            disabled={page <= 1 || loading}
            size="large"
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="body1" mx={2}>
            Página {page} de {totalPages}
          </Typography>
          
          <IconButton 
            onClick={() => cambiarPagina(page + 1)} 
            disabled={page >= totalPages || loading}
            size="large"
          >
            <ArrowForward />
          </IconButton>
        </Box>
      )}
    </Container>
  );
};

export default ReporteAtenciones;