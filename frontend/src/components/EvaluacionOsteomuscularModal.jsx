import React, { useEffect, useReducer, useCallback, useState } from 'react';
import {
    Modal, Box, Typography, IconButton, Button, Grid, CircularProgress,
    TextField, FormControl, InputLabel, Select, MenuItem, Checkbox,
    RadioGroup, FormControlLabel, Radio, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, FormLabel, Snackbar, Alert,
    styled
} from '@mui/material';
import { Close, Add, Print } from '@mui/icons-material';
import api from '../api';
import { FormatoEvaluacionOsteomuscular } from './FormatoEvaluacionOsteomuscular';

// --- Estilos personalizados ---
const LabelTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
}));

// --- Estado Inicial y Reducer ---
const ZONAS_EVALUACION = [
    'Cuello', 'Hombros', 'Codos', 'Muñecas', 'Dedos',
    'Columna dorsal', 'Columna lumbar', 'Miembros inferiores'
];

const initialState = {
    loading: true,
    isSaving: false,
    evaluacionLista: [],
    selectedEvaluacionId: null,
    formData: null,
    empleadoData: null,
    snackbar: { open: false, message: '', severity: 'info' },
};

function reducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true };
        case 'FETCH_LIST_SUCCESS':
            const activo = action.payload.lista.find(o => o.evalost_es_activo);
            const activoId = activo ? activo.evalost_cod_evalost : (action.payload.lista[0]?.evalost_cod_evalost || null);
            return {
                ...state,
                loading: activoId ? state.loading : false,
                evaluacionLista: action.payload.lista,
                selectedEvaluacionId: activoId
            };
        case 'FETCH_DETAILS_SUCCESS':
            return { ...state, loading: false, formData: action.payload };
        case 'FETCH_EMPLEADO_SUCCESS':
            return { ...state, empleadoData: action.payload };
        case 'FETCH_ERROR':
            return { ...state, loading: false, snackbar: { open: true, message: action.payload, severity: 'error' } };
        case 'SET_SELECTED_ID':
            return { ...state, selectedEvaluacionId: action.payload, formData: null };
        case 'FORM_DATA_CHANGE':
            return {
                ...state,
                formData: { ...state.formData, ...action.payload }
            };
        case 'DETAIL_CHANGE': {
            const { zona, field, value } = action.payload;
            const newDetalles = state.formData.detalles.map(d =>
                d.det_evalost_zona === zona ? { ...d, [field]: value } : d
            );
            return { ...state, formData: { ...state.formData, detalles: newDetalles }};
        }
        case 'SAVING_START':
            return { ...state, isSaving: true };
        case 'SAVING_COMPLETE':
            const newFormData = action.payload ? action.payload : state.formData;
            return { ...state, isSaving: false, formData: newFormData };
        case 'SHOW_SNACKBAR':
            return { ...state, snackbar: { open: true, ...action.payload } };
        case 'HIDE_SNACKBAR':
            return { ...state, snackbar: { ...state.snackbar, open: false } };
        default:
            return state;
    }
}

// --- SUB-COMPONENTES MEMOIZADOS PARA OPTIMIZACIÓN DE RENDIMIENTO ---

const DatosGenerales = React.memo(({ evaluacion, paciente, empleado }) => (
    <Grid container spacing={1}>
        <Grid item xs={12}><Typography variant="h6">Datos Generales</Typography></Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}><LabelTypography>Fecha:</LabelTypography><Typography>{new Date(evaluacion.evalost_fec_eval).toLocaleDateString('es-EC')}</Typography></Grid>
        <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}><LabelTypography>Nombres:</LabelTypography><Typography>{`${paciente?.pacie_nom_pacie || ''} ${paciente?.pacie_ape_pacie || ''}`}</Typography></Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}><LabelTypography>N° de Cédula:</LabelTypography><Typography>{paciente?.pacie_ced_pacie || ''}</Typography></Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}><LabelTypography>Edad:</LabelTypography><Typography>{paciente?.pacie_fec_nac ? `${new Date().getFullYear() - new Date(paciente.pacie_fec_nac).getFullYear()} años` : ''}</Typography></Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}><LabelTypography>Fecha de Nacimiento:</LabelTypography><Typography>{paciente?.pacie_fec_nac ? new Date(paciente.pacie_fec_nac).toLocaleDateString('es-EC') : ''}</Typography></Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}><LabelTypography>Fecha de Ingreso:</LabelTypography><Typography>{empleado?.fechaIngreso ? new Date(empleado.fechaIngreso).toLocaleDateString('es-EC') : 'N/A'}</Typography></Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}><LabelTypography>Área:</LabelTypography><Typography>{empleado?.departamento || 'N/A'}</Typography></Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}><LabelTypography>Puesto de Trabajo:</LabelTypography><Typography>{empleado?.cargo || 'N/A'}</Typography></Grid>
    </Grid>
));

