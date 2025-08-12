// ===================================================================================
// == Archivo Actualizado: components/OdontogramaGrid.jsx ==
// ===================================================================================
// @summary ✅ MEJORA CLÍNICA: El color de las coronas en los pilares de una
//          prótesis fija ahora depende de si la prótesis es 'necesaria' (rojo)
//          o 'realizada' (azul).

import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { Box, Paper, Divider, Typography } from '@mui/material';
import { Tooth } from './Tooth';
import { getProsthesisInfo } from './utils/odontogramaUtils';

const PerioLegends = () => (
    <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        paddingTop: '2px', minHeight: '54px', width: '80px', flexShrink: 0, marginRight: 1
    }}>
        <Typography variant="caption" sx={{ height: '26px', textAlign: 'right', color: 'text.secondary' }}>Recesión</Typography>
        <Typography variant="caption" sx={{ height: '26px', textAlign: 'right', color: 'text.secondary' }}>Movilidad</Typography>
    </Box>
);

export const OdontogramaGrid = ({ dientes, detalles, onSurfaceClick, onToothClick, superficies, datosPeriodontales, editMode, onUpdatePerioData, estados }) => {

    // Se eliminó la lógica de la línea conectora externa
    const prosthesisInfo = useMemo(() => getProsthesisInfo(detalles), [detalles]);

    // ✅ MEJORA: Se buscan ambos estados de corona para asignar el color correcto.
    const coronaRealizadaState = useMemo(() => estados.find(e => e.esden_nom_esden === 'Corona realizada'), [estados]);
    const coronaNecesariaState = useMemo(() => estados.find(e => e.esden_nom_esden === 'Corona necesaria'), [estados]);
    
    const protesisFijaState = useMemo(() => estados.find(e => e.esden_nom_esden === 'Prótesis Fija Realizada'), [estados]);

    const organizedTeeth = useMemo(() => {
        const c = { supDer: [], supIzq: [], infDer: [], infIzq: [], tmpSupDer: [], tmpSupIzq: [], tmpInfDer: [], tmpInfIzq: [] };
        dientes.forEach(d => {
            const n = parseInt(d.diente_id_diente, 10);
            if (n >= 11 && n <= 18) c.supDer.push(d); else if (n >= 21 && n <= 28) c.supIzq.push(d);
            else if (n >= 41 && n <= 48) c.infDer.push(d); else if (n >= 31 && n <= 38) c.infIzq.push(d);
            else if (n >= 51 && n <= 55) c.tmpSupDer.push(d); else if (n >= 61 && n <= 65) c.tmpSupIzq.push(d);
            else if (n >= 81 && n <= 85) c.tmpInfDer.push(d); else if (n >= 71 && n <= 75) c.tmpInfIzq.push(d);
        });
        const sortAsc = (a, b) => parseInt(a.diente_id_diente, 10) - parseInt(b.diente_id_diente, 10);
        const sortDesc = (a, b) => parseInt(b.diente_id_diente, 10) - parseInt(a.diente_id_diente, 10);
        c.supDer.sort(sortDesc); c.infDer.sort(sortDesc); c.tmpSupDer.sort(sortDesc); c.tmpInfDer.sort(sortDesc);
        c.supIzq.sort(sortAsc); c.infIzq.sort(sortAsc); c.tmpSupIzq.sort(sortAsc); c.tmpInfIzq.sort(sortAsc);
        return c;
    }, [dientes]);


    const renderCuadrante = (dientesCuadrante) => (
        <Box sx={{ display: 'flex', flexWrap: 'nowrap' }}>
            {dientesCuadrante.map((diente) => {
                const perioDataDiente = datosPeriodontales?.find(data => data.dienteId === diente.diente_id_diente);
                let overrideState = null;
                const pInfo = prosthesisInfo[diente.diente_id_diente];
                
                if (pInfo && pInfo.type === 'fija') {
                    if (pInfo.role === 'pilar') {
                        // ✅ MEJORA: Se determina si la prótesis original es 'necesaria' o 'realizada'
                        const originalDetail = detalles.find(d => d.dienteId === diente.diente_id_diente);
                        const esNecesaria = originalDetail && originalDetail.estado.includes('necesaria');
                        
                        // Se selecciona el estado de corona correcto (rojo o azul)
                        const targetCoronaState = esNecesaria ? coronaNecesariaState : coronaRealizadaState;

                        if (targetCoronaState) {
                             overrideState = { estado: targetCoronaState.esden_nom_esden, colorEstado: targetCoronaState.esden_col_esden };
                        }
                    } 
                    else if (pInfo.role === 'pontico' && protesisFijaState) {
                        overrideState = { estado: protesisFijaState.esden_nom_esden, colorEstado: protesisFijaState.esden_col_esden };
                    }
                }

                return (
                    <Tooth
                        key={diente.diente_cod_diente}
                        diente={diente}
                        detallesDiente={detalles?.filter(det => det.dienteId === diente.diente_id_diente) || []}
                        onSurfaceClick={onSurfaceClick} onToothClick={onToothClick} superficies={superficies}
                        perioData={perioDataDiente} editMode={editMode} onUpdatePerioData={onUpdatePerioData}
                        overrideState={overrideState}
                        prosthesisInfo={pInfo}
                    />
                );
            })}
        </Box>
    );

    return (
        <Paper elevation={1} sx={{ p: 2, overflowX: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <PerioLegends />
                <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', mb: 1 }}>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {renderCuadrante(organizedTeeth.supDer)} {renderCuadrante(organizedTeeth.tmpSupDer)}
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {renderCuadrante(organizedTeeth.supIzq)} {renderCuadrante(organizedTeeth.tmpSupIzq)}
                    </Box>
                </Box>
            </Box>
            <Divider sx={{ my: 2 }}></Divider>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <PerioLegends />
                <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', mt: 1 }}>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {renderCuadrante(organizedTeeth.tmpInfDer)} {renderCuadrante(organizedTeeth.infDer)}
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {renderCuadrante(organizedTeeth.tmpInfIzq)} {renderCuadrante(organizedTeeth.infIzq)}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};