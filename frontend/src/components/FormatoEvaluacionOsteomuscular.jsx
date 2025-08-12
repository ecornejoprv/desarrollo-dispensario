import React, { useEffect } from 'react';
import { Box, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Este componente está diseñado exclusivamente para la impresión.
// Recibe los datos y los maqueta en el formato A4 solicitado.
export const FormatoEvaluacionOsteomuscular = ({ evaluacion, paciente, empleado, onPrintFinish }) => {

    useEffect(() => {
        // Un pequeño retardo para asegurar que el DOM se renderice completamente antes de imprimir.
        const timer = setTimeout(() => {
            window.print();
            onPrintFinish();
        }, 150);

        return () => clearTimeout(timer);
    }, [evaluacion, paciente, empleado, onPrintFinish]);

    const DatoGeneralItem = ({ etiqueta, valor, flex = 1 }) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', flex: flex, mr: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '10pt', whiteSpace: 'nowrap' }}>{etiqueta}:</Typography>
            <Typography variant="body2" sx={{ borderBottom: '1px dotted #000', width: '100%', ml: 1, fontSize: '10pt', lineHeight: '1.2' }}>
                {valor || ''}
            </Typography>
        </Box>
    );
    
    return (
        <div className="print-container">
            <style>
                {`
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 1cm;
                        }
                        body * {
                            visibility: hidden;
                        }
                        .print-container, .print-container * {
                            visibility: visible;
                        }
                        .print-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .print-table {
                            width: 100%;
                            border-collapse: collapse;
                            page-break-inside: auto; 
                        }
                        .print-table th, .print-table td {
                            border: 1px solid black;
                            padding: 3px;
                            font-size: 8pt; 
                            text-align: center;
                            vertical-align: middle;
                        }
                        .print-table thead {
                            display: table-header-group; 
                        }
                        .print-table tbody tr {
                            page-break-inside: avoid; 
                        }
                        .seccion-sin-corte {
                            page-break-inside: avoid;
                        }
                    }
                `}
            </style>

            <Box className="seccion-impresion">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Box sx={{ flex: 1, textAlign: 'left' }}><img src="/nintanga.jpg" alt="Logo Nintanga" style={{ height: '45px' }} /></Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}><img src="/provefrut.jpg" alt="Logo Provefrut" style={{ height: '40px' }} /></Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}><img src="/procongelados.jpg" alt="Logo Procongelados" style={{ height: '40px' }} /></Box>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1, borderBottom: '2px solid black', pb: 1, width: '100%', textAlign: 'center' }}>
                        REGISTRO DE EVALUACIÓN OSTEOMUSCULAR
                    </Typography>
                </Box>
                
                <Box className="seccion-sin-corte">
                    <Typography variant="h6" sx={{ mt: 1, mb: 0.5, fontSize: '12pt' }}>DATOS GENERALES</Typography>
                    <Box sx={{ border: '1px solid #ccc', p: 1, mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><DatoGeneralItem etiqueta="Fecha" valor={evaluacion && new Date(evaluacion.evalost_fec_eval).toLocaleDateString('es-EC')} flex={1}/><DatoGeneralItem etiqueta="Nombres" valor={`${paciente?.pacie_nom_pacie || ''} ${paciente?.pacie_ape_pacie || ''}`} flex={3}/></Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><DatoGeneralItem etiqueta="Nº de Cédula" valor={paciente?.pacie_ced_pacie} flex={1.5}/><DatoGeneralItem etiqueta="Fecha de Nacimiento" valor={paciente?.pacie_fec_nac ? new Date(paciente.pacie_fec_nac).toLocaleDateString('es-EC') : ''} flex={1.5}/><DatoGeneralItem etiqueta="Edad" valor={paciente?.pacie_fec_nac ? `${new Date().getFullYear() - new Date(paciente.pacie_fec_nac).getFullYear()} años` : ''} flex={1}/></Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><DatoGeneralItem etiqueta="Área" valor={empleado?.departamento || 'N/A'} flex={2}/><DatoGeneralItem etiqueta="Puesto de Trabajo" valor={empleado?.cargo || 'N/A'} flex={2}/><DatoGeneralItem etiqueta="Fecha de Ingreso" valor={empleado?.fechaIngreso ? new Date(empleado.fechaIngreso).toLocaleDateString('es-EC') : 'N/A'} flex={1.5}/></Box>
                    </Box>
                </Box>
                
                <Box className="seccion-sin-corte">
                    <Typography variant="h6" sx={{ mt: 1, mb: 0.5, fontSize: '12pt' }}>ANAMNESIS</Typography>
                    <Grid container spacing={2} sx={{ mb: 1 }}>
                        <Grid item xs={6}><Box sx={{ border: '1px solid #ccc', p: 1, height: '100%' }}><Typography variant="body2" sx={{ fontSize: '10pt' }}><b>Antecedentes patológicos personales:</b><br/>{evaluacion.evalost_ant_patologicos || ' '}</Typography></Box></Grid>
                        <Grid item xs={6}><Box sx={{ border: '1px solid #ccc', p: 1, height: '100%' }}><Typography variant="body2" sx={{ fontSize: '10pt' }}><b>Sintomatología actual:</b><br/>{evaluacion.evalost_sintomatologia_actual || ' '}</Typography></Box></Grid>
                    </Grid>
                </Box>

                <Box>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontSize: '12pt' }}>EXAMEN FÍSICO</Typography>
                    <TableContainer>
                        <Table size="small" className="print-table">
                            {/* --> CABECERA DE TABLA RESTAURADA Y CORREGIDA --- */}
                            <TableHead>
                                <TableRow>
                                    <TableCell rowSpan={2}><b>ZONAS</b></TableCell>
                                    <TableCell><b>OBSERVACIÓN</b></TableCell>
                                    <TableCell colSpan={5}><b>PALPACIÓN</b></TableCell>
                                    <TableCell><b>INSPECCIÓN</b></TableCell>
                                    <TableCell><b>MOVILIDAD</b></TableCell>
                                    <TableCell rowSpan={2}><b>OBSERVACIÓN</b></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>asimetrías</TableCell>
                                    <TableCell>Dolor / Escala</TableCell>
                                    <TableCell>Tipo de dolor</TableCell>
                                    <TableCell>Hormigueo o adormecimiento</TableCell>
                                    <TableCell>Irradiación</TableCell>
                                    <TableCell>Frecuencia</TableCell>
                                    <TableCell>Pruebas Funcionales</TableCell>
                                    <TableCell>Escala de Daniels<br/>(Fuerza muscular y movilidad)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {evaluacion.detalles.map(d => (
                                    <TableRow key={d.det_evalost_zona}>
                                        <TableCell sx={{ textAlign: 'left' }}>{d.det_evalost_zona}</TableCell>
                                        <TableCell>{d.det_evalost_asimetria ? 'Si' : 'No'}</TableCell>
                                        <TableCell>{d.det_evalost_dolor_escala}</TableCell>
                                        <TableCell sx={{textAlign: 'left', wordBreak: 'break-word'}}>{d.det_evalost_tipo_dolor}</TableCell>
                                        <TableCell>{d.det_evalost_hormigueo ? 'Si' : 'No'}</TableCell>
                                        <TableCell>{d.det_evalost_irradiacion ? 'Si' : 'No'}</TableCell>
                                        <TableCell sx={{textAlign: 'left', wordBreak: 'break-word'}}>{d.det_evalost_frecuencia}</TableCell>
                                        <TableCell sx={{textAlign: 'left', wordBreak: 'break-word'}}>{d.det_evalost_pruebas_funcionales}</TableCell>
                                        <TableCell>{d.det_evalost_escala_daniels}</TableCell>
                                        <TableCell sx={{textAlign: 'left', wordBreak: 'break-word'}}>{d.det_evalost_obs_zona}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <div className="seccion-sin-corte">
                    <Grid container spacing={1} sx={{ mt: 2, fontSize: '10pt' }}>
                        <Grid item xs={6}>¿Cuál es su lado dominante?  <b>{evaluacion.evalost_lado_dominante || ''}</b></Grid>
                        <Grid item xs={6}>¿Tiene conocimiento del riesgo de malas posturas?  <b>{evaluacion.evalost_conoce_malas_posturas || ''}</b></Grid>
                        <Grid item xs={6}>¿Dispone de Lavadora?  <b>{evaluacion.evalost_tiene_lavadora === null ? 'No aplica' : (evaluacion.evalost_tiene_lavadora ? 'Si' : 'No')}</b></Grid>
                        <Grid item xs={6}>¿Conoce la correcta Manipulación Manual de Carga?  <b>{evaluacion.evalost_conoce_manip_carga || ''}</b></Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 4, mb: 1, textAlign: 'center', pageBreakBefore: 'avoid' }}>VALORACIÓN NUTRICIONAL</Typography>
                    <TableContainer component={Paper} sx={{ width: '50%', margin: '0 auto' }}>
                        <Table size="small" className="print-table">
                            <TableHead><TableRow><TableCell><b>MEDIDAS</b></TableCell><TableCell><b>RESULTADOS</b></TableCell></TableRow></TableHead>
                            <TableBody>
                                <TableRow><TableCell sx={{ textAlign: 'left' }}>Talla</TableCell><TableCell>{evaluacion.evalost_talla_nutri || ''}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ textAlign: 'left' }}>Peso</TableCell><TableCell>{evaluacion.evalost_peso_nutri || ''}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ textAlign: 'left' }}>IMC</TableCell><TableCell>{evaluacion.evalost_imc_nutri || ''}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ textAlign: 'left' }}>Body Fat</TableCell><TableCell>{evaluacion.evalost_grasa_corporal_nutri || ''}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ textAlign: 'left' }}>Muscle</TableCell><TableCell>{evaluacion.evalost_musculo_nutri || ''}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ textAlign: 'left' }}>Body Age</TableCell><TableCell>{evaluacion.evalost_edad_corporal_nutri || ''}</TableCell></TableRow>
                                <TableRow><TableCell sx={{ textAlign: 'left' }}>Visceral Fat</TableCell><TableCell>{evaluacion.evalost_grasa_visceral_nutri || ''}</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                
                <Box className="seccion-sin-corte" sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', mt: 'auto', pt: '80px' }}>
                    <Box sx={{ textAlign: 'center' }}><Box sx={{ fontWeight: 'bold', borderTop: '1px solid black', width: '250px', pt: 1, fontSize: '10pt' }}>Firma del Paciente</Box></Box>
                    <Box sx={{ textAlign: 'center' }}><Box sx={{ fontWeight: 'bold', borderTop: '1px solid black', width: '250px', pt: 1, fontSize: '10pt' }}>Firma del Evaluador</Box></Box>
                </Box>
            </Box>
        </div>
    );
}