const Anamnesis = React.memo(({ antecedentes, sintomatologia, onInputChange, isReadOnly }) => (
    <Grid container spacing={2}>
        <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="h6">Anamnesis</Typography></Grid>
        <Grid item xs={12} md={6}><TextField name="evalost_ant_patologicos" label="Antecedentes patológicos personales (musculares)" value={antecedentes || ''} onChange={onInputChange} fullWidth multiline minRows={1} maxRows={4} disabled={isReadOnly} /></Grid>
        <Grid item xs={12} md={6}><TextField name="evalost_sintomatologia_actual" label="Sintomatología actual" value={sintomatologia || ''} onChange={onInputChange} fullWidth multiline minRows={1} maxRows={4} disabled={isReadOnly} /></Grid>
    </Grid>
));

const ExamenFisico = React.memo(({ detalles, onDetailChange, isReadOnly }) => (
    <Grid container spacing={2}>
        <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="h6">Examen Físico</Typography></Grid>
        <Grid item xs={12}>
            <TableContainer component={Paper}>
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Zonas</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '7%' }}>Asimetrías</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '8%' }}>Dolor /<br />Escala</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>Tipo de Dolor</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '7%' }}>Hormigueo</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '7%' }}>Irradiación</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>Frecuencia</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Pruebas<br />Funcionales</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '8%' }}>Escala<br />Daniels</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '18%' }}>Observación</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {detalles.map((d) => (
                            <TableRow key={d.det_evalost_zona}>
                                <TableCell component="th" scope="row">{d.det_evalost_zona}</TableCell>
                                <TableCell align="center"><Checkbox checked={d.det_evalost_asimetria || false} onChange={e => onDetailChange(d.det_evalost_zona, 'det_evalost_asimetria', e)} disabled={isReadOnly} /></TableCell>
                                <TableCell align="center"><FormControl fullWidth size="small" variant="outlined" disabled={isReadOnly}><Select value={d.det_evalost_dolor_escala ?? 0} onChange={e => onDetailChange(d.det_evalost_zona, 'det_evalost_dolor_escala', e)}>{[...Array(11).keys()].map(num => (<MenuItem key={num} value={num}>{num}</MenuItem>))}</Select></FormControl></TableCell>
                                <TableCell align="center"><TextField value={d.det_evalost_tipo_dolor || ''} onChange={e => onDetailChange(d.det_evalost_zona, 'det_evalost_tipo_dolor', e)} fullWidth size="small" disabled={isReadOnly} /></TableCell>
                                <TableCell align="center"><Checkbox checked={d.det_evalost_hormigueo || false} onChange={e => onDetailChange(d.det_evalost_zona, 'det_evalost_hormigueo', e)} disabled={isReadOnly} /></TableCell>
                                <TableCell align="center"><Checkbox checked={d.det_evalost_irradiacion || false} onChange={e => onDetailChange(d.det_evalost_zona, 'det_evalost_irradiacion', e)} disabled={isReadOnly} /></TableCell>
                                <TableCell align="center"><TextField value={d.det_evalost_frecuencia || ''} onChange={e => onDetailChange(d.det_evalost_zona, 'det_evalost_frecuencia', e)} fullWidth size="small" disabled={isReadOnly} /></TableCell>
                                <TableCell align="center"><TextField value={d.det_evalost_pruebas_funcionales || ''} onChange={e => onDetailChange(d.det_evalost_zona, 'det_evalost_pruebas_funcionales', e)} fullWidth multiline minRows={1} size="small" disabled={isReadOnly} /></TableCell>
                                <TableCell align="center"><FormControl fullWidth size="small" variant="outlined" disabled={isReadOnly}><Select value={d.det_evalost_escala_daniels ?? 0} onChange={e => onDetailChange(d.det_evalost_zona, 'det_evalost_escala_daniels', e)}>{[...Array(6).keys()].map(num => (<MenuItem key={num} value={num}>{num}</MenuItem>))}</Select></FormControl></TableCell>
                                <TableCell align="center"><TextField name="det_evalost_obs_zona" value={d.det_evalost_obs_zona || ''} onChange={e => onDetailChange(d.det_evalost_zona, 'det_evalost_obs_zona', e)} fullWidth multiline minRows={1} size="small" disabled={isReadOnly} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    </Grid>
));

const PreguntasAdicionales = React.memo(({ formData, onInputChange, onRadioDeselect, onBooleanRadioDeselect, isReadOnly, getBooleanRadioValue }) => (
    <Grid container spacing={2}>
        <Grid item xs={12} md={6} sx={{ mt: 2 }}>
            <FormControl component="fieldset">
                <FormLabel>¿Cuál es su lado dominante?</FormLabel>
                <RadioGroup row name="evalost_lado_dominante" value={formData.evalost_lado_dominante || ''} onChange={onInputChange}>
                    <FormControlLabel value="Izquierdo" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="Izquierdo" />
                    <FormControlLabel value="Derecho" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="Derecho" />
                    <FormControlLabel value="Ambos" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="Ambos" />
                </RadioGroup>
            </FormControl>
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 2 }}>
            <FormControl component="fieldset">
                <FormLabel>¿Dispone de lavadora?</FormLabel>
                <RadioGroup row name="evalost_tiene_lavadora" value={getBooleanRadioValue(formData.evalost_tiene_lavadora)} onChange={onInputChange}>
                    <FormControlLabel value="true" control={<Radio onMouseDown={onBooleanRadioDeselect} disabled={isReadOnly} />} label="Si" />
                    <FormControlLabel value="false" control={<Radio onMouseDown={onBooleanRadioDeselect} disabled={isReadOnly} />} label="No" />
                    <FormControlLabel value="null" control={<Radio onMouseDown={onBooleanRadioDeselect} disabled={isReadOnly} />} label="No aplica" />
                </RadioGroup>
            </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
                <FormLabel>¿Conocimiento del riesgo de malas posturas?</FormLabel>
                <RadioGroup row name="evalost_conoce_malas_posturas" value={formData.evalost_conoce_malas_posturas || ''} onChange={onInputChange}>
                    <FormControlLabel value="Si" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="Si" />
                    <FormControlLabel value="No" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="No" />
                    <FormControlLabel value="Parcial" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="Parcial" />
                    <FormControlLabel value="No aplica" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="No aplica" />
                </RadioGroup>
            </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
                <FormLabel>¿Conocimiento de Manipulación Manual de Carga?</FormLabel>
                <RadioGroup row name="evalost_conoce_manip_carga" value={formData.evalost_conoce_manip_carga || ''} onChange={onInputChange}>
                    <FormControlLabel value="Si" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="Si" />
                    <FormControlLabel value="No" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="No" />
                    <FormControlLabel value="Parcial" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="Parcial" />
                    <FormControlLabel value="No aplica" control={<Radio onMouseDown={onRadioDeselect} disabled={isReadOnly} />} label="No aplica" />
                </RadioGroup>
            </FormControl>
        </Grid>
    </Grid>
));

const ValoracionNutricional = React.memo(({ formData, onInputChange, isReadOnly }) => (
    <Grid container spacing={2}>
        <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="h6">Registro de Valoración Nutricional</Typography></Grid>
        <Grid item xs={6} sm={4} md={1.7}><TextField name="evalost_talla_nutri" label="Talla (m)" type="number" value={formData.evalost_talla_nutri || ''} onChange={onInputChange} fullWidth size="small" disabled={isReadOnly}/></Grid>
        <Grid item xs={6} sm={4} md={1.7}><TextField name="evalost_peso_nutri" label="Peso (kg)" type="number" value={formData.evalost_peso_nutri || ''} onChange={onInputChange} fullWidth size="small" disabled={isReadOnly}/></Grid>
        <Grid item xs={6} sm={4} md={1.7}><TextField name="evalost_imc_nutri" label="IMC" type="text" value={formData.evalost_imc_nutri || ''} onChange={onInputChange} fullWidth size="small" disabled={isReadOnly}/></Grid>
        <Grid item xs={6} sm={4} md={1.7}><TextField name="evalost_grasa_corporal_nutri" label="Grasa Corp. (%)" type="text" value={formData.evalost_grasa_corporal_nutri || ''} onChange={onInputChange} fullWidth size="small" disabled={isReadOnly}/></Grid>
        <Grid item xs={6} sm={4} md={1.7}><TextField name="evalost_musculo_nutri" label="Músculo (%)" type="text" value={formData.evalost_musculo_nutri || ''} onChange={onInputChange} fullWidth size="small" disabled={isReadOnly}/></Grid>
        <Grid item xs={6} sm={4} md={1.7}><TextField name="evalost_edad_corporal_nutri" label="Edad Corporal" type="number" value={formData.evalost_edad_corporal_nutri || ''} onChange={onInputChange} fullWidth size="small" disabled={isReadOnly}/></Grid>
        <Grid item xs={6} sm={4} md={1.7}><TextField name="evalost_grasa_visceral_nutri" label="Grasa Visceral" type="text" value={formData.evalost_grasa_visceral_nutri || ''} onChange={onInputChange} fullWidth size="small" disabled={isReadOnly}/></Grid>
    </Grid>
));


