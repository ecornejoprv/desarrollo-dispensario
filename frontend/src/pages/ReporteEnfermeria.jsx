import React, { useState, useEffect, useMemo } from "react"; // 1. Se importa useMemo
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Search,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import api from "../api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReporteEnfermeria = () => {
  // --- ESTADOS DEL COMPONENTE ---
  const [reporteData, setReporteData] = useState([]);
  const [filters, setFilters] = useState({
    fechaDesde: "",
    fechaHasta: "",
    medicoId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    totalPostConsulta: 0, 
    totalGeneral: 0,   
  });
  const LIMIT = 15; // Registros por página

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const { data } = await api.get("/api/v1/citas/staff/enfermeria");
        setNurses(data.data || []);
      } catch (err) {
        console.error("Error al cargar personal de enfermería:", err);
      }
    };
    fetchNurses();
  }, []);

  // Vuelve a cargar los datos si la página cambia.
  useEffect(() => {
    if (filters.fechaDesde && filters.fechaHasta) {
      handleGenerateReport();
    }
  }, [page]); // Se dispara solo cuando 'page' cambia.

  // --- MANEJADORES ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async (isNewSearch = false) => {
    if (isNewSearch && page !== 1) {
      setPage(1);
      return;
    }
    
    if (!filters.fechaDesde || !filters.fechaHasta) {
      alert("Por favor, seleccione un rango de fechas.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, page, limit: LIMIT };
      if (!params.medicoId) delete params.medicoId; // Se asegura de no enviar medicoId vacío

      const { data } = await api.get('/api/v1/atenciones/reporte-enfermeria', { params });
      
      setReporteData(data.data || []);
      // Se guarda el objeto de paginación completo que viene del backend.
      setPagination(data.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, totalPostConsulta: 0, totalGeneral: 0 });
    } catch (err) {
      console.error('Error al generar el reporte:', err);
      setError('Error al cargar los datos. Verifique la consola.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    // 1. Si no hay fecha, se devuelve 'N/A'. Esto no cambia.
    if (!dateString) return "N/A";

    // 2. CORRECCIÓN CLAVE: Al crear el objeto Date, le indicamos explícitamente
    //    que la fecha que viene de la base de datos es UTC. Lo hacemos
    //    añadiendo una 'Z' al final de la cadena de texto de la fecha.
    //    Esto asegura que JavaScript no la interprete erróneamente como una fecha local.
    const dateInUTC = new Date(
      dateString.endsWith("Z") ? dateString : dateString + "Z"
    );

    // 3. Se usa toLocaleString, que automáticamente convierte la fecha UTC
    //    a la zona horaria del navegador del usuario (en tu caso, Ecuador UTC-5).
    return dateInUTC.toLocaleString("es-EC", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Opcional: para formato de 24 horas
    });
  };

  // --- FUNCIONES DE EXPORTACIÓN (requieren obtener TODOS los datos) ---
  const fetchAllDataForExport = async () => {
    try {
      // Llama al mismo endpoint pero con un límite muy alto para obtener todos los datos.
      const params = { ...filters, page: 1, limit: 10000 };
      const { data } = await api.get("/api/v1/atenciones/reporte-enfermeria", {
        params,
      });
      return data.data || [];
    } catch (error) {
      console.error("Error al obtener todos los datos para exportar:", error);
      return [];
    }
  };

  // --- FUNCIONES DE EXPORTACIÓN ---
  const exportToExcel = async () => {
    // 1. Muestra un mensaje al usuario y obtiene todos los datos sin paginar.
    alert("Preparando reporte avanzado para Excel. Por favor, espera...");
    const allData = await fetchAllDataForExport();

    if (allData.length === 0) {
      alert("No hay datos para exportar con los filtros seleccionados.");
      return;
    }

    // --- PREPARACIÓN DEL LIBRO DE EXCEL ---
    // Se crea un nuevo "libro de trabajo" vacío.
    const wb = XLSX.utils.book_new();

    // --- HOJA 1: REPORTE DETALLADO (Sin cambios) ---
    // Esta es la misma lógica que ya tenías para la primera hoja.
    const worksheetDataDetalle = allData.map((row, index) => ({
      '#': index + 1,
      'Fecha y Hora': formatDate(row.post_fec_post),
      'Paciente': row.paciente_nombre_completo,
      'Actividad': row.actividad_nombre,
      'Observaciones': row.observaciones || '-',
      'Profesional': row.profesional_nombre,
      'Tipo de Registro': row.tipo_registro,
    }));
    const ws_detalle = XLSX.utils.json_to_sheet(worksheetDataDetalle);
    XLSX.utils.book_append_sheet(wb, ws_detalle, "Detalle de Actividades");


    // --- NUEVA HOJA 2: RESUMEN POR ACTIVIDAD ---
    // Se agrupan los datos para contar cuántas veces se realizó cada actividad.
    const resumenPorActividad = allData.reduce((acc, row) => {
      // Se obtiene el nombre de la actividad de la fila actual.
      const actividad = row.actividad_nombre;
      // Si la actividad ya existe en el acumulador, se suma 1. Si no, se inicializa en 1.
      acc[actividad] = (acc[actividad] || 0) + 1;
      return acc;
    }, {});

    // Se convierte el objeto de conteos a un array con el formato para la hoja de Excel.
    const worksheetDataActividad = Object.entries(resumenPorActividad)
      .map(([actividad, total]) => ({
        'Actividad': actividad,
        'Total Registros': total,
      }))
      // Se ordena de mayor a menor número de registros.
      .sort((a, b) => b['Total Registros'] - a['Total Registros']);
    
    const ws_actividad = XLSX.utils.json_to_sheet(worksheetDataActividad);
    XLSX.utils.book_append_sheet(wb, ws_actividad, "Resumen por Actividad");


    // --- NUEVA HOJA 3: RESUMEN POR PROFESIONAL (Tabla Dinámica) ---
    // Paso A: Obtener una lista de todas las actividades únicas para usarlas como columnas.
    const todasLasActividades = [...new Set(allData.map(row => row.actividad_nombre))].sort();

    // Paso B: Agrupar todas las actividades y sus conteos por cada profesional.
    const resumenPorProfesional = allData.reduce((acc, row) => {
      const profesional = row.profesional_nombre;
      const actividad = row.actividad_nombre;

      // Si el profesional no existe en el acumulador, se crea su entrada.
      if (!acc[profesional]) {
        acc[profesional] = {};
      }
      // Se cuenta la actividad específica para ese profesional.
      acc[profesional][actividad] = (acc[profesional][actividad] || 0) + 1;
      return acc;
    }, {});
    
    // Paso C: Formatear los datos agrupados en filas para la hoja de Excel.
    const worksheetDataProfesional = Object.entries(resumenPorProfesional).map(([profesional, actividades]) => {
      // Se crea la fila base con el nombre del profesional.
      const row = { 'Profesional': profesional };
      let totalGeneral = 0;

      // Se recorre la lista de actividades únicas para crear las columnas.
      todasLasActividades.forEach(actividad => {
        // Se asigna el conteo de esa actividad para el profesional actual, o 0 si no la realizó.
        const count = actividades[actividad] || 0;
        row[actividad] = count;
        totalGeneral += count;
      });
      
      // Se añade la columna de total al final.
      row['TOTAL'] = totalGeneral;
      return row;
    });

    const ws_profesional = XLSX.utils.json_to_sheet(worksheetDataProfesional);
    XLSX.utils.book_append_sheet(wb, ws_profesional, "Resumen por Profesional");

    // --- DESCARGAR EL ARCHIVO EXCEL CON LAS 3 HOJAS ---
    XLSX.writeFile(wb, `Reporte_Enfermeria_Avanzado_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPDF = async () => {
    // 1. Muestra un mensaje al usuario mientras se preparan los datos.
    alert(
      "Preparando todos los datos para la exportación a PDF. Esto puede tardar un momento..."
    );

    // 2. Llama a la función auxiliar para obtener TODOS los registros sin paginación.
    const allData = await fetchAllDataForExport();

    // 3. Verifica si hay datos para exportar.
    if (allData.length === 0) {
      alert("No hay datos para exportar con los filtros seleccionados.");
      return;
    }

    // 4. Crea una nueva instancia del documento PDF en orientación horizontal.
    const doc = new jsPDF({ orientation: "landscape" });

    // 5. Define las cabeceras de la tabla que se mostrarán en el PDF.
    const tableColumn = [
      "#",
      "Fecha y Hora",
      "Paciente",
      "Actividad",
      "Observaciones",
      "Profesional",
      "Tipo",
    ];

    // 6. Mapea los datos del backend al formato de array de arrays que requiere la librería jspdf-autotable.
    const tableRows = allData.map((row, index) => [
      index + 1,
      formatDate(row.post_fec_post),
      row.paciente_nombre_completo,
      row.actividad_nombre,
      row.observaciones || "-", // Asegura que no haya valores nulos
      row.profesional_nombre,
      row.tipo_registro,
    ]);

    // 7. Añade el título principal al documento.
    doc.text("Reporte de Actividades de Enfermería", 14, 15);

    // 8. Usa la función autoTable para generar la tabla en el PDF a partir de las cabeceras y las filas.
    doc.autoTable({
      head: [tableColumn], // Define las cabeceras.
      body: tableRows, // Define los datos de las filas.
      startY: 20, // Posición vertical donde empieza la tabla.
      styles: { fontSize: 8, cellPadding: 1.5, overflow: "linebreak" }, // Estilos generales para las celdas.
      headStyles: { fillColor: [44, 62, 80] }, // Color de fondo oscuro para la cabecera.
      columnStyles: {
        // Define anchos de columna para un mejor layout
        0: { cellWidth: 10 }, // #
        2: { cellWidth: 40 }, // Paciente
        3: { cellWidth: 40 }, // Actividad
        4: { cellWidth: "auto" }, // Observaciones (ancho automático)
        5: { cellWidth: 40 }, // Profesional
      },
    });

    // 9. Inicia la descarga del archivo .pdf con un nombre dinámico.
    doc.save(`Reporte_Enfermeria_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const groupedReportData = useMemo(() => {
    // Si no hay datos, devuelve un array vacío.
    if (!reporteData || reporteData.length === 0) {
      return [];
    }

    // Se usa un objeto para agrupar las actividades por una clave única.
    // La clave será una combinación del paciente y la fecha/hora exacta del registro.
    const groups = reporteData.reduce((acc, row) => {
      // Se crea una clave única para cada "evento" de registro.
      const key = `${row.paciente_nombre_completo}|${row.post_fec_post}`;

      // Si el grupo para esta clave aún no existe, se crea.
      if (!acc[key]) {
        acc[key] = {
          // Se copia toda la información compartida (paciente, fecha, profesional, etc.).
          ...row,
          // Se inicializa un array para guardar los nombres de las actividades de este grupo.
          actividades: [row.actividad_nombre],
          // Se guarda la primera observación encontrada para este grupo.
          observaciones: row.observaciones,
        };
      } else {
        // Si el grupo ya existe, simplemente se añade la nueva actividad a la lista.
        acc[key].actividades.push(row.actividad_nombre);
        // Si hay una nueva observación, se puede concatenar (opcional).
        if (
          row.observaciones &&
          !acc[key].observaciones.includes(row.observaciones)
        ) {
          acc[key].observaciones += ` | ${row.observaciones}`;
        }
      }

      return acc;
    }, {});

    // Se convierte el objeto de grupos de nuevo a un array para poder mapearlo en la tabla.
    return Object.values(groups);
  }, [reporteData]);

  const reportTotals = useMemo(() => {
    // Se utiliza el método 'reduce' para iterar sobre todos los datos y acumular un resultado.
    // El valor inicial del acumulador es un objeto con ambos contadores en 0.
    return reporteData.reduce((totals, row) => {
        // Se revisa el tipo de registro de cada fila.
        if (row.tipo_registro === 'Post-Consulta (Cita)') {
          // Si es 'Post-Consulta', se incrementa su contador.
          totals.postConsulta += 1;
        } else {
          // Si no, se asume que es 'Actividad General' y se incrementa el otro contador.
          totals.general += 1;
        }
        // Se devuelve el objeto de totales para la siguiente iteración.
        return totals;
      }, 
      { postConsulta: 0, general: 0 } // <-- Valor inicial del contador.
    );
  }, [reporteData]); // Se recalcula solo cuando 'reporteData' cambia.

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Reporte de Actividades de Enfermería
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="Fecha Desde"
            type="date"
            name="fechaDesde"
            value={filters.fechaDesde}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Fecha Hasta"
            type="date"
            name="fechaHasta"
            value={filters.fechaHasta}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Enfermera/o</InputLabel>
            <Select
              name="medicoId"
              value={filters.medicoId}
              label="Enfermera/o"
              onChange={handleFilterChange}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {nurses.map((nurse) => (
                <MenuItem
                  key={nurse.medic_cod_medic}
                  value={nurse.medic_cod_medic}
                >
                  {nurse.medic_nom_medic}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => handleGenerateReport(true)}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Search />
              )
            }
            disabled={loading || !filters.fechaDesde || !filters.fechaHasta}
          >
            {loading ? "Generando..." : "Generar Reporte"}
          </Button>
        </Box>
      </Paper>

{pagination.totalItems !== null && !loading && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <Box display="flex" gap={2}>
            <Button variant="contained" color="success" onClick={exportToExcel} startIcon={<FileDownloadIcon />} disabled={reporteData.length === 0}>Excel</Button>
            <Button variant="contained" color="error" onClick={exportToPDF} startIcon={<PictureAsPdfIcon />} disabled={reporteData.length === 0}>PDF</Button>
          </Box>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, textAlign: 'center', minWidth: 200 }}>
              <Typography variant="subtitle2" color="textSecondary">Actividades Generales</Typography>
              {/* Se muestra el total correcto desde el estado de paginación. */}
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{pagination.totalGeneral}</Typography>
            </Paper>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, textAlign: 'center', minWidth: 200 }}>
              <Typography variant="subtitle2" color="textSecondary">Actividades Post-Consulta</Typography>
              {/* Se muestra el total correcto desde el estado de paginación. */}
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{pagination.totalPostConsulta}</Typography>
            </Paper>
             <Paper elevation={2} sx={{ p: 2, borderRadius: 2, textAlign: 'center', minWidth: 200, backgroundColor: '#2c3e50', color: 'white' }}>
              <Typography variant="subtitle2" sx={{ color: '#bdc3c7' }}>Total de Actividades</Typography>
              {/* Se muestra el total correcto desde el estado de paginación. */}
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{pagination.totalItems}</Typography>
            </Paper>
          </Box>
        </Box>
      )}

      {error && <Typography color="error" sx={{ my: 2 }}>{error}</Typography>}

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                "& .MuiTableCell-head": {
                  backgroundColor: "#2c3e50",
                  color: "white",
                },
              }}
            >
              <TableCell>#</TableCell>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell sx={{ minWidth: 300 }}>
                Actividades Realizadas
              </TableCell>{" "}
              {/* Columna ahora más ancha */}
              <TableCell>Observaciones</TableCell>
              <TableCell>Profesional</TableCell>
              <TableCell>Tipo de Registro</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ p: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : groupedReportData.length > 0 ? (
              // --- CAMBIO CLAVE: Se mapean los datos AGRUPADOS, no los originales. ---
              groupedReportData.map((group, index) => (
                <TableRow
                  key={`${group.paciente_nombre_completo}-${index}`}
                  hover
                >
                  <TableCell>{(page - 1) * LIMIT + index + 1}</TableCell>
                  <TableCell>{formatDate(group.post_fec_post)}</TableCell>
                  <TableCell>{group.paciente_nombre_completo}</TableCell>

                  {/* Celda de Actividades: Muestra todas las actividades del grupo. */}
                  <TableCell>
                    {/* --- CAMBIO CLAVE --- */}
                    {/* Se cambia 'flexWrap' por 'flexDirection: "column"' y se ajusta el alineamiento. */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 0.5,
                      }}
                    >
                      {/* El mapeo de los Chips no cambia, solo su contenedor. */}
                      {group.actividades.map((actividad, actIndex) => (
                        <Chip key={actIndex} label={actividad} size="small" />
                      ))}
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      maxWidth: 300,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {group.observaciones || "-"}
                  </TableCell>
                  <TableCell>{group.profesional_nombre}</TableCell>
                  <TableCell>
                    <Chip
                      label={group.tipo_registro}
                      size="small"
                      color={
                        group.tipo_registro === "Post-Consulta (Cita)"
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ p: 4 }}>
                  No hay datos para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* --- NUEVOS CONTROLES DE PAGINACIÓN --- */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <IconButton
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            <ArrowBack />
          </IconButton>
          <Typography sx={{ mx: 2 }}>
            Página <strong>{page}</strong> de{" "}
            <strong>{pagination.totalPages}</strong>
          </Typography>
          <IconButton
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pagination.totalPages}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      )}
    </Container>
  );
};

export default ReporteEnfermeria;
