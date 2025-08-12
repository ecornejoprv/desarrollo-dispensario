// ===================================================================================
// == Archivo Completo: frontend/src/components/SymbolPalette.jsx ==
// ===================================================================================
// @summary ✅ CORRECCIÓN DE BUG VISUAL: Se corrige un error de tipeo en la
//          lógica de estilos que causaba que todos los botones de la paleta
//          aparecieran rellenos de color por defecto.

import React from 'react';
import { Paper, Typography, Grid, Tooltip, Button } from '@mui/material';
import { BackspaceOutlined } from '@mui/icons-material';

const renderSimboloPorNombre = (nombreEstado, color) => {
    const baseProps = { stroke: color, strokeWidth: "8", strokeLinecap: "round" };

    switch (nombreEstado) {
        case 'Caries': 
            return <circle cx="50" cy="50" r="25" {...baseProps} fill={color} />;
        
        case 'Obturado': 
            return <circle cx="50" cy="50" r="25" {...baseProps} fill={color} />;

        case 'Sellante necesario': 
        case 'Sellante realizado': 
            return <text x="50" y="140" fontSize="160" textAnchor="middle" fill={color} stroke="none">*</text>;

        case 'Extracción indicada': 
        case 'Pérdida por caries': 
            return <path d="M 20,20 L 80,80 M 80,20 L 20,80" {...baseProps} fill="none" />;

        case 'Pérdida otra causa necesaria': 
        case 'Pérdida otra causa realizada': 
            return (<g>
                <circle cx="50" cy="50" r="30" {...baseProps} fill="none" />
                <path d="M 35,35 L 65,65 M 65,35 L 35,65" {...baseProps} fill="none" />
            </g>);

        case 'Endodoncia necesaria': 
        case 'Endodoncia realizada': 
            return <path d="M 50,20 L 80,80 L 20,80 Z" {...baseProps} fill="none" />;

        case 'Corona necesaria': 
        case 'Corona realizada': 
            return (<g>
                <rect x="15" y="15" width="70" height="70" rx="5" {...baseProps} fill="none" />
                <rect x="30" y="30" width="40" height="40" rx="5" {...baseProps} fill="none" />
                <circle cx="50" cy="50" r="5" stroke="none" fill={color} />
            </g>);

        case 'Prótesis fija necesaria': 
        case 'Prótesis fija realizada': 
            return (<g {...baseProps} fill="none">
                <rect x="10" y="38" width="25" height="25" />
                <line x1="35" y1="50" x2="65" y2="50" />
                <rect x="65" y="38" width="25" height="25" />
            </g>);
            
        case 'Prótesis removible necesaria': 
        case 'Prótesis removible realizada': 
            return (<g {...baseProps} fill="none">
                <path d="M 35 20 A 20 30 0 0 0 35 80 M 65 20 A 20 30 0 0 1 65 80" />
                <line x1="40" y1="50" x2="60" y2="50" strokeDasharray="5, 4" />
            </g>);

        case 'Prótesis total necesaria': 
        case 'Prótesis total realizada': 
            return (<g {...baseProps} strokeWidth="10" fill="none">
                <line x1="15" y1="40" x2="85" y2="40" />
                <line x1="15" y1="60" x2="85" y2="60" />
            </g>);
            
        case 'Implante necesario': 
        case 'Implante realizado': 
            return (<path stroke={color} fill={color} strokeWidth="3" d=" M 35 15 L 65 15 L 65 25 L 70 30 L 65 35 L 70 40 L 65 45 L 70 50 L 65 55 L 70 60 L 65 65 L 50 85 L 35 65 L 30 60 L 35 55 L 30 50 L 35 45 L 30 40 L 35 35 L 30 30 L 35 25 Z " />);
        
        default: 
            return null;
    }
};

export const SymbolPalette = React.memo(({ estados, selectedTool, onSelectTool }) => {
    
    const eraserTool = {
        esden_cod_esden: 'ERASER',
        esden_nom_esden: 'Borrar / Limpiar',
        esden_des_esden: 'Haz clic en una superficie o diente para eliminar su estado actual.'
    };
    
    return (
        <Paper elevation={2} sx={{ p: 2, width: '100%' }}>
            <Typography variant="h6" gutterBottom align="center">Simbología</Typography>
            <Grid container spacing={1}>
                <Grid item xs={12} sm={4} md={2.4}>
                    <Tooltip title={eraserTool.esden_des_esden} arrow>
                        <Button
                            fullWidth
                            variant={selectedTool?.esden_cod_esden === eraserTool.esden_cod_esden ? "contained" : "outlined"}
                            color="warning"
                            onClick={() => onSelectTool(eraserTool)}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                            <BackspaceOutlined sx={{ marginRight: 1, flexShrink: 0 }} />
                            {eraserTool.esden_nom_esden}
                        </Button>
                    </Tooltip>
                </Grid>

                {estados.map((estado) => (
                    <Grid item xs={12} sm={4} md={2.4} key={estado.esden_cod_esden}>
                        <Tooltip title={estado.esden_des_esden || estado.esden_nom_esden} arrow>
                            <Button
                                fullWidth
                                variant={selectedTool?.esden_cod_esden === estado.esden_cod_esden ? "contained" : "outlined"}
                                onClick={() => onSelectTool(estado)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    borderColor: estado.esden_col_esden,
                                    // ✅ CORRECCIÓN: Se usa 'esden_cod_esden' en lugar de 'esden__esden'
                                    color: selectedTool?.esden_cod_esden === estado.esden_cod_esden ? '#fff' : estado.esden_col_esden,
                                    backgroundColor: selectedTool?.esden_cod_esden === estado.esden_cod_esden ? estado.esden_col_esden : 'transparent',
                                    '&:hover': {
                                        backgroundColor: selectedTool?.esden_cod_esden !== estado.esden_cod_esden ? `${estado.esden_col_esden}1A` : undefined,
                                    },
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 100 100" style={{ marginRight: 8, flexShrink: 0 }}>
                                    {renderSimboloPorNombre(estado.esden_nom_esden, estado.esden_col_esden, {})}
                                </svg>
                                {estado.esden_nom_esden}
                            </Button>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
});