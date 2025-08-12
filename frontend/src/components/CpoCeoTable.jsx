// ===================================================================================
// == Archivo Actualizado: frontend/src/components/CpoCeoTable.jsx ==
// ===================================================================================
// @summary ✅ REFACTORIZACIÓN: Este componente se convierte en un componente
//          "tonto" (presentacional). Ya no maneja su propio estado, sino que
//          recibe los datos y las funciones de cambio desde su padre.

import React, { useMemo } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';

const CpoInput = ({ value, onChange }) => (
    <TextField
        type="number"
        variant="outlined"
        size="small"
        value={value}
        onChange={onChange}
        sx={{ width: '80px' }}
        inputProps={{ style: { textAlign: 'center' }, min: 0 }}
    />
);

export const CpoCeoTable = ({ cpoData, onCpoChange }) => {

    const handleInputChange = (field, value) => {
        // Notifica al componente padre del cambio
        onCpoChange({
            ...cpoData,
            [field]: value === '' ? '' : parseInt(value, 10)
        });
    };

    const totals = useMemo(() => {
        const cpoTotal = (Number(cpoData.cpo_c) || 0) + (Number(cpoData.cpo_p) || 0) + (Number(cpoData.cpo_o) || 0);
        const ceoTotal = (Number(cpoData.ceo_c) || 0) + (Number(cpoData.ceo_e) || 0) + (Number(cpoData.ceo_o) || 0);
        return { cpoTotal, ceoTotal };
    }, [cpoData]);

    return (
        <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Índices CPO-ceo</Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Dentición</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>C</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>P</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>O</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell align="center"><b>D</b></TableCell>
                            <TableCell align="center"><CpoInput value={cpoData.cpo_c ?? ''} onChange={(e) => handleInputChange('cpo_c', e.target.value)} /></TableCell>
                            <TableCell align="center"><CpoInput value={cpoData.cpo_p ?? ''} onChange={(e) => handleInputChange('cpo_p', e.target.value)} /></TableCell>
                            <TableCell align="center"><CpoInput value={cpoData.cpo_o ?? ''} onChange={(e) => handleInputChange('cpo_o', e.target.value)} /></TableCell>
                            <TableCell align="center"><b>{totals.cpoTotal}</b></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>c</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>e</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>o</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center"><b>d</b></TableCell>
                            <TableCell align="center"><CpoInput value={cpoData.ceo_c ?? ''} onChange={(e) => handleInputChange('ceo_c', e.target.value)} /></TableCell>
                            <TableCell align="center"><CpoInput value={cpoData.ceo_e ?? ''} onChange={(e) => handleInputChange('ceo_e', e.target.value)} /></TableCell>
                            <TableCell align="center"><CpoInput value={cpoData.ceo_o ?? ''} onChange={(e) => handleInputChange('ceo_o', e.target.value)} /></TableCell>
                            <TableCell align="center"><b>{totals.ceoTotal}</b></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};