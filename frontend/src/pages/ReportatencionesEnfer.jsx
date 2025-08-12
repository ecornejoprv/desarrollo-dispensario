import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/reporteActividades.module.css';
import html2canvas from 'html2canvas';

const COLORS = [
  '#0088FE', // Azul
  '#00C49F', // Verde
  '#FFBB28', // Amarillo
  '#FF8042', // Naranja
  '#8884D8'  // Morado
];

const ReporteActividades = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: ''
  });

  const fetchActividades = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        fechaDesde: filters.fechaDesde || undefined,
        fechaHasta: filters.fechaHasta || undefined,
        tipoActividad: 'POSTCONSULTA'
      };

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const { data } = await axios.get('/api/v1/atenciones', { params });
      setActividades(data.data || data);
    } catch (err) {
      console.error('Error al filtrar:', err);
      setError('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  // Función para agrupar actividades por paciente, fecha y hora exactas
  const getActividadesAgrupadas = () => {
    const grupos = {};
    
    actividades.forEach(actividad => {
      // Creamos una clave única con pacienteId, fecha_cita y hora_cita
      const claveGrupo = `${actividad.pacienteId}_${actividad.fecha_cita}_${actividad.hora_cita}`;
      
      if (!grupos[claveGrupo]) {
        // Si no existe el grupo, lo creamos
        grupos[claveGrupo] = {
          pacienteId: actividad.pacienteId,
          pacienteNombre: `${actividad.paciente_nombre || ''} ${actividad.paciente_apellido || ''}`.trim(),
          fechaCita: actividad.fecha_cita,
          horaCita: actividad.hora_cita || 'N/A',
          medico: actividad.medico_nombre || 'N/A',
          especialidad: actividad.especialidad || 'N/A',
          sucursal: actividad.sucursal || 'N/A',
          actividades: []
        };
      }
      
      // Añadimos la actividad al grupo correspondiente
      grupos[claveGrupo].actividades.push({
        tipo: actividad.acti_nom_acti,
        fechaActividad: actividad.post_fec_post,
        observaciones: actividad.post_obs_post || '-'
      });
    });
    
    // Convertimos el objeto de grupos a un array y ordenamos por fecha y hora
    return Object.values(grupos).sort((a, b) => {
      // Primero por fecha
      if (a.fechaCita < b.fechaCita) return -1;
      if (a.fechaCita > b.fechaCita) return 1;
      
      // Si las fechas son iguales, ordenamos por hora
      if (a.horaCita < b.horaCita) return -1;
      if (a.horaCita > b.horaCita) return 1;
      
      return 0;
    });
  };

  // Función para generar datos para los gráficos
  const getChartData = () => {
    // Datos por tipo de actividad
    const porTipo = actividades.reduce((acc, actividad) => {
      const tipo = actividad.acti_nom_acti || 'Sin tipo';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    // Función para filtrar actividades válidas (sin N/A)
const getActividadesValidas = () => {
  return actividades.filter(actividad => 
    actividad.fecha_cita && 
    actividad.hora_cita && 
    actividad.fecha_cita !== 'N/A' && 
    actividad.hora_cita !== 'N/A'
  );
};

// Función para agrupar actividades válidas
const getActividadesAgrupadas = () => {
  const actividadesValidas = getActividadesValidas();
  const grupos = {};
  
  actividadesValidas.forEach(actividad => {
    const claveGrupo = `${actividad.pacienteId}_${actividad.fecha_cita}_${actividad.hora_cita}`;
    
    if (!grupos[claveGrupo]) {
      grupos[claveGrupo] = {
        pacienteNombre: `${actividad.paciente_nombre || ''} ${actividad.paciente_apellido || ''}`.trim(),
        fechaCita: actividad.fecha_cita,
        horaCita: actividad.hora_cita,
        medico: actividad.medico_nombre || 'N/A',
        especialidad: actividad.especialidad || 'N/A',
        sucursal: actividad.sucursal || 'N/A',
        actividades: []
      };
    }
    
    grupos[claveGrupo].actividades.push({
      tipo: actividad.acti_nom_acti,
      fechaActividad: actividad.post_fec_post
      // Eliminamos las observaciones por completo
    });
  });
  
  return Object.values(grupos).sort((a, b) => {
    if (a.fechaCita < b.fechaCita) return -1;
    if (a.fechaCita > b.fechaCita) return 1;
    if (a.horaCita < b.horaCita) return -1;
    if (a.horaCita > b.horaCita) return 1;
    return 0;
  });
};
    // Datos por día de actividad
    const porDia = actividades.reduce((acc, actividad) => {
      const fecha = formatDate(actividad.post_fec_post);
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});

    return {
      tipoData: Object.entries(porTipo).map(([name, value]) => ({ name, value })),
      diaData: Object.entries(porDia).map(([name, value]) => ({ name, value }))
    };
  };
// Función para exportar a Excel (simplificada)
const exportToExcel = async () => {
  const actividadesAgrupadas = getActividadesAgrupadas();
  if (actividadesAgrupadas.length === 0) return;
  
  try {
    const wb = XLSX.utils.book_new();
    
    // 1. Hoja de detalle con tipos de actividad en columnas separadas
    const maxActividades = Math.max(...actividadesAgrupadas.map(g => g.actividades.length));
    
    // Crear encabezados dinámicos para las columnas de actividades (solo tipo)
    const headers = [
      'Paciente', 
      'Fecha Cita', 
      'Hora Cita', 
      'Médico', 
      'Especialidad', 
      'Sucursal',
      'Total Actividades',
      ...Array.from({length: maxActividades}, (_, i) => `Actividad ${i + 1}`)
    ];
    
    // Preparar los datos para la hoja de detalle
    const detailData = actividadesAgrupadas.map(grupo => {
      const rowData = {
        'Paciente': grupo.pacienteNombre,
        'Fecha Cita': formatDate(grupo.fechaCita),
        'Hora Cita': grupo.horaCita,
        'Médico': grupo.medico,
        'Especialidad': grupo.especialidad,
        'Sucursal': grupo.sucursal,
        'Total Actividades': grupo.actividades.length
      };
      
      // Agregar cada tipo de actividad como columnas separadas
      grupo.actividades.forEach((actividad, index) => {
        rowData[`Actividad ${index + 1}`] = actividad.tipo;
      });
      
      return rowData;
    });
    
    const wsDetail = XLSX.utils.json_to_sheet(detailData, { header: headers });
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detalle Actividades");
    
    // Ajustar anchos de columnas
    wsDetail['!cols'] = [
      { wch: 30 },  // Paciente
      { wch: 12 },  // Fecha Cita
      { wch: 10 },  // Hora Cita
      { wch: 25 },  // Médico
      { wch: 20 },  // Especialidad
      { wch: 20 },  // Sucursal
      { wch: 10 },  // Total Actividades
      ...Array(maxActividades).fill().map(() => ({ wch: 25 })) // Columnas de tipos de actividad
    ];
    
    // 2. Hoja de resumen simplificada
    const chartData = getChartData();
    
    const summaryData = [
      ['REPORTE DE ACTIVIDADES AGRUPADAS'],
      [''],
      ['Fecha generación:', new Date().toLocaleString()],
      ['Período reportado:', `${filters.fechaDesde ? formatDate(filters.fechaDesde) : 'Todo'} - ${filters.fechaHasta ? formatDate(filters.fechaHasta) : 'Todo'}`],
      ['Total grupos:', actividadesAgrupadas.length],
      ['Total actividades:', actividades.length],
      ['Promedio actividades/grupo:', actividadesAgrupadas.length > 0 ? (actividades.length / actividadesAgrupadas.length).toFixed(1) : 0],
      [''],
      ['DISTRIBUCIÓN POR TIPO DE ACTIVIDAD'],
      ['Tipo', 'Cantidad', 'Porcentaje'],
      ...chartData.tipoData.map(item => [
        item.name, 
        item.value, 
        { f: `TEXT(${item.value}/${actividades.length}*100,"0.0")&"%"`, t: 'n' }
      ])
    ];
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");
    
    // Aplicar formatos a la hoja de resumen
    const boldStyle = { font: { bold: true } };
    ['A1', 'A9'].forEach(cell => {
      wsSummary[cell] = { ...wsSummary[cell], s: boldStyle };
    });
    
    // Encabezados de tabla en negrita
    ['A9:C9'].forEach(range => {
      for (let i = range.charCodeAt(0); i <= range.charCodeAt(3); i++) {
        const cell = String.fromCharCode(i) + range.substring(1, 2);
        wsSummary[cell] = { ...wsSummary[cell], s: boldStyle };
      }
    });
    
    // Exportar el archivo
    XLSX.writeFile(wb, `Reporte_Actividades_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    setError('Error generando Excel');
  }
};
  // Función para exportar a PDF
  const exportToPDF = async () => {
    if (actividades.length === 0) return;
    
    // Convertimos los gráficos a imágenes
    const [tipoChartImg, diaChartImg] = await Promise.all([
      convertToImage('tipo-chart-container'),
      convertToImage('dia-chart-container')
    ]);

    const actividadesAgrupadas = getActividadesAgrupadas();

    // Generamos el contenido HTML para el PDF
    const htmlContent = `
      <html>
        <head>
          <title>Reporte de Actividades Agrupadas</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .report-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 20px; text-align: right; font-size: 12px; }
            .chart-container { margin: 20px 0; text-align: center; }
            .chart-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .chart-item { width: 48%; }
            .chart-title { font-weight: bold; margin-bottom: 10px; }
            .metrics { display: flex; justify-content: space-around; margin: 20px 0; }
            .metric-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 5px; width: 30%; }
            .metric-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            .activity-detail { display: flex; margin-bottom: 5px; }
            .activity-type { width: 150px; font-weight: bold; }
            .activity-list { border-left: 2px solid #ddd; padding-left: 10px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Actividades Agrupadas</h1>
          
          <div class="report-info">
            <p>Total de grupos: <strong>${actividadesAgrupadas.length}</strong></p>
            <p>Total de actividades: <strong>${actividades.length}</strong></p>
            ${filters.fechaDesde && filters.fechaHasta ? 
              `<p>Período: ${formatDate(filters.fechaDesde)} - ${formatDate(filters.fechaHasta)}</p>` : ''}
          </div>
          
          <!-- Métricas -->
          <div class="metrics">
            <div class="metric-card">
              <h3>Grupos</h3>
              <p class="metric-value">${actividadesAgrupadas.length}</p>
            </div>
            <div class="metric-card">
              <h3>Actividades</h3>
              <p class="metric-value">${actividades.length}</p>
            </div>
            <div class="metric-card">
              <h3>Promedio/Grupo</h3>
              <p class="metric-value">${actividadesAgrupadas.length > 0 ? (actividades.length / actividadesAgrupadas.length).toFixed(1) : '0'}</p>
            </div>
          </div>
          
          <!-- Gráficos -->
          <div class="chart-row">
            ${tipoChartImg ? `
              <div class="chart-item">
                <div class="chart-title">Distribución por Tipo</div>
                <img src="${tipoChartImg}" style="width: 100%;" />
              </div>
            ` : ''}
            
            ${diaChartImg ? `
              <div class="chart-item">
                <div class="chart-title">Actividades por Día</div>
                <img src="${diaChartImg}" style="width: 100%;" />
              </div>
            ` : ''}
          </div>
          
          <!-- Tabla de datos agrupados -->
          <h2>Detalle de Actividades Agrupadas</h2>
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Fecha Cita</th>
                <th>Hora Cita</th>
                <th>Médico</th>
                <th>Especialidad</th>
                <th>Sucursal</th>
                <th>Actividades</th>
              </tr>
            </thead>
            <tbody>
              ${actividadesAgrupadas.map(grupo => `
                <tr>
                  <td>${grupo.pacienteNombre}</td>
                  <td>${formatDate(grupo.fechaCita)}</td>
                  <td>${grupo.horaCita}</td>
                  <td>${grupo.medico}</td>
                  <td>${grupo.especialidad}</td>
                  <td>${grupo.sucursal}</td>
                  <td>
                    <div class="activity-list">
                      ${grupo.actividades.map((actividad, index) => `
                        <div class="activity-detail">
                          <div class="activity-type">${actividad.tipo}:</div>
                          <div>${formatDate(actividad.fechaActividad)} - ${actividad.observaciones}</div>
                        </div>
                      `).join('')}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `;
    
    // Abrimos una nueva ventana con el contenido HTML y la imprimimos
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  // Función para convertir elementos a imágenes (para los gráficos en PDF)
  const convertToImage = async (elementId) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return null;
      const canvas = await html2canvas(element);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error al convertir a imagen:', error);
      return null;
    }
  };

  // Manejador de cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejador para enviar el formulario de filtros
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchActividades();
  };

  // Función para resetear los filtros
  const resetFilters = () => {
    setFilters({
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Efecto para cargar las actividades al montar el componente
  useEffect(() => {
    fetchActividades();
  }, []);

  // Obtenemos los datos para los gráficos y los grupos de actividades
  const chartData = actividades.length > 0 ? getChartData() : null;
  const actividadesAgrupadas = getActividadesAgrupadas();

  return (
    <div className={styles.container}>
      <h1>Reporte de Actividades Agrupadas</h1>
      
      {/* Formulario de filtros */}
      <form onSubmit={handleSubmit} className={styles.filterForm}>
        <div className={styles.filterRowCompact}>
          <div className={styles.filterGroup}>
            <label>Fecha Desde:</label>
            <input
              type="date"
              name="fechaDesde"
              value={filters.fechaDesde}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <label>Fecha Hasta:</label>
            <input
              type="date"
              name="fechaHasta"
              value={filters.fechaHasta}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>
        </div>

        <div className={styles.filterActions}>
          <button type="submit" className={styles.applyButton}>
            Aplicar Filtros
          </button>
          <button 
            type="button" 
            className={styles.resetButton}
            onClick={resetFilters}
          >
            Limpiar Filtros
          </button>
        </div>
      </form>

      {/* Estado de carga y errores */}
      {loading && <div className={styles.loading}>Cargando reporte...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {/* Dashboard con métricas y gráficos */}
      <div className={styles.dashboard}>
        {/* Métricas */}
        <div className={styles.metricsRow}>
          <div className={styles.metricCard}>
            <h3>Grupos</h3>
            <p className={styles.metricValue}>{actividadesAgrupadas.length}</p>
          </div>
          
          <div className={styles.metricCard}>
            <h3>Actividades</h3>
            <p className={styles.metricValue}>{actividades.length}</p>
          </div>
          
          <div className={styles.metricCard}>
            <h3>Promedio/Grupo</h3>
            <p className={styles.metricValue}>
              {actividadesAgrupadas.length > 0 ? 
                (actividades.length / actividadesAgrupadas.length).toFixed(1) : '0'}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        {chartData && (
          <div className={styles.charts}>
            <div className={styles.chartContainer} id="tipo-chart-container">
              <h3>Distribución por Tipo</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData.tipoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {chartData.tipoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className={styles.chartContainer} id="dia-chart-container">
              <h3>Actividades por Día</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.diaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Actividades" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Resultados agrupados en tabla */}
      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <div className={styles.summary}>
            <p>Total de grupos: <strong>{actividadesAgrupadas.length}</strong></p>
            <p>Total de actividades: <strong>{actividades.length}</strong></p>
            {filters.fechaDesde && filters.fechaHasta && (
              <p>Período: {formatDate(filters.fechaDesde)} - {formatDate(filters.fechaHasta)}</p>
            )}
          </div>
          
          <div className={styles.exportButtons}>
            <button 
              onClick={exportToExcel}
              className={styles.exportButton}
              disabled={actividades.length === 0}
            >
              Exportar a Excel
            </button>
            
            <button 
              onClick={exportToPDF}
              className={styles.exportButton}
              disabled={actividades.length === 0}
            >
              Exportar a PDF
            </button>
          </div>
        </div>

        {actividadesAgrupadas.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.activitiesTable}>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Fecha Cita</th>
                  <th>Hora Cita</th>
                  <th>Médico</th>
                  <th>Especialidad</th>
                  <th>Sucursal</th>
                  <th>Actividades</th>
                </tr>
              </thead>
              <tbody>
                {actividadesAgrupadas.map((grupo, index) => (
                  <tr key={index}>
                    <td>{grupo.pacienteNombre}</td>
                    <td>{formatDate(grupo.fechaCita)}</td>
                    <td>{grupo.horaCita}</td>
                    <td>{grupo.medico}</td>
                    <td>{grupo.especialidad}</td>
                    <td>{grupo.sucursal}</td>
                    <td>
                      <div className={styles.activityList}>
                        {grupo.actividades.map((actividad, i) => (
                          <div key={i} className={styles.activityDetail}>
                            <span className={styles.activityType}>{actividad.tipo}:</span>
                            <span>{formatDate(actividad.fechaActividad)} - {actividad.observaciones}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className={styles.noResults}>No se encontraron actividades con los filtros seleccionados</p>
        )}
      </div>
    </div>
  );
};

export default ReporteActividades;