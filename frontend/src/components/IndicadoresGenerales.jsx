// ===================================================================================
// == Archivo Completo y Corregido: frontend/src/components/IndicadoresGenerales.jsx ==
// ===================================================================================
// @summary ✅ CORRECCIÓN DE LÓGICA: Se implementa un manejador 'onClick' para
//          cada opción, permitiendo deseleccionar un radio button al hacer
//          clic sobre él si ya estaba seleccionado.

import React from 'react';
import { Typography, Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';

export const IndicadoresGenerales = ({ data, onDataChange }) => {
    
    // Este manejador se encarga de seleccionar una NUEVA opción
    const handleChange = (field, value) => {
        onDataChange({ ...data, [field]: value });
    };

    // ✅ NUEVO: Este manejador se encarga de DESELECCIONAR una opción existente
    const handleClick = (field, value) => {
        // Si el valor que se clickea es el que ya estaba seleccionado, se limpia.
        if (data[field] === value) {
            onDataChange({ ...data, [field]: '' });
        }
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>Indicadores Generales</Typography>
            <Grid container spacing={0}>
                <Grid item xs={12} sm={4}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>Enf. Periodontal</FormLabel>
                        <RadioGroup value={data.periodonto || ''} onChange={(e) => handleChange('periodonto', e.target.value)}>
                            <FormControlLabel value="Leve" control={<Radio size="small" />} label="Leve" onClick={() => handleClick('periodonto', 'Leve')} />
                            <FormControlLabel value="Moderada" control={<Radio size="small" />} label="Moderada" onClick={() => handleClick('periodonto', 'Moderada')} />
                            <FormControlLabel value="Severa" control={<Radio size="small" />} label="Severa" onClick={() => handleClick('periodonto', 'Severa')} />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>Maloclusión</FormLabel>
                        <RadioGroup value={data.maloclusion || ''} onChange={(e) => handleChange('maloclusion', e.target.value)}>
                            <FormControlLabel value="Angle I" control={<Radio size="small" />} label="Angle I" onClick={() => handleClick('maloclusion', 'Angle I')} />
                            <FormControlLabel value="Angle II" control={<Radio size="small" />} label="Angle II" onClick={() => handleClick('maloclusion', 'Angle II')} />
                            <FormControlLabel value="Angle III" control={<Radio size="small" />} label="Angle III" onClick={() => handleClick('maloclusion', 'Angle III')} />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                     <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontSize: '0.9rem' }}>Fluorosis</FormLabel>
                        <RadioGroup value={data.fluorosis || ''} onChange={(e) => handleChange('fluorosis', e.target.value)}>
                            <FormControlLabel value="Leve" control={<Radio size="small" />} label="Leve" onClick={() => handleClick('fluorosis', 'Leve')} />
                            <FormControlLabel value="Moderada" control={<Radio size="small" />} label="Moderada" onClick={() => handleClick('fluorosis', 'Moderada')} />
                            <FormControlLabel value="Severa" control={<Radio size="small" />} label="Severa" onClick={() => handleClick('fluorosis', 'Severa')} />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
        </>
    );
};