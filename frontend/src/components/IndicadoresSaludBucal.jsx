// ===================================================================================
// == Archivo Completo y Final: frontend/src/components/IndicadoresSaludBucal.jsx ==
// ===================================================================================
// @summary Versión final con la lógica de selección de dientes de la tabla IHO-S
//          simplificada para permitir la selección mixta (permanentes y temporales),
//          eliminando el estado de bloqueo 'dentitionType'.

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Button, Grid, Divider as MuiDivider, Stack } from '@mui/material';
import { IhosTable } from './IhosTable';
import { CpoCeoTable } from './CpoCeoTable';
import { IndicadoresGenerales } from './IndicadoresGenerales';

const indexTeeth = [
  { p: ['16', '17'], t: '55' },
  { p: ['11', '21'], t: '51' },
  { p: ['26', '27'], t: '65' },
  { p: ['36', '37'], t: '75' },
  { p: ['31', '41'], t: '71' },
  { p: ['46', '47'], t: '85' },
];

export const IndicadoresSaludBucal = ({ odontograma, dientes, onSave }) => {
    // Estado para la tabla IHO-S
    const [selections, setSelections] = useState({});
    
    // Estado para los indicadores generales
    const [indicadoresGenerales, setIndicadoresGenerales] = useState({ periodonto: '', maloclusion: '', fluorosis: '' });
    
    // Estado para los datos de la tabla CPO-ceo
    const [cpoData, setCpoData] = useState({
        cpo_c: '', cpo_p: '', cpo_o: '',
        ceo_c: '', ceo_e: '', ceo_o: ''
    });

    useEffect(() => {
        // Inicializar estado de la tabla IHO-S
        const initialIhosState = {};
        if (odontograma?.ihosDetalles && odontograma.ihosDetalles.length > 0) {
            odontograma.ihosDetalles.forEach(record => {
                const tooth = dientes.find(d => d.diente_cod_diente === record.dienteCodigo);
                if (tooth) {
                    initialIhosState[tooth.diente_id_diente] = {
                        placa: record.placa ?? '', calculo: record.calculo ?? '', gingivitis: record.gingivitis ?? '',
                    };
                }
            });
        }
        setSelections(initialIhosState);

        // Inicializar estado de los indicadores generales
        setIndicadoresGenerales({
            periodonto: odontograma?.odont_periodonto || '',
            maloclusion: odontograma?.odont_maloclusion || '',
            fluorosis: odontograma?.odont_fluorosis || '',
        });
        
        // Inicializar estado de CPO-ceo
        setCpoData({
            cpo_c: odontograma?.odont_cpo_c ?? '', cpo_p: odontograma?.odont_cpo_p ?? '',
            cpo_o: odontograma?.odont_cpo_o ?? '', ceo_c: odontograma?.odont_ceo_c ?? '',
            ceo_e: odontograma?.odont_ceo_e ?? '', ceo_o: odontograma?.odont_ceo_o ?? '',
        });
    }, [odontograma, dientes]);
    
    const handleToothSelect = (toothId) => {
        setSelections(prevSelections => {
            const newSelections = { ...prevSelections };
            const row = indexTeeth.find(r => r.p.includes(toothId) || r.t === toothId);
            
            // Limpiar otros dientes en la misma fila para mantener la exclusividad
            if (row) {
                [...row.p, row.t].forEach(tId => {
                    if (tId !== toothId) delete newSelections[tId];
                });
            }
    
            // Alternar la selección del diente clickeado
            if (newSelections[toothId]) {
                delete newSelections[toothId];
            } else {
                newSelections[toothId] = { placa: '', calculo: '', gingivitis: '' };
            }
            return newSelections;
        });
    };

    const handleInputChange = (toothId, field, value) => {
        if (!toothId) return;
        const numValue = value === '' ? '' : parseInt(value, 10);
        setSelections(prev => ({
            ...prev,
            [toothId]: { ...prev[toothId], [field]: numValue },
        }));
    };

    const handleSaveClick = () => {
        const ihosPayload = Object.entries(selections).map(([toothId, values]) => {
            const diente = dientes.find(d => d.diente_id_diente === toothId);
            return {
                dienteCodigo: diente.diente_cod_diente,
                placa: values.placa === '' ? null : values.placa,
                calculo: values.calculo === '' ? null : values.calculo,
                gingivitis: values.gingivitis === '' ? null : values.gingivitis,
            };
        });

        const generalesPayload = {
            odont_periodonto: indicadoresGenerales.periodonto || null,
            odont_maloclusion: indicadoresGenerales.maloclusion || null,
            odont_fluorosis: indicadoresGenerales.fluorosis || null,
            odont_cpo_c: cpoData.cpo_c === '' ? null : Number(cpoData.cpo_c),
            odont_cpo_p: cpoData.cpo_p === '' ? null : Number(cpoData.cpo_p),
            odont_cpo_o: cpoData.cpo_o === '' ? null : Number(cpoData.cpo_o),
            odont_ceo_c: cpoData.ceo_c === '' ? null : Number(cpoData.ceo_c),
            odont_ceo_e: cpoData.ceo_e === '' ? null : Number(cpoData.ceo_e),
            odont_ceo_o: cpoData.ceo_o === '' ? null : Number(cpoData.ceo_o),
        };

        onSave({ ihosDetalles: ihosPayload, indicadoresGenerales: generalesPayload });
    };
    
    return (
        <Paper sx={{ p: 2, mt: 3 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <IhosTable 
                        selections={selections}
                        // La prop 'dentitionType' ya no es necesaria
                        onToothSelect={handleToothSelect}
                        onInputChange={handleInputChange}
                    />
                </Grid>
                <Grid item xs={12} md={5}>
                    <Stack spacing={2}>
                        <IndicadoresGenerales 
                            data={indicadoresGenerales}
                            onDataChange={setIndicadoresGenerales}
                        />
                        <MuiDivider />
                        <CpoCeoTable 
                            cpoData={cpoData}
                            onCpoChange={setCpoData}
                        />
                    </Stack>
                </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleSaveClick} disabled={!odontograma?.odont_cod_odont}>Guardar Indicadores</Button>
            </Box>
        </Paper>
    );
};