// src/components/Tooth.jsx (Código Absolutamente Completo y Corregido)
// ===================================================================================
// @summary: Se corrige el warning de React sobre la falta de una 'key' única en
//           una lista. Se añade 'key={superficie.suden_cod_suden}' al elemento <g>
//           raíz dentro del bucle .map() que renderiza las superficies del diente.
//           Esto permite a React optimizar el renderizado y elimina el error de consola.
// ===================================================================================

import React, { useState, useEffect } from 'react';
import { Box, Typography, Tooltip, TextField } from '@mui/material';

const renderSimboloPorNombre = (nombreEstado, color, { dienteId, prosthesisInfo }) => {
    const props = { stroke: color, fill: "none", strokeWidth: "8", strokeLinecap: "round" };
    switch (nombreEstado) {
        case 'Caries': return <circle cx="50" cy="50" r="25" {...props} fill={color} />;
        case 'Obturado': return <circle cx="50" cy="50" r="25" {...props} fill={color} />;
        case 'Sellante necesario': case 'Sellante realizado': return <text x="50" y="125" fontSize="150" textAnchor="middle" fill={color} stroke="none">*</text>;
        case 'Extracción indicada': case 'Pérdida por caries': return <path d="M 20,20 L 80,80 M 80,20 L 20,80" {...props} />;
        case 'Pérdida otra causa necesaria': case 'Pérdida otra causa realizada': return (<g><circle cx="50" cy="50" r="30" {...props} /><path d="M 35,35 L 65,65 M 65,35 L 35,65" {...props} /></g>);
        case 'Endodoncia necesaria': case 'Endodoncia realizada': return <path d="M 50,20 L 80,80 L 20,80 Z" {...props} />;
        case 'Corona necesaria': case 'Corona realizada': return (<g><rect x="15" y="15" width="70" height="70" rx="5" {...props} /><rect x="30" y="30" width="40" height="40" rx="5" {...props} /><circle cx="50" cy="50" r="5" fill={color} stroke="none" /></g>);
        
        case 'Prótesis fija necesaria': 
        case 'Prótesis fija realizada':
            return <line x1="0" y1="50" x2="100" y2="50" {...props} strokeWidth="10" />;

        case 'Prótesis removible necesaria':
        case 'Prótesis removible realizada':
            const cuadrante = Math.floor(parseInt(dienteId, 10) / 10);
            const esCuadranteDerecho = cuadrante === 1 || cuadrante === 4 || cuadrante === 5 || cuadrante === 8;
            const pilarProps = { ...props, strokeWidth: "10" };
            const pilarParentesisIzq = <path d="M 30 15 C 10 30, 10 70, 30 85" {...pilarProps} />;
            const pilarParentesisDer = <path d="M 70 15 C 90 30, 90 70, 70 85" {...pilarProps} />;

            if (prosthesisInfo?.role === 'pontico') {
                return <line x1="0" y1="50" x2="100" y2="50" {...pilarProps} />;
            }
            if (prosthesisInfo?.position === 'inicio') {
                return esCuadranteDerecho
                    ? <g>{pilarParentesisDer}<line x1="0" y1="50" x2="75" y2="50" {...pilarProps} /></g>
                    : <g>{pilarParentesisIzq}<line x1="25" y1="50" x2="100" y2="50" {...pilarProps} /></g>;
            }
            if (prosthesisInfo?.position === 'fin') {
                return esCuadranteDerecho
                    ? <g>{pilarParentesisIzq}<line x1="25" y1="50" x2="100" y2="50" {...pilarProps} /></g>
                    : <g>{pilarParentesisDer}<line x1="0" y1="50" x2="75" y2="50" {...pilarProps} /></g>;
            }
            return <line x1="0" y1="50" x2="100" y2="50" {...pilarProps} />;

        case 'Prótesis total necesaria': case 'Prótesis total realizada': return (<g strokeWidth="10" {...props} fill="none"><line x1="15" y1="40" x2="85" y2="40" /><line x1="15" y1="60" x2="85" y2="60" /></g>);
        case 'Implante necesario': case 'Implante realizado': return (<path fill={color} stroke={color} strokeWidth="3" d=" M 35 15 L 65 15 L 65 25 L 70 30 L 65 35 L 70 40 L 65 45 L 70 50 L 65 55 L 70 60 L 65 65 L 50 85 L 35 65 L 30 60 L 35 55 L 30 50 L 35 45 L 30 40 L 35 35 L 30 30 L 35 25 Z " />);
        default: return null;
    }
};