// --- COMPONENTE PRINCIPAL ---
export const EvaluacionOsteomuscularModal = ({ open, onClose, pacienteId, pacienteData }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [imprimiendo, setImprimiendo] = useState(false);

    const inicializarDetalles = useCallback(() => {
        return ZONAS_EVALUACION.map(zona => ({
            det_evalost_zona: zona, det_evalost_asimetria: false, det_evalost_dolor_escala: 0,
            det_evalost_tipo_dolor: '', det_evalost_hormigueo: false, det_evalost_irradiacion: false,
            det_evalost_frecuencia: '', det_evalost_pruebas_funcionales: '', det_evalost_escala_daniels: 0,
            det_evalost_obs_zona: '',
        }));
    }, []);

    const fetchEmpleadoData = useCallback(async () => {
        if (!pacienteData?.pacie_ced_pacie || !pacienteData?.pacie_cod_empr) return;
        try {
            const response = await api.get(`/api/v1/empleados/${pacienteData.pacie_ced_pacie}/empresa/${pacienteData.pacie_cod_empr}`);
            dispatch({ type: 'FETCH_EMPLEADO_SUCCESS', payload: response.data });
        } catch (error) {
            console.error("No se encontraron datos laborales del paciente:", error);
            dispatch({ type: 'FETCH_EMPLEADO_SUCCESS', payload: null });
        }
    }, [pacienteData]);

    const fetchVersiones = useCallback(async () => {
        if (!pacienteId) return;
        dispatch({ type: 'FETCH_START' });
        try {
            const response = await api.get(`/api/v1/evaluacion-osteomuscular/paciente/${pacienteId}/versiones`);
            dispatch({ type: 'FETCH_LIST_SUCCESS', payload: { lista: response.data } });
        } catch (err) {
            dispatch({ type: 'FETCH_ERROR', payload: err.response?.data?.message || "Error al cargar versiones." });
        }
    }, [pacienteId]);

    useEffect(() => {
        if (open) {
            fetchVersiones();
            fetchEmpleadoData();
        }
    }, [open, fetchVersiones, fetchEmpleadoData]);

    useEffect(() => {
        const fetchDetalles = async () => {
            if (!state.selectedEvaluacionId) {
                if(!state.loading && state.evaluacionLista.length === 0){
                    dispatch({ type: 'FETCH_DETAILS_SUCCESS', payload: { detalles: inicializarDetalles() } });
                }
                return;
            };
            dispatch({ type: 'FETCH_START' });
            try {
                const response = await api.get(`/api/v1/evaluacion-osteomuscular/${state.selectedEvaluacionId}`);
                const detallesGuardados = new Map(response.data.detalles.map(d => [d.det_evalost_zona, d]));
                const detallesCompletos = inicializarDetalles().map(detalleBase =>
                    detallesGuardados.has(detalleBase.det_evalost_zona)
                        ? { ...detalleBase, ...detallesGuardados.get(detalleBase.det_evalost_zona) }
                        : detalleBase
                );
                dispatch({ type: 'FETCH_DETAILS_SUCCESS', payload: { ...response.data, detalles: detallesCompletos } });
            } catch (error) {
                dispatch({ type: 'FETCH_ERROR', payload: error.response?.data?.message || "Error al cargar detalles." });
            }
        };
        fetchDetalles();
    }, [state.selectedEvaluacionId, inicializarDetalles]);

    const handleVersionChange = (e) => {
        dispatch({ type: 'SET_SELECTED_ID', payload: e.target.value });
    };

    const handleCreateNewVersion = async () => {
        dispatch({ type: 'SAVING_START' });
        try {
            await api.post(`/api/v1/evaluacion-osteomuscular/paciente/${pacienteId}`);
            await fetchVersiones();
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: 'Nueva versión creada.', severity: 'success' } });
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', payload: error.response?.data?.message || "Error al crear versión." });
        } finally {
            dispatch({ type: 'SAVING_COMPLETE' });
        }
    };
    
    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        let fieldValue;
        if (type === 'checkbox') {
            fieldValue = checked;
        } else if (name === 'evalost_tiene_lavadora') {
            fieldValue = value === 'null' ? null : (value === 'true');
        } else {
            fieldValue = value;
        }
        dispatch({ type: 'FORM_DATA_CHANGE', payload: { [name]: fieldValue } });
    }, []);

    const handleRadioDeselect = useCallback((e) => {
        const { name, value } = e.target;
        if (state.formData[name] === value) {
            e.preventDefault();
            setTimeout(() => {
                dispatch({ type: 'FORM_DATA_CHANGE', payload: { [name]: null } });
            }, 0);
        }
    }, [state.formData]);

    const handleBooleanRadioDeselect = useCallback((e) => {
        const { name, value: valueStr } = e.target;
        const boolValue = valueStr === 'null' ? null : (valueStr === 'true');
        if (state.formData[name] === boolValue) {
            e.preventDefault();
            setTimeout(() => {
                dispatch({ type: 'FORM_DATA_CHANGE', payload: { [name]: null } });
            }, 0);
        }
    }, [state.formData]);

    const handleDetailChange = useCallback((zona, field, event) => {
        const { value, type, checked } = event.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        dispatch({ type: 'DETAIL_CHANGE', payload: { zona, field, value: fieldValue } });
    }, []);

    const handleSave = async () => {
        if (!state.formData?.evalost_es_activo) return;
        dispatch({ type: 'SAVING_START' });

        const payload = {
            datosPrincipales: {
                evalost_ant_patologicos: state.formData.evalost_ant_patologicos,
                evalost_sintomatologia_actual: state.formData.evalost_sintomatologia_actual,
                evalost_lado_dominante: state.formData.evalost_lado_dominante,
                evalost_tiene_lavadora: state.formData.evalost_tiene_lavadora,
                evalost_conoce_malas_posturas: state.formData.evalost_conoce_malas_posturas,
                evalost_conoce_manip_carga: state.formData.evalost_conoce_manip_carga,
                evalost_talla_nutri: state.formData.evalost_talla_nutri,
                evalost_peso_nutri: state.formData.evalost_peso_nutri,
                evalost_imc_nutri: state.formData.evalost_imc_nutri,
                evalost_grasa_corporal_nutri: state.formData.evalost_grasa_corporal_nutri,
                evalost_musculo_nutri: state.formData.evalost_musculo_nutri,
                evalost_edad_corporal_nutri: state.formData.evalost_edad_corporal_nutri,
                evalost_grasa_visceral_nutri: state.formData.evalost_grasa_visceral_nutri,
            },
            detalles: state.formData.detalles
        };

        try {
            const response = await api.put(`/api/v1/evaluacion-osteomuscular/${state.selectedEvaluacionId}`, payload);
            const detallesGuardados = new Map(response.data.detalles.map(d => [d.det_evalost_zona, d]));
            const detallesCompletos = inicializarDetalles().map(detalleBase =>
                detallesGuardados.has(detalleBase.det_evalost_zona)
                    ? { ...detalleBase, ...detallesGuardados.get(detalleBase.det_evalost_zona) }
                    : detalleBase
            );
            dispatch({ type: 'SAVING_COMPLETE', payload: { ...response.data, detalles: detallesCompletos } });
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: 'Evaluación guardada correctamente.', severity: 'success' } });
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', payload: error.response?.data?.message || "Error al guardar." });
            dispatch({ type: 'SAVING_COMPLETE' });
        }
    };

    const handlePrint = () => {
        if (state.formData) {
            setImprimiendo(true);
        } else {
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: 'No hay datos cargados para imprimir.', severity: 'warning' } });
        }
    };
    
    const isReadOnly = !state.formData?.evalost_es_activo || state.isSaving;
    
    const getBooleanRadioValue = (value) => {
        if (value === null || value === undefined) return '';
        return String(value);
    };

    return (
        <>
            {imprimiendo && (
                <FormatoEvaluacionOsteomuscular
                    evaluacion={state.formData}
                    paciente={pacienteData}
                    empleado={state.empleadoData}
                    onPrintFinish={() => setImprimiendo(false)}
                />
            )}
            
            <Modal open={open} onClose={onClose} aria-labelledby="evaluacion-osteomuscular-modal-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '95%', maxWidth: '1400px', maxHeight: '95vh', overflowY: 'auto', bgcolor: 'background.paper', boxShadow: 24, p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography id="evaluacion-osteomuscular-modal-title" variant="h5" component="h2">
                            Registro de Evaluación Osteomuscular
                        </Typography>
                        <IconButton onClick={onClose}><Close /></IconButton>
                    </Box>

                    {state.loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box> : (
                        <>
                            <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <FormControl size="small" sx={{ minWidth: 250, flexGrow: 1 }}>
                                    <InputLabel>Versión de Evaluación</InputLabel>
                                    <Select value={state.selectedEvaluacionId || ''} label="Versión de Evaluación" onChange={handleVersionChange} disabled={state.isSaving}>
                                        {state.evaluacionLista.map(v => (
                                            <MenuItem key={v.evalost_cod_evalost} value={v.evalost_cod_evalost}>
                                                {new Date(v.evalost_fec_eval).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                {v.evalost_es_activo && <Typography component="span" variant="caption" sx={{ ml: 1, color: 'success.main', fontWeight: 'bold' }}> (Activa)</Typography>}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button variant="outlined" startIcon={<Add />} onClick={handleCreateNewVersion} disabled={state.isSaving}>Crear Nueva Versión</Button>
                            </Paper>

                            {state.formData && (
                                <Box>
                                    <DatosGenerales evaluacion={state.formData} paciente={pacienteData} empleado={state.empleadoData} />
                                    
                                    <Anamnesis 
                                        antecedentes={state.formData.evalost_ant_patologicos}
                                        sintomatologia={state.formData.evalost_sintomatologia_actual}
                                        onInputChange={handleInputChange}
                                        isReadOnly={isReadOnly}
                                    />

                                    <ExamenFisico
                                        detalles={state.formData.detalles}
                                        onDetailChange={handleDetailChange}
                                        isReadOnly={isReadOnly}
                                    />
                                    
                                    <PreguntasAdicionales 
                                        formData={state.formData}
                                        onInputChange={handleInputChange}
                                        onRadioDeselect={handleRadioDeselect}
                                        onBooleanRadioDeselect={handleBooleanRadioDeselect}
                                        isReadOnly={isReadOnly}
                                        getBooleanRadioValue={getBooleanRadioValue}
                                    />
                                    
                                    <ValoracionNutricional
                                        formData={state.formData}
                                        onInputChange={handleInputChange}
                                        isReadOnly={isReadOnly}
                                    />
                                    
                                    <Grid container>
                                      <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                          <Button variant="outlined" onClick={onClose}>Cerrar</Button>
                                          <Button variant="outlined" color="secondary" startIcon={<Print />} onClick={handlePrint} disabled={!state.formData}>Imprimir</Button>
                                          <Button variant="contained" onClick={handleSave} disabled={isReadOnly}>{state.isSaving ? 'Guardando...' : 'Guardar Cambios'}</Button>
                                      </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Modal>
            <Snackbar open={state.snackbar.open} autoHideDuration={6000} onClose={() => dispatch({ type: 'HIDE_SNACKBAR' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => dispatch({ type: 'HIDE_SNACKBAR' })} severity={state.snackbar.severity} sx={{ width: '100%' }}>
                    {state.snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default EvaluacionOsteomuscularModal;