import React, { useState } from 'react';
import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';

const Certificado = ({ 
  paciente = {}, 
  diagnosticos = [],
  medico = {}
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [diasReposo, setDiasReposo] = useState(3);
  
  // Datos del médico (puedes obtenerlos del localStorage o props)
  const datosMedico = {
    nombre: medico.nombre || localStorage.getItem('nombreMedico') || 'DR. MÉDICO',
    especialidad: medico.especialidad || localStorage.getItem('especialidadMedico') || 'MÉDICO GENERAL',
    ci: medico.ci || localStorage.getItem('ciMedico') || '',
    celular: medico.celular || localStorage.getItem('celularMedico') || '',
    email: medico.email || localStorage.getItem('emailMedico') || ''
  };

  const formatFechaTexto = (fecha) => {
    if (!fecha) return '';
    
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    
    const numerosATexto = {
      1: 'UNO', 2: 'DOS', 3: 'TRES', 4: 'CUATRO', 5: 'CINCO',
      6: 'SEIS', 7: 'SIETE', 8: 'OCHO', 9: 'NUEVE', 10: 'DIEZ',
      11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
      16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE', 20: 'VEINTE',
      21: 'VEINTIUNO', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO', 25: 'VEINTICINCO',
      26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE', 30: 'TREINTA',
      31: 'TREINTA Y UNO'
    };
    
    try {
      const dateObj = new Date(fecha);
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      
      const dayText = numerosATexto[day] || day;
      const monthText = meses[month - 1] || month;
      const yearText = `DOS MIL ${numerosATexto[year - 2000] || (year - 2000)}`;
      
      return `${dayText} DE ${monthText} DEL ${yearText}`;
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return fecha;
    }
  };

  const handlePrint = () => {
    const fechaActual = new Date();
    const fechaFinReposo = new Date();
    fechaFinReposo.setDate(fechaActual.getDate() + diasReposo);
    
    const printWindow = window.open();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .certificado-container {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #000;
              padding: 20px;
              position: relative;
              text-align: justify;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h2 {
              margin: 0;
              font-size: 16px;
            }
            .header h1 {
              margin: 5px 0;
              font-size: 20px;
              text-decoration: underline;
            }
            .contenido {
              font-size: 14px;
              line-height: 1.5;
              text-align: justify;
              text-justify: inter-word;
            }
            .certificacion {
              font-weight: bold;
              margin: 15px 0;
            }
            .form-group {
              margin-bottom: 10px;
              text-align: justify;
            }
            .form-group label {
              font-weight: bold;
              margin-right: 5px;
            }
            .reposo {
              margin: 20px 0;
              line-height: 1.5;
              text-align: justify;
            }
            .firma-container {
              margin-top: 50px;
              text-align: center;
            }
            .lineaFirma {
              border-top: 1px solid #000;
              width: 300px;
              margin: 5px 0 20px;
            }
            .datosMedico {
              margin-top: 20px;
              text-align: center;
            }
            .firma {
              margin-top: 50px;
              text-align: center;
            }
            .firma-line {
              border-top: 1px solid #000;
              width: 300px;
              margin: 0 auto;
              padding-top: 10px;
            }
            .underline {
              text-decoration: underline;
            }
            @media print {
              body {
                padding: 0;
              }
              .certificado-container {
                border: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificado-container">
            <div class="header">
              <h2>DISPENSARIO MEDICO PROCONGELADOS</h2>
              <h1>CERTIFICADO MÉDICO</h1>
            </div>

            <div class="contenido">
              <p class="certificacion">CERTIFICO:</p>

              <p>Que el/la señor(a) <strong>${paciente.pacie_nom_pacie} ${paciente.pacie_ape_pacie}</strong></p>

              <div class="form-group">
                <label>CÉDULA DE IDENTIDAD:</label>
                <span>${paciente.pacie_ced_pacie}</span>
              </div>

              <div class="form-group">
                <label>DIRECCIÓN DOMICILIARIA:</label>
                <span>${paciente.pacie_dir_pacie}</span>
              </div>

              <div class="form-group">
                <label>PUESTO DE TRABAJO:</label>
                <span>${paciente.pacie_puesto || 'NO ESPECIFICADO'}</span>
              </div>

              ${diagnosticos.length > 0 ? `
                <div class="form-group">
                  <label>DIAGNÓSTICO:</label>
                  <span>${diagnosticos[0].cie10_nom_cie10}</span>
                </div>

                <div class="form-group">
                  <label>CIE 10:</label>
                  <span>${diagnosticos[0].cie10_id_cie10}</span>
                </div>
              ` : ''}

              <div class="form-group">
                <label>TIPO DE CONTINGENCIA:</label>
                <span>ENFERMEDAD GENERAL</span>
              </div>

              <p class="reposo">
                Por prescripción médica de reposo, no puede concurrir a su trabajo el día ${fechaActual.toLocaleDateString('es-ES')} (<span class="underline">${formatFechaTexto(fechaActual.toISOString())}</span>) hasta el ${fechaFinReposo.toLocaleDateString('es-ES')} (<span class="underline">${formatFechaTexto(fechaFinReposo.toISOString())}</span>).
              </p>

              <div class="form-group">
                <label>TOTAL DE DÍAS DE REPOSO:</label>
                <span>${diasReposo} (<span class="underline">${formatFechaTexto(`1/${diasReposo}/2000`).split(' DE ')[0]}</span>) DÍAS</span>
              </div>

              <div class="firma-container">
                <p>Lugar y Fecha: <span class="underline">GUAYTACAMA, ${fechaActual.toLocaleDateString('es-ES')}</span></p>
                
                <div style="margin-top: 50px; text-align: center;">
                  <div class="firma-line"></div>
                  <p style="margin-top: 5px;">
                    <strong>${datosMedico.nombre}</strong><br />
                    ${datosMedico.especialidad}<br />
                    C.I. ${datosMedico.ci}
                  </p>
                </div>

                <div class="datosMedico">
                  ${datosMedico.celular ? `
                    <div class="form-group" style="text-align: center;">
                      <label>Celular:</label>
                      <span>${datosMedico.celular}</span>
                    </div>
                  ` : ''}

                  ${datosMedico.email ? `
                    <div class="form-group" style="text-align: center;">
                      <label>Correo electrónico:</label>
                      <span>${datosMedico.email}</span>
                    </div>
                  ` : ''}
                </div>

                <p class="firma">Firma, Código y Sello</p>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    setOpenDialog(false);
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Certificado Médico
        </Typography>
        
        <Typography variant="body1" paragraph>
          Genere un certificado médico con los datos de la atención actual.
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={diagnosticos.length === 0}
        >
          Generar Certificado
        </Button>
        
        {diagnosticos.length === 0 && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Debe agregar al menos un diagnóstico para generar el certificado.
          </Typography>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Configurar Certificado Médico</DialogTitle>
        <DialogContent>
          <TextField
            label="Días de reposo"
            type="number"
            value={diasReposo}
            onChange={(e) => setDiasReposo(Math.max(1, parseInt(e.target.value) || 1))}
            fullWidth
            margin="normal"
            inputProps={{ min: 1, max: 30 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            El certificado incluirá automáticamente:
          </Typography>
          <ul>
            <li>Datos del paciente: {paciente.pacie_nom_pacie} {paciente.pacie_ape_pacie}</li>
            <li>Diagnóstico: {diagnosticos[0]?.cie10_nom_cie10 || 'No disponible'}</li>
            <li>CIE10: {diagnosticos[0]?.cie10_id_cie10 || 'No disponible'}</li>
            <li>Médico: {datosMedico.nombre} - {datosMedico.especialidad}</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handlePrint} variant="contained" color="primary">
            Imprimir Certificado
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Certificado;