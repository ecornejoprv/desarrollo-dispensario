// ===================================================================================
// == Nuevo Archivo: frontend/src/components/IhosTable.jsx ==
// ===================================================================================
// @summary Componente presentacional para la tabla IHO-S. Ha sido extraído
//          para mayor modularidad y limpieza del código.

import React, { useMemo } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const indexTeeth = [
  { p: ['16', '17'], t: '55' }, { p: ['11', '21'], t: '51' },
  { p: ['26', '27'], t: '65' }, { p: ['36', '37'], t: '75' },
  { p: ['31', '41'], t: '71' }, { p: ['46', '47'], t: '85' },
];

const IhosInput = ({ value, onChange, disabled }) => ( <TextField type="number" variant="outlined" size="small" value={value} onChange={onChange} disabled={disabled} sx={{ width: '60px' }} inputProps={{ style: { textAlign: 'center' } }} /> );

export const IhosTable = ({ selections, dentitionType, onToothSelect, onInputChange }) => {

    const totals = useMemo(() => {
        const selectedTeethWithValues = Object.values(selections).filter(values => values.placa !== '' || values.calculo !== '' || values.gingivitis !== '');
        const count = selectedTeethWithValues.length;
        if (count === 0) return { placa: '0.00', calculo: '0.00', gingivitis: '0.00' };
        const sums = selectedTeethWithValues.reduce((acc, values) => {
            acc.placa += Number(values.placa) || 0;
            acc.calculo += Number(values.calculo) || 0;
            acc.gingivitis += Number(values.gingivitis) || 0;
            return acc;
        }, { placa: 0, calculo: 0, gingivitis: 0 });
        return {
            placa: (sums.placa / count).toFixed(2),
            calculo: (sums.calculo / count).toFixed(2),
            gingivitis: (sums.gingivitis / count).toFixed(2),
        };
    }, [selections]);

    const renderToothSelector = (toothId, type) => {
        const isSelected = !!selections[toothId];
        return (<IconButton onClick={() => onToothSelect(toothId)} size="small">{isSelected ? <CheckCircleOutlineIcon color="primary" /> : <RadioButtonUncheckedIcon />}</IconButton>);
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>Índice de Higiene Oral Simplificado (IHO-S)</Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={3} align="center"><b>PIEZAS DENTALES</b></TableCell>
                            <TableCell align="center"><b>PLACA</b> (0-3, 9)</TableCell>
                            <TableCell align="center"><b>CÁLCULO</b> (0-3)</TableCell>
                            <TableCell align="center"><b>GINGIVITIS</b> (0-1)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {indexTeeth.map((row, index) => {
                            const selectedToothInRow = Object.keys(selections).find(k => [...row.p, row.t].includes(k));
                            const isRowActive = !!selectedToothInRow;
                            return (
                                <TableRow key={index}>
                                    <TableCell align="center">{row.p[0]} {renderToothSelector(row.p[0], 'Permanente')}</TableCell>
                                    <TableCell align="center">{row.p[1]} {renderToothSelector(row.p[1], 'Permanente')}</TableCell>
                                    <TableCell align="center">{row.t} {renderToothSelector(row.t, 'Temporal')}</TableCell>
                                    <TableCell align="center"><IhosInput value={isRowActive ? selections[selectedToothInRow].placa : ''} onChange={(e) => onInputChange(selectedToothInRow, 'placa', e.target.value)} disabled={!isRowActive} /></TableCell>
                                    <TableCell align="center"><IhosInput value={isRowActive ? selections[selectedToothInRow].calculo : ''} onChange={(e) => onInputChange(selectedToothInRow, 'calculo', e.target.value)} disabled={!isRowActive} /></TableCell>
                                    <TableCell align="center"><IhosInput value={isRowActive ? selections[selectedToothInRow].gingivitis : ''} onChange={(e) => onInputChange(selectedToothInRow, 'gingivitis', e.target.value)} disabled={!isRowActive} /></TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow>
                            <TableCell colSpan={3} align="right"><b>TOTAL</b></TableCell>
                            <TableCell align="center"><b>{totals.placa}</b></TableCell>
                            <TableCell align="center"><b>{totals.calculo}</b></TableCell>
                            <TableCell align="center"><b>{totals.gingivitis}</b></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};