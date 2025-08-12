import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './styles/reporteActividades.module.css';

const ReporteActividades = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    medicoId: '',
    pacienteId: '',
    tipoActividad: 'POSTCONSULTA'
  });
  const navigate = useNavigate();

  // Función para cargar las actividades
  const fetchActividades = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
      if (filters.medicoId) params.append('medicoId', filters.medicoId);
      if (filters.pacienteId) params.append('pacienteId', filters.pacienteId);
      if (filters.tipoActividad) params.append('tipoActividad', filters.tipoActividad);

      const { data } = await axios.get(`/api/v1/atenciones?${params.toString()}`);
      setActividades(data.data);
    } catch (err) {
      console.error('Error al obtener actividades:', err);
      setError(err.response?.data?.error || err.message || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };
  const exportToExcel = () => {
    if (actividades.length === 0) return;
  
    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    
    // Preparar datos
    const excelData = actividades.map(actividad => ({
      'Fecha Actividad': formatDate(actividad.post_fec_post),
      'Actividad': actividad.acti_nom_acti,
      'Paciente': `${actividad.paciente_nombre || ''} ${actividad.paciente_apellido || ''}`.trim(),
      'Médico': actividad.medico_nombre || 'N/A',
      'Fecha Cita': formatDate(actividad.fecha_cita),
      'Hora Cita': actividad.hora_cita || 'N/A',
      'Especialidad': actividad.especialidad || 'N/A',
      'Sucursal': actividad.sucursal || 'N/A',
      'Observaciones': actividad.post_obs_post || '-'
    }));
  
    // Convertir a hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Actividades");
    
    // Estilos de columnas (ancho automático)
    ws['!cols'] = [
      { wch: 15 }, // Fecha Actividad
      { wch: 25 }, // Actividad
      { wch: 30 }, // Paciente
      { wch: 25 }, // Médico
      { wch: 15 }, // Fecha Cita
      { wch: 10 }, // Hora Cita
      { wch: 20 }, // Especialidad
      { wch: 20 }, // Sucursal
      { wch: 40 }  // Observaciones
    ];
    
    // Generar archivo
    const fileName = `Reporte_Actividades_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Aplicar filtros
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchActividades();
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchActividades();
  }, []);

  const exportToPDF = () => {
    if (actividades.length === 0) return;
    
    // Crear contenido HTML para el PDF
    const htmlContent = `
      <html>
        <head>
          <title>Reporte de Actividades</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .report-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 20px; text-align: right; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Actividades Postconsulta</h1>
          <div class="report-info">
            <p>Total de actividades: <strong>${actividades.length}</strong></p>
            ${filters.fechaDesde && filters.fechaHasta ? 
              `<p>Período: ${formatDate(filters.fechaDesde)} - ${formatDate(filters.fechaHasta)}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Fecha Actividad</th>
                <th>Actividad</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Fecha Cita</th>
                <th>Hora Cita</th>
                <th>Especialidad</th>
                <th>Sucursal</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              ${actividades.map(actividad => `
                <tr>
                  <td>${formatDate(actividad.post_fec_post)}</td>
                  <td>${actividad.acti_nom_acti}</td>
                  <td>${actividad.paciente_nombre || 'N/A'} ${actividad.paciente_apellido ? actividad.paciente_apellido : ''}</td>
                  <td>${actividad.medico_nombre || 'N/A'}</td>
                  <td>${formatDate(actividad.fecha_cita)}</td>
                  <td>${actividad.hora_cita || 'N/A'}</td>
                  <td>${actividad.especialidad || 'N/A'}</td>
                  <td>${actividad.sucursal || 'N/A'}</td>
                  <td>${actividad.post_obs_post || '-'}</td>
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
    
    // Abrir ventana para imprimir (el usuario puede guardar como PDF)
    const win = window.open('', '_blank');
    win.document.write(htmlContent);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className={styles.container}>
      <h1>Reporte de Actividades Postconsulta</h1>
      
      {/* Filtros */}
      <form onSubmit={handleSubmit} className={styles.filterForm}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label>Fecha Desde:</label>
            <input
              type="date"
              name="fechaDesde"
              value={filters.fechaDesde}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <label>Fecha Hasta:</label>
            <input
              type="date"
              name="fechaHasta"
              value={filters.fechaHasta}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label>ID Médico:</label>
            <input
              type="text"
              name="medicoId"
              value={filters.medicoId}
              onChange={handleFilterChange}
              placeholder="Filtrar por ID médico"
            />
          </div>
          
          <div className={styles.filterGroup}>
            <label>ID Paciente:</label>
            <input
              type="text"
              name="pacienteId"
              value={filters.pacienteId}
              onChange={handleFilterChange}
              placeholder="Filtrar por ID paciente"
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
            onClick={() => {
              setFilters({
                fechaDesde: '',
                fechaHasta: '',
                medicoId: '',
                pacienteId: '',
                tipoActividad: 'POSTCONSULTA'
              });
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </form>

      {/* Estado de carga y errores */}
      {loading && <div className={styles.loading}>Cargando reporte...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {/* Resultados */}
      <div className={styles.resultsContainer}>
        <div className={styles.summary}>
          <p>Total de actividades: <strong>{actividades.length}</strong></p>
          {filters.fechaDesde && filters.fechaHasta && (
            <p>Período: {formatDate(filters.fechaDesde)} - {formatDate(filters.fechaHasta)}</p>
          )}
        </div>

        {actividades.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.activitiesTable}>
              <thead>
                <tr>
                  <th>Fecha Actividad</th>
                  <th>Actividad</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Fecha Cita</th>
                  <th>Hora Cita</th>
                  <th>Especialidad</th>
                  <th>Sucursal</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((actividad) => (
                  <tr key={actividad.post_cod_post}>
                    <td>{formatDate(actividad.post_fec_post)}</td>
                    <td>{actividad.acti_nom_acti}</td>
                    <td>
                      {actividad.paciente_nombre || 'N/A'}
                      {actividad.paciente_apellido && ` ${actividad.paciente_apellido}`}
                    </td>
                    <td>{actividad.medico_nombre || 'N/A'}</td>
                    <td>{formatDate(actividad.fecha_cita)}</td>
                    <td>{actividad.hora_cita || 'N/A'}</td>
                    <td>{actividad.especialidad || 'N/A'}</td>
                    <td>{actividad.sucursal || 'N/A'}</td>
                    <td>{actividad.post_obs_post || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </div>
          
        ) : (
          !loading && <p className={styles.noResults}>No se encontraron actividades con los filtros seleccionados</p>
        )}
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
    </div>
  );
};

export default ReporteActividades;