const getSurfaceMappings = (dienteId) => {
    const num = parseInt(dienteId, 10);
    if (isNaN(num)) return {};
    let mapping = {};
    if (num >= 51 && num <= 55) { mapping = { top: 'Vestibular', bottom: 'Palatino', left: 'Distal', right: 'Mesial', center: 'Oclusal' }; if ([51, 52, 53].includes(num)) mapping.center = 'Incisal'; } 
    else if (num >= 61 && num <= 65) { mapping = { top: 'Vestibular', bottom: 'Palatino', left: 'Mesial', right: 'Distal', center: 'Oclusal' }; if ([61, 62, 63].includes(num)) mapping.center = 'Incisal'; } 
    else if (num >= 71 && num <= 75) { mapping = { top: 'Lingual', bottom: 'Vestibular', left: 'Mesial', right: 'Distal', center: 'Oclusal' }; if ([71, 72, 73].includes(num)) mapping.center = 'Incisal'; } 
    else if (num >= 81 && num <= 85) { mapping = { top: 'Lingual', bottom: 'Vestibular', left: 'Distal', right: 'Mesial', center: 'Oclusal' }; if ([81, 82, 83].includes(num)) mapping.center = 'Incisal'; } 
    else if (num >= 11 && num <= 18) { mapping = { top: 'Vestibular', bottom: 'Palatino', left: 'Distal', right: 'Mesial', center: 'Oclusal' }; if ([11, 12, 13].includes(num)) mapping.center = 'Incisal'; } 
    else if (num >= 21 && num <= 28) { mapping = { top: 'Vestibular', bottom: 'Palatino', left: 'Mesial', right: 'Distal', center: 'Oclusal' }; if ([21, 22, 23].includes(num)) mapping.center = 'Incisal'; } 
    else if (num >= 31 && num <= 38) { mapping = { top: 'Lingual', bottom: 'Vestibular', left: 'Mesial', right: 'Distal', center: 'Oclusal' }; if ([31, 32, 33].includes(num)) mapping.center = 'Incisal'; } 
    else if (num >= 41 && num <= 48) { mapping = { top: 'Lingual', bottom: 'Vestibular', left: 'Distal', right: 'Mesial', center: 'Oclusal' }; if ([41, 42, 43].includes(num)) mapping.center = 'Incisal'; }
    return mapping;
};

const POSITIONAL_SQUARE_SHAPES = { top: "0,0 100,0 70,30 30,30", bottom: "0,100 100,100 70,70 30,70", left: "0,0 30,30 30,70 0,100", right: "100,0 70,30 70,70 100,100", center: "30,30 70,30 70,70 30,70" };

const calculatePolygonCentroid = (pointsStr) => {
    const points = pointsStr.split(' ').map(p => p.split(',').map(Number));
    let x = 0, y = 0;
    points.forEach(p => { x += p[0]; y += p[1]; });
    return { cx: x / points.length, cy: y / points.length };
};

export const Tooth = React.memo(({ diente, detallesDiente, onSurfaceClick, onToothClick, superficies, perioData, editMode, onUpdatePerioData, overrideState, prosthesisInfo }) => {
    const size = 80;
    const toothState = detallesDiente.find(d => d.superficie === null);
    const finalStateToRender = overrideState || toothState;

    const [movilidad, setMovilidad] = useState(perioData?.movilidad || '');
    const [recesion, setRecesion] = useState(perioData?.recesion || '');

    useEffect(() => {
        setMovilidad(perioData?.movilidad || '');
        setRecesion(perioData?.recesion || '');
    }, [perioData]);

    const handlePerioChange = (field) => (event) => {
        const value = event.target.value;
        if (field === 'movilidad') {
            setMovilidad(value);
        } else {
            setRecesion(value);
        }
    };

    const handlePerioBlur = () => {
        if (editMode && onUpdatePerioData) {
            onUpdatePerioData(diente.diente_cod_diente, movilidad, recesion);
        }
    };

    const handlePerioKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.target.blur();
        }
    };

    const surfaceMap = getSurfaceMappings(diente.diente_id_diente);
    const positionMap = Object.entries(surfaceMap).reduce((acc, [pos, name]) => ({ ...acc, [name.toLowerCase()]: pos }), {});
    const perioBoxStyle = {
        border: 1, borderColor: 'grey.400', width: 24, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px'
    };

    return (
        <Box 
            onClick={() => onToothClick && onToothClick(diente.diente_id_diente)}
            sx={{ 
                position: 'relative', m: 0.5, display: 'flex', flexDirection: 'column', 
                alignItems: 'center', cursor: editMode ? 'pointer' : 'default',
                '&:hover': { transform: editMode ? 'scale(1.1)' : 'none', zIndex: editMode ? 10 : 1 } 
            }}
        >
            <Box sx={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '2px', mb: 0.5, minHeight: '54px'
            }}>
                {editMode ? (
                    <>
                        <TextField
                            variant="outlined" size="small" value={recesion} onChange={handlePerioChange('recesion')} 
                            onBlur={handlePerioBlur} onKeyDown={handlePerioKeyDown}
                            sx={{ width: '35px', borderRadius: '4px', '& .MuiInputBase-input': { p: '4px', textAlign: 'center' } }}
                            placeholder="R" inputProps={{ maxLength: 2 }} onClick={(e) => e.stopPropagation()}
                        />
                        <TextField
                            variant="outlined" size="small" value={movilidad} onChange={handlePerioChange('movilidad')}
                            onBlur={handlePerioBlur} onKeyDown={handlePerioKeyDown}
                            sx={{ width: '35px', borderRadius: '4px', '& .MuiInputBase-input': { p: '4px', textAlign: 'center' } }}
                            placeholder="M" inputProps={{ maxLength: 2 }} onClick={(e) => e.stopPropagation()}
                        />
                    </>
                ) : (
                    <>
                        <Box sx={perioBoxStyle}><Typography variant="caption" sx={{ color: recesion ? 'text.primary' : 'text.disabled', fontWeight: 'medium' }}>{recesion || ''}</Typography></Box>
                        <Box sx={perioBoxStyle}><Typography variant="caption" sx={{ color: movilidad ? 'text.primary' : 'text.disabled', fontWeight: 'medium' }}>{movilidad || ''}</Typography></Box>
                    </>
                )}
            </Box>
            <Typography variant="caption" component="div" align="center" sx={{ fontWeight: 'bold' }}>
                {diente.diente_id_diente}
            </Typography>
            <svg width={size} height={size} viewBox="0 0 100 100">
                {superficies.map(superficie => {
                    const clinicalName = superficie.suden_nom_suden;
                    const positionKey = positionMap[clinicalName.toLowerCase()];
                    if (!positionKey) return null;
                    
                    const isPartOfProsthesis = !!overrideState || (toothState && toothState.estado.includes('Prótesis'));
                    const surfaceState = isPartOfProsthesis ? null : detallesDiente.find(d => d.superficie === clinicalName);
                    
                    const shapeData = POSITIONAL_SQUARE_SHAPES[positionKey];
                    if (!shapeData) return null;
                    const centroid = surfaceState ? calculatePolygonCentroid(shapeData) : null;
                    
                    const handleSurfaceClickInternal = (e) => {
                        e.stopPropagation();
                        if (finalStateToRender || !editMode) return;
                        onSurfaceClick(diente.diente_id_diente, superficie.suden_cod_suden);
                    };

                    // --- CAMBIO CLAVE: Se añade la prop 'key' única al elemento <g> ---
                    // Justificación: React necesita una 'key' única para cada elemento en una lista
                    // para poder identificarlo y optimizar las actualizaciones del DOM.
                    // Usamos el ID de la superficie (suden_cod_suden) que es único.
                    return (        
                        <g key={superficie.suden_cod_suden} onClick={handleSurfaceClickInternal} style={{ cursor: (finalStateToRender || !editMode) ? 'not-allowed' : 'pointer' }}>
                            <polygon points={shapeData} fill={surfaceState ? '#E0E0E0' : (finalStateToRender ? '#f0f0f0' : '#fff')} stroke="#999" strokeWidth="1" />
                            {surfaceState && centroid && (
                                <g transform={`translate(${centroid.cx}, ${centroid.cy}) scale(0.5) translate(-50, -50)`}>
                                    {renderSimboloPorNombre(surfaceState.estado, surfaceState.colorEstado, {})}
                                </g>
                            )}
                        </g>
                    );
                })}
                
                {finalStateToRender && renderSimboloPorNombre(
                    finalStateToRender.estado,
                    finalStateToRender.colorEstado,
                    {
                        dienteId: diente.diente_id_diente,
                        prosthesisInfo: prosthesisInfo
                    }
                )}
            </svg>
        </Box>
    );
});