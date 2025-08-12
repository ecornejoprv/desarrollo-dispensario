// src/components/OdontogramaModal.jsx (Código Absolutamente Completo y Corregido)
// ==============================================================================
// @summary: Se refactoriza el componente para que reciba los datos maestros
//           (dientes, estados, superficies) a través de props, en lugar de
//           buscarlos en un contexto. Esto soluciona el error 'Cannot read
//           properties of undefined' y convierte al modal en un componente
//           reutilizable y predecible.
// ==============================================================================

import React, { useEffect, useCallback, useReducer, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Box, Typography, IconButton, Button, Alert, CircularProgress, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Close, Edit, Add } from '@mui/icons-material';
import api from '../api';

// Se importan los sub-componentes que este modal utiliza.
import { SymbolPalette } from './SymbolPalette';
import { OdontogramaGrid } from './OdontogramaGrid';
import { IndicadoresSaludBucal } from './IndicadoresSaludBucal';
import { getEstadoMetadata, isProstheticState } from './utils/odontogramaUtils';

// Función de ayuda para normalizar la estructura de los detalles dentales.
const normalizeDetail = (detail) => ({ 
    ...detail, 
    id: detail.id || detail.dodon_cod_dodon, 
    dienteId: detail.dienteId || detail.diente_id_diente 
});

// Estado inicial para el reducer que maneja la lógica interna del modal.
const initialState = {
    loading: true,
    loadingList: true,
    odontograma: null,
    odontogramasLista: [],
    selectedOdontogramaId: null,
    editMode: false,
    selectedTool: null,
    snackbar: { open: false, message: "", severity: "info" },
    rangeSelection: { start: null, tool: null },
};

// Reducer para manejar los cambios de estado complejos del odontograma.
function odontogramaReducer(state, action) {
    switch (action.type) {
        case 'FETCH_LIST_START': return { ...state, loadingList: true };
        case 'FETCH_LIST_SUCCESS':
            const activo = action.payload.find(o => o.odont_es_activo);
            return { 
                ...state, 
                loadingList: false, 
                odontogramasLista: action.payload,
                selectedOdontogramaId: activo ? activo.odont_cod_odont : (action.payload[0]?.odont_cod_odont || null)
            };
        case 'FETCH_DETAILS_START': return { ...state, loading: true, odontograma: null };
        case 'FETCH_DETAILS_SUCCESS': 
            const normalizedData = action.payload.detalles ? action.payload.detalles.map(normalizeDetail) : [];
            return { ...state, loading: false, odontograma: {...action.payload, detalles: normalizedData} };
        case 'FETCH_ERROR': return { ...state, loading: false, loadingList: false, snackbar: { open: true, message: action.payload, severity: 'error' } };
        case 'SET_SELECTED_ODONTOGRAMA': return { ...state, selectedOdontogramaId: action.payload };
        case 'TOGGLE_EDIT_MODE': return { ...state, editMode: !state.editMode, selectedTool: null, rangeSelection: { start: null, tool: null } };
        case 'SELECT_TOOL': return { ...state, selectedTool: action.payload };
        case 'DESELECT_TOOL': return { ...state, selectedTool: null };
        case 'START_RANGE_SELECTION': return { ...state, rangeSelection: { start: action.payload.diente, tool: action.payload.tool } };
        case 'CLEAR_RANGE_SELECTION': return { ...state, rangeSelection: { start: null, tool: null } };
        case 'SHOW_SNACKBAR': return { ...state, snackbar: { open: true, ...action.payload } };
        case 'HIDE_SNACKBAR': return { ...state, snackbar: { ...state.snackbar, open: false } };
        
        case 'UPSERT_ODONTOGRAMA_DETAILS':
            if (!state.odontograma) return state;
            const newDetails = Array.isArray(action.payload) ? action.payload : [action.payload];
            const newDetailsMap = new Map(newDetails.map(d => {
                const normalized = normalizeDetail(d);
                return [normalized.id, normalized];
            }));
            const updatedDetalles = state.odontograma.detalles
                .filter(d => !newDetailsMap.has(d.id))
                .concat(Array.from(newDetailsMap.values()));
            return { ...state, odontograma: { ...state.odontograma, detalles: updatedDetalles } };

        case 'DELETE_ODONTOGRAMA_DETAILS':
             if (!state.odontograma) return state;
             const idsToDelete = new Set(Array.isArray(action.payload) ? action.payload : [action.payload]);
             const filteredDetalles = state.odontograma.detalles.filter(d => !idsToDelete.has(d.id));
             return { ...state, odontograma: { ...state.odontograma, detalles: filteredDetalles } };

        case 'UPDATE_PERIO_DATA':
            if (!state.odontograma) return state;
            const { dienteId: dienteIdToUpdate, movilidad, recesion } = action.payload;
            let perioDataUpdated = false;
            const newPerioData = state.odontograma.datosPeriodontales.map(data => {
                if (data.dienteId === dienteIdToUpdate) {
                    perioDataUpdated = true;
                    return { ...data, movilidad, recesion };
                }
                return data;
            });
            if (!perioDataUpdated) {
                newPerioData.push({ dienteId: dienteIdToUpdate, movilidad, recesion });
            }
            return { ...state, odontograma: { ...state.odontograma, datosPeriodontales: newPerioData, }, };
        
        case 'SET_IHOS_DETAILS':
            if (!state.odontograma) return state;
            return { ...state, odontograma: { ...state.odontograma, ihosDetalles: action.payload } };

        case 'UPDATE_ODONTOGRAMA_HEADER':
            if (!state.odontograma) return state;
            return { ...state, odontograma: { ...state.odontograma, ...action.payload } };

        default: throw new Error(`Acción desconocida: ${action.type}`);
    }
}

// --- CAMBIO 1: El componente ahora acepta 'masterData' como prop ---
export const OdontogramaModal = ({ open, onClose, pacienteId, masterData }) => {
    const [state, dispatch] = useReducer(odontogramaReducer, initialState);
    
    // --- CAMBIO 2: Se desestructuran los datos desde la prop 'masterData' en lugar de un hook ---
    // Justificación: Esto asegura que el modal utilice los datos que el componente padre
    // (Odontologia.jsx) ya cargó, evitando errores y llamadas duplicadas a la API.
    const { dientes, estados, superficies, loading: masterLoading, error: masterError } = masterData;

    useEffect(() => {
        if (state.snackbar.open) {
            const timer = setTimeout(() => {
                dispatch({ type: 'HIDE_SNACKBAR' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [state.snackbar.open]);

    const fetchOdontogramaList = useCallback(async () => {
        if (!pacienteId) return;
        dispatch({ type: 'FETCH_LIST_START' });
        try {
            const response = await api.get(`/api/v1/odontograma/paciente/${pacienteId}/lista`);
            dispatch({ type: 'FETCH_LIST_SUCCESS', payload: response.data });
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error al cargar la lista de odontogramas.";
            dispatch({ type: 'FETCH_ERROR', payload: errorMsg });
        }
    }, [pacienteId]);

    const fetchOdontogramaDetails = useCallback(async (id) => {
        if (!id) return;
        dispatch({ type: 'FETCH_DETAILS_START' });
        try {
            const response = await api.get(`/api/v1/odontograma/${id}`);
            dispatch({ type: 'FETCH_DETAILS_SUCCESS', payload: response.data }); 
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error al cargar el odontograma.";
            dispatch({ type: 'FETCH_ERROR', payload: errorMsg });
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchOdontogramaList();
        }
    }, [open, fetchOdontogramaList]);

    useEffect(() => {
        // Se asegura que los dientes existan antes de buscar detalles.
        if (state.selectedOdontogramaId && dientes && dientes.length > 0) { 
            fetchOdontogramaDetails(state.selectedOdontogramaId);
        }
    }, [state.selectedOdontogramaId, fetchOdontogramaDetails, dientes]);

    const augmentedEstados = useMemo(() => {
        if (!estados) return [];
        return estados.map(e => ({ ...e, applicationLevel: getEstadoMetadata(e.esden_nom_esden) }));
    }, [estados]);

    const buildRichDetail = useCallback((simpleDetail) => {
        const diente = dientes.find(d => d.diente_cod_diente === simpleDetail.dodon_cod_diente);
        const estado = estados.find(e => e.esden_cod_esden === simpleDetail.dodon_cod_esden);
        const superficie = superficies.find(s => s.suden_cod_suden === simpleDetail.dodon_cod_suden);
        return {
            id: simpleDetail.dodon_cod_dodon,
            dienteId: diente?.diente_id_diente,
            dienteNombre: diente?.diente_nom_diente,
            superficie: superficie?.suden_nom_suden || null,
            estado: estado?.esden_nom_esden,
            colorEstado: estado?.esden_col_esden,
            observaciones: simpleDetail.dodon_obs_dodon,
            grupoId: simpleDetail.dodon_grupo_id,
        };
    }, [dientes, estados, superficies]);

    const handleCreateNew = async () => {
        if (!pacienteId) return;
        try {
            await api.post(`/api/v1/odontograma/paciente/${pacienteId}`);
            fetchOdontogramaList();
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: 'Nueva versión del odontograma creada.', severity: 'success' } });
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error al crear el odontograma.";
            dispatch({ type: 'FETCH_ERROR', payload: errorMsg });
        }
    };

    const handleVersionChange = (event) => {
        dispatch({ type: 'SET_SELECTED_ODONTOGRAMA', payload: event.target.value });
    };
    
    const handleSurfaceClick = (dienteId, superficieCod) => {
        const odontogramaId = state.selectedOdontogramaId;
        if (!state.editMode || !state.selectedTool || !superficieCod || !odontogramaId) return;
        const diente = dientes.find(d => d.diente_id_diente === dienteId);
        if (!diente) return;
        
        if (state.selectedTool.esden_cod_esden === 'ERASER') {
            const superficieNombre = superficies.find(s => s.suden_cod_suden === superficieCod)?.suden_nom_suden;
            const detalleABorrar = state.odontograma.detalles.find(d => d.dienteId === dienteId && d.superficie === superficieNombre);
            if (!detalleABorrar || !detalleABorrar.id) return; 
            api.delete(`/api/v1/odontograma/detalles/${detalleABorrar.id}`)
                .then(() => {
                    dispatch({ type: 'DELETE_ODONTOGRAMA_DETAILS', payload: detalleABorrar.id });
                    dispatch({ type: 'SHOW_SNACKBAR', payload: { message: `Se limpió la superficie.`, severity: 'success' } });
                })
                .catch(() => dispatch({ type: 'SHOW_SNACKBAR', payload: { message: "Error al borrar el estado.", severity: 'error' } }));
            return;
        }
        
        if (state.selectedTool.applicationLevel === 'surface') {
            api.post(`/api/v1/odontograma/${odontogramaId}/detalles`, {
                dienteId: diente.diente_cod_diente, superficieId: superficieCod, estadoId: state.selectedTool.esden_cod_esden
            })
            .then(response => {
                const richDetail = buildRichDetail(response.data);
                dispatch({ type: 'UPSERT_ODONTOGRAMA_DETAILS', payload: richDetail });
                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: `'${state.selectedTool.esden_nom_esden}' aplicado.`, severity: 'success' } });
            })
            .catch(() => dispatch({ type: 'SHOW_SNACKBAR', payload: { message: "Error al aplicar estado.", severity: 'error' } }));
        }
    };

    const handleToothClick = (dienteId) => {
        const odontogramaId = state.selectedOdontogramaId;
        if (!state.editMode || !state.selectedTool || !odontogramaId) return;
        const dienteSeleccionado = dientes.find(d => d.diente_id_diente === dienteId);
        if (!dienteSeleccionado) return;
        const { esden_cod_esden: toolId, esden_nom_esden: toolName } = state.selectedTool;

        if (toolId === 'ERASER') {
            api.delete(`/api/v1/odontograma/${odontogramaId}/protesis/${dienteSeleccionado.diente_cod_diente}`)
                .then(response => {
                    const { deletedIds } = response.data;
                    if (deletedIds && deletedIds.length > 0) {
                        dispatch({ type: 'DELETE_ODONTOGRAMA_DETAILS', payload: deletedIds });
                        dispatch({ type: 'SHOW_SNACKBAR', payload: { message: 'Elemento eliminado.', severity: 'success' } });
                    }
                })
                .catch(err => {
                    const errorMsg = err.response?.data?.message || "Error al eliminar.";
                    dispatch({ type: 'SHOW_SNACKBAR', payload: { message: errorMsg, severity: 'error' } });
                });
            return;
        }

        if (toolName.includes('Prótesis total')) {
            api.post(`/api/v1/odontograma/${odontogramaId}/arcada-total`, {
                dienteId: dienteSeleccionado.diente_cod_diente, estadoId: toolId
            })
            .then((response) => {
                const richDetails = response.data.map(buildRichDetail);
                dispatch({ type: 'UPSERT_ODONTOGRAMA_DETAILS', payload: richDetails });
                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: 'Prótesis total aplicada.', severity: 'success' } });
            })
            .catch(err => {
                const errorMsg = err.response?.data?.message || "Error al aplicar la prótesis total.";
                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: errorMsg, severity: 'error' } });
            });
            return;
        }
        
        if (isProstheticState(toolName)) {
            if (!state.rangeSelection.start) {
                dispatch({ type: 'START_RANGE_SELECTION', payload: { diente: dienteSeleccionado, tool: state.selectedTool } });
                return;
            }
            if (state.rangeSelection.start.diente_tip_diente !== dienteSeleccionado.diente_tip_diente) {
                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: "Error: No se puede seleccionar un rango entre dientes permanentes y temporales.", severity: 'error' } });
                dispatch({ type: 'CLEAR_RANGE_SELECTION' });
                return;
            }
            const dienteInicio = state.rangeSelection.start;
            const dienteFin = dienteSeleccionado;

            if (dienteInicio.diente_id_diente === dienteFin.diente_id_diente) {
                const esNecesaria = toolName.includes('necesaria');
                const targetCoronaName = esNecesaria ? 'Corona necesaria' : 'Corona realizada';
                const coronaState = estados.find(e => e.esden_nom_esden === targetCoronaName);
                if (coronaState) {
                    api.post(`/api/v1/odontograma/${odontogramaId}/diente/${dienteSeleccionado.diente_cod_diente}/estado`, {
                        estadoId: coronaState.esden_cod_esden
                    })
                    .then(response => {
                        const richDetail = buildRichDetail(response.data);
                        dispatch({ type: 'UPSERT_ODONTOGRAMA_DETAILS', payload: richDetail });
                        dispatch({ type: 'SHOW_SNACKBAR', payload: { message: `Corona aplicada.`, severity: 'success' } });
                    }).catch(() => {
                        dispatch({ type: 'SHOW_SNACKBAR', payload: { message: "Error al aplicar corona.", severity: 'error' } });
                    }).finally(() => dispatch({ type: 'CLEAR_RANGE_SELECTION' }));
                }
                return;
            }

            api.post(`/api/v1/odontograma/${odontogramaId}/rango`, {
                dienteInicioId: dienteInicio.diente_id_diente, dienteFinId: dienteFin.diente_id_diente, estadoId: state.rangeSelection.tool.esden_cod_esden,
            })
            .then((response) => {
                const richDetails = response.data.map(buildRichDetail);
                dispatch({ type: 'UPSERT_ODONTOGRAMA_DETAILS', payload: richDetails });
                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: `'${toolName}' aplicada correctamente.`, severity: 'success' } });
            })
            .catch(err => {
                const errorMsg = err.response?.data?.message || "Error al aplicar la prótesis en el rango.";
                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: errorMsg, severity: 'error' } });
            }).finally(() => dispatch({ type: 'CLEAR_RANGE_SELECTION' }));
            return;
        }
        
        if (state.selectedTool.applicationLevel === 'tooth') {
            api.post(`/api/v1/odontograma/${odontogramaId}/diente/${dienteSeleccionado.diente_cod_diente}/estado`, {
                estadoId: toolId
            })
            .then(response => {
                const richDetail = buildRichDetail(response.data);
                dispatch({ type: 'UPSERT_ODONTOGRAMA_DETAILS', payload: richDetail });
                dispatch({ type: 'SHOW_SNACKBAR', payload: { message: `'${toolName}' aplicado.`, severity: 'success' } });
            });
        }
    };

    const handleUpdatePerioData = useCallback(async (dienteCod, movilidad, recesion) => {
        const odontogramaId = state.selectedOdontogramaId;
        if (!odontogramaId || !dientes || dientes.length === 0) return;
        const dienteObj = dientes.find(d => d.diente_cod_diente === dienteCod);
        if (!dienteObj) {
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: 'Error: Diente no encontrado.', severity: 'error' } });
            return;
        }
        try {
            await api.post(`/api/v1/odontograma/${odontogramaId}/diente/${dienteCod}/perio`, { movilidad, recesion });
            dispatch({ type: 'UPDATE_PERIO_DATA', payload: { dienteId: dienteObj.diente_id_diente, movilidad, recesion } });
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: 'Datos periodontales actualizados.', severity: 'success' } });
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error al actualizar datos periodontales.";
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: errorMsg, severity: 'error' } });
        }
    }, [state.selectedOdontogramaId, dientes]);

    const handleSaveIndicadores = useCallback(async ({ ihosDetalles, indicadoresGenerales }) => {
        const odontogramaId = state.selectedOdontogramaId;
        if (!odontogramaId) return;
        try {
            const [ihosResponse, odontoResponse] = await Promise.all([
                api.post(`/api/v1/odontograma/${odontogramaId}/ihos`, ihosDetalles),
                api.put(`/api/v1/odontograma/${odontogramaId}`, indicadoresGenerales)
            ]);
            dispatch({ type: 'SET_IHOS_DETAILS', payload: ihosResponse.data });
            dispatch({ type: 'UPDATE_ODONTOGRAMA_HEADER', payload: odontoResponse.data });
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: 'Indicadores de salud guardados correctamente.', severity: 'success' } });
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error al guardar los indicadores.";
            dispatch({ type: 'SHOW_SNACKBAR', payload: { message: errorMsg, severity: 'error' } });
        }
    }, [state.selectedOdontogramaId]);

    // Renderizado principal del modal
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "95%", maxWidth: "1400px", maxHeight: "95vh", overflowY: "auto", bgcolor: "background.paper", boxShadow: 24, p: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h5">Odontograma Clínico</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel id="version-select-label">Versión</InputLabel>
                            <Select
                                labelId="version-select-label" value={state.selectedOdontogramaId || ''}
                                label="Versión" onChange={handleVersionChange} disabled={state.loadingList}
                            >
                                {state.odontogramasLista.map(o => (
                                    <MenuItem key={o.odont_cod_odont} value={o.odont_cod_odont}>
                                        {new Date(o.odont_fec_odont).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        {o.odont_es_activo && <Typography variant="caption" sx={{ ml: 1, color: 'success.main' }}> (Activo)</Typography>}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="outlined" startIcon={<Add />} onClick={handleCreateNew}>Crear Nuevo</Button>
                    </Box>
                    <IconButton onClick={onClose}><Close /></IconButton>
                </Box>
                
                {state.loading || state.loadingList ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress /></Box>
                ) : state.odontograma && (
                    <Box>
                        <OdontogramaGrid
                            dientes={dientes} detalles={state.odontograma.detalles} superficies={superficies}
                            onToothClick={handleToothClick} onSurfaceClick={handleSurfaceClick} estados={estados}
                            datosPeriodontales={state.odontograma.datosPeriodontales} editMode={state.editMode}
                            onUpdatePerioData={handleUpdatePerioData}
                        />
                        <Box sx={{ mt: 2, mb: 1, minHeight: '48px' }}>
                            {state.rangeSelection.start && (
                                <Alert 
                                    severity="info"
                                    action={ <Button color="inherit" size="small" onClick={() => dispatch({ type: 'CLEAR_RANGE_SELECTION' })}>CANCELAR</Button> }
                                >
                                    Pieza inicial <strong>{state.rangeSelection.start.diente_id_diente}</strong> seleccionada. Por favor, seleccione la pieza final.
                                </Alert>
                            )}
                            {state.snackbar.open && (
                                <Alert severity={state.snackbar.severity} onClose={() => dispatch({ type: 'HIDE_SNACKBAR' })} sx={{ mt: 1 }} >
                                    {state.snackbar.message}
                                </Alert>
                            )}
                        </Box>
                        <Box sx={{ mt: 1.5, mb: 3 }}>
                            {state.editMode && (
                                <Box sx={{ mb: 2 }}>
                                    <SymbolPalette
                                        estados={augmentedEstados} selectedTool={state.selectedTool}
                                        onSelectTool={(tool) => dispatch({ type: 'SELECT_TOOL', payload: tool })}
                                    />
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button 
                                    fullWidth variant={state.editMode ? "contained" : "outlined"} 
                                    startIcon={<Edit />} onClick={() => dispatch({ type: 'TOGGLE_EDIT_MODE' })} 
                                    sx={{ maxWidth: '400px' }} disabled={!state.odontograma?.odont_es_activo}
                                >
                                    {state.editMode ? "Finalizar Edición" : "Activar Edición"}
                                </Button>
                            </Box>
                            {!state.odontograma?.odont_es_activo && !state.editMode && (
                                <Typography variant="caption" color="text.secondary" align="center" component="div" sx={{ mt: 1}}>
                                    Solo se puede editar la versión activa del odontograma.
                                </Typography>
                            )}
                        </Box>

                        <IndicadoresSaludBucal
                            odontograma={state.odontograma}
                            dientes={dientes}
                            onSave={handleSaveIndicadores}
                        />
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

// Se actualiza el nombre del componente en los PropTypes
OdontogramaModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    pacienteId: PropTypes.oneOfType([ PropTypes.string, PropTypes.number ]).isRequired,
};

export default OdontogramaModal; // Se actualiza la exportación por defecto