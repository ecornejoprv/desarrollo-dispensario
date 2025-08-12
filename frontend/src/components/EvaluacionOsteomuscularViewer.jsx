import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import api from '../api';

const LabelTypography = ({ children }) => (
    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary', whiteSpace: 'nowrap', mr: 1 }}>
        {children}:
    </Typography>
);

const ValueTypography = ({ children }) => (
    <Typography variant="body2">{children || '-'}</Typography>
);

export const EvaluacionOsteomuscularViewer = ({ pacienteId }) => {
    const [versiones, setVersiones] = useState([]);
    const [selectedVersionId, setSelectedVersionId] = useState('');
    const [evaluacion, setEvaluacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVersiones = async () => {
            if (!pacienteId) {
                setVersiones([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/api/v1/evaluacion-osteomuscular/paciente/${pacienteId}/versiones`);
                setVersiones(response.data);
                const versionActiva = response.data.find(v => v.evalost_es_activo);
                if (versionActiva) {
                    setSelectedVersionId(versionActiva.evalost_cod_evalost);
                } else if (response.data.length > 0) {
                    setSelectedVersionId(response.data[0].evalost_cod_evalost);
                } else {
                    // Si no hay versiones, deja de cargar.
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error al cargar versiones de evaluación:", err);
                setError("No se pudieron cargar las evaluaciones.");
                setLoading(false);
            }
        };

        fetchVersiones();
    }, [pacienteId]);

    useEffect(() => {
        const fetchDetalles = async () => {
            if (!selectedVersionId) {
                // Si no hay versión seleccionada, no hay nada que buscar.
                setEvaluacion(null);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/api/v1/evaluacion-osteomuscular/${selectedVersionId}`);
                setEvaluacion(response.data);
            } catch (err) {
                console.error("Error al cargar detalles de la evaluación:", err);
                setError("No se pudieron cargar los detalles de la evaluación seleccionada.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetalles();
    }, [selectedVersionId]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
    }
    
    // --> ESTA ES LA LÓGICA QUE MUESTRA EL MENSAJE ANTES QUE EL SELECTOR
    if (versiones.length === 0) {
        return <Typography sx={{ p: 3 }}>No existen registros de evaluación osteomuscular para este paciente.</Typography>;
    }

    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <FormControl size="small" sx={{ mb: 2, minWidth: 250 }}>
                <InputLabel>Versión de Evaluación</InputLabel>
                <Select
                    value={selectedVersionId}
                    label="Versión de Evaluación"
                    onChange={(e) => setSelectedVersionId(e.target.value)}
                >
                    {versiones.map(v => (
                        <MenuItem key={v.evalost_cod_evalost} value={v.evalost_cod_evalost}>
                            {new Date(v.evalost_fec_eval).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}
                            {v.evalost_es_activo && <Typography component="span" variant="caption" sx={{ ml: 1, color: 'success.main', fontWeight: 'bold' }}> (Activa)</Typography>}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {!evaluacion && !loading && (
                <Typography sx={{ p: 3 }}>Seleccione una versión para ver los detalles.</Typography>
            )}

            {evaluacion && (
                <Box>
                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>ANAMNESIS</Typography>
                    <Box sx={{ border: '1px solid #e0e0e0', p: 1.5, borderRadius: 1, mb: 2 }}>
                        <Typography variant="body2"><b>Antecedentes Patológicos:</b> {evaluacion.evalost_ant_patologicos || 'N/A'}</Typography>
                        <Typography variant="body2"><b>Sintomatología Actual:</b> {evaluacion.evalost_sintomatologia_actual || 'N/A'}</Typography>
                    </Box>

                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>EXAMEN FÍSICO</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Zona</b></TableCell>
                                    <TableCell align="center"><b>Asimetría</b></TableCell>
                                    <TableCell align="center"><b>Dolor</b></TableCell>
                                    <TableCell><b>Tipo Dolor</b></TableCell>
                                    <TableCell align="center"><b>Hormigueo</b></TableCell>
                                    <TableCell align="center"><b>Irradiación</b></TableCell>
                                    <TableCell><b>Frecuencia</b></TableCell>
                                    <TableCell><b>Pruebas Func.</b></TableCell>
                                    <TableCell align="center"><b>E. Daniels</b></TableCell>
                                    <TableCell><b>Observación</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {evaluacion.detalles?.map(d => (
                                    <TableRow key={d.det_evalost_cod_det || d.det_evalost_zona}>
                                        <TableCell>{d.det_evalost_zona}</TableCell>
                                        <TableCell align="center">{d.det_evalost_asimetria ? 'Sí' : 'No'}</TableCell>
                                        <TableCell align="center">{d.det_evalost_dolor_escala}</TableCell>
                                        <TableCell>{d.det_evalost_tipo_dolor}</TableCell>
                                        <TableCell align="center">{d.det_evalost_hormigueo ? 'Sí' : 'No'}</TableCell>
                                        <TableCell align="center">{d.det_evalost_irradiacion ? 'Sí' : 'No'}</TableCell>
                                        <TableCell>{d.det_evalost_frecuencia}</TableCell>
                                        <TableCell>{d.det_evalost_pruebas_funcionales}</TableCell>
                                        <TableCell align="center">{d.det_evalost_escala_daniels}</TableCell>
                                        <TableCell>{d.det_evalost_obs_zona}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}><Box sx={{ display: 'flex' }}><LabelTypography>Lado Dominante</LabelTypography><ValueTypography>{evaluacion.evalost_lado_dominante}</ValueTypography></Box></Grid>
                        <Grid item xs={12} md={6}><Box sx={{ display: 'flex' }}><LabelTypography>Dispone de Lavadora</LabelTypography><ValueTypography>{evaluacion.evalost_tiene_lavadora === null ? 'No aplica' : (evaluacion.evalost_tiene_lavadora ? 'Sí' : 'No')}</ValueTypography></Box></Grid>
                        <Grid item xs={12} md={6}><Box sx={{ display: 'flex' }}><LabelTypography>Conoce Riesgo Malas Posturas</LabelTypography><ValueTypography>{evaluacion.evalost_conoce_malas_posturas}</ValueTypography></Box></Grid>
                        <Grid item xs={12} md={6}><Box sx={{ display: 'flex' }}><LabelTypography>Conoce Manipulación de Carga</LabelTypography><ValueTypography>{evaluacion.evalost_conoce_manip_carga}</ValueTypography></Box></Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontSize: '1rem' }}>VALORACIÓN NUTRICIONAL</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3} md={2}><Box sx={{ display: 'flex' }}><LabelTypography>Talla</LabelTypography><ValueTypography>{evaluacion.evalost_talla_nutri}</ValueTypography></Box></Grid>
                        <Grid item xs={6} sm={3} md={2}><Box sx={{ display: 'flex' }}><LabelTypography>Peso</LabelTypography><ValueTypography>{evaluacion.evalost_peso_nutri}</ValueTypography></Box></Grid>
                        <Grid item xs={6} sm={3} md={2}><Box sx={{ display: 'flex' }}><LabelTypography>IMC</LabelTypography><ValueTypography>{evaluacion.evalost_imc_nutri}</ValueTypography></Box></Grid>
                        <Grid item xs={6} sm={3} md={2}><Box sx={{ display: 'flex' }}><LabelTypography>Grasa Corp.</LabelTypography><ValueTypography>{evaluacion.evalost_grasa_corporal_nutri}</ValueTypography></Box></Grid>
                        <Grid item xs={6} sm={3} md={2}><Box sx={{ display: 'flex' }}><LabelTypography>Músculo</LabelTypography><ValueTypography>{evaluacion.evalost_musculo_nutri}</ValueTypography></Box></Grid>
                        <Grid item xs={6} sm={3} md={2}><Box sx={{ display: 'flex' }}><LabelTypography>Edad Corp.</LabelTypography><ValueTypography>{evaluacion.evalost_edad_corporal_nutri}</ValueTypography></Box></Grid>
                        <Grid item xs={6} sm={3} md={2}><Box sx={{ display: 'flex' }}><LabelTypography>Grasa Visc.</LabelTypography><ValueTypography>{evaluacion.evalost_grasa_visceral_nutri}</ValueTypography></Box></Grid>
                    </Grid>
                </Box>
            )}
        </Paper>
    );
};

export default EvaluacionOsteomuscularViewer;