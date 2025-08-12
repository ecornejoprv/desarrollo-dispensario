// src/components/AnticonceptivosComponent.jsx (Código Absolutamente Completo)
// ==============================================================================
// @summary: Se refactoriza este componente para reemplazar todas las llamadas
//           nativas 'fetch' por nuestra instancia 'api' de Axios. Esto asegura
//           que todas las peticiones al backend incluyan el token de autorización
//           y las cabeceras de contexto de empresa, solucionando los errores 401.
//           Se incluye el objeto de estilos completo sin omisiones.
// ==============================================================================

// --- 1. IMPORTACIONES ---
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PropTypes from "prop-types"; // Se importa PropTypes para la validación de las props
import api from '../api'; // Se importa nuestra instancia 'api' de Axios.

// --- 2. DEFINICIÓN DEL COMPONENTE ---
const AnticonceptivosComponent = ({ pacienteId }) => {
  // --- ESTADOS DEL COMPONENTE ---
  const [anticonceptivos, setAnticonceptivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipoAnticonceptivo: 'ORAL',
    fum: new Date().toISOString().split('T')[0],
    fechaAplicacion: new Date().toISOString().split('T')[0],
    proximaRenovacion: '',
    observaciones: '',
    estado: 'ACTIVO'
  });
  const [editingId, setEditingId] = useState(null);

  // --- DATOS CONSTANTES ---
  // Lista de tipos de anticonceptivos para el dropdown.
  const tiposAnticonceptivos = [
    { value: 'ORAL', label: 'Anticonceptivo Oral' },
    { value: 'INYECTABLE', label: 'Anticonceptivo Inyectable' },
    { value: 'IMPLANTE', label: 'Implante Hormonal' },
    { value: 'DIU', label: 'DIU (Dispositivo Intrauterino)' },
    { value: 'PRESERVATIVO', label: 'Preservativo' },
    { value: 'PARCHE', label: 'Parche Anticonceptivo' },
    { value: 'ANILLO', label: 'Anillo Vaginal' },
    { value: 'OTRO', label: 'Otro método' }
  ];

  // Lista de estados para el dropdown.
  const estadosAnticonceptivos = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'SUSPENDIDO', label: 'Suspendido' },
    { value: 'FINALIZADO', label: 'Finalizado' }
  ];

  // --- FUNCIONES ASÍNCRONAS ---

  // Obtiene los anticonceptivos registrados para el paciente actual.
  const fetchAnticonceptivos = async () => {
    try {
      setLoading(true);
      // Se reemplaza 'fetch' por 'api.get' para enviar el token automáticamente.
      const response = await api.get(`/api/v1/anticonceptivos/paciente/${pacienteId}`);
      setAnticonceptivos(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar anticonceptivos');
    } finally {
      setLoading(false);
    }
  };

  // EFECTO: Carga los anticonceptivos cuando el componente se monta o el pacienteId cambia.
  useEffect(() => {
    if (pacienteId) fetchAnticonceptivos();
  }, [pacienteId]);

  // Maneja los cambios en los inputs del formulario.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Envía el formulario para crear un nuevo registro o actualizar uno existente.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingId 
        ? `/api/v1/anticonceptivos/${editingId}`
        : '/api/v1/anticonceptivos';
      const method = editingId ? 'put' : 'post';

      const bodyData = {
        pacienteId,
        fum: formData.fum,
        observaciones: formData.observaciones,
        tipoAnticonceptivo: formData.tipoAnticonceptivo,
        fechaAplicacion: formData.fechaAplicacion,
        proximaRenovacion: formData.proximaRenovacion,
        estado: formData.estado
      };

      // Se reemplaza 'fetch' con 'api[method]' para enviar la petición con token.
      const response = await api[method](url, bodyData);
      
      toast.success(response.data.message || (editingId 
        ? 'Anticonceptivo actualizado correctamente' 
        : 'Anticonceptivo creado correctamente'));
      
      fetchAnticonceptivos();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el registro');
    } finally {
      setLoading(false);
    }
  };

  // Prepara el formulario para editar un registro existente.
  const handleEdit = (anticonceptivo) => {
    setFormData({
      tipoAnticonceptivo: anticonceptivo.antic_tipo_antic,
      fum: anticonceptivo.antic_fum_antic?.split('T')[0] || '',
      fechaAplicacion: anticonceptivo.antic_fap_antic?.split('T')[0] || '',
      proximaRenovacion: anticonceptivo.antic_prox_antic?.split('T')[0] || '',
      observaciones: anticonceptivo.antic_obs_antic || '',
      estado: anticonceptivo.antic_est_antic || 'ACTIVO'
    });
    setEditingId(anticonceptivo.antic_cod_antic);
  };

  // Cambia el estado de un registro (Activo, Suspendido, etc.).
  const handleChangeStatus = async (id, nuevoEstado) => {
    try {
      setLoading(true);
      // Se reemplaza 'fetch' con 'api.patch'.
      const response = await api.patch(`/api/v1/anticonceptivos/${id}/estado`, { estado: nuevoEstado });
      toast.success(response.data.message || 'Estado actualizado correctamente');
      fetchAnticonceptivos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  // Elimina un registro de anticonceptivo.
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro de anticonceptivo?')) return;
    try {
      setLoading(true);
      // Se reemplaza 'fetch' con 'api.delete'.
      const response = await api.delete(`/api/v1/anticonceptivos/${id}`);
      toast.success(response.data.message || 'Anticonceptivo eliminado correctamente');
      fetchAnticonceptivos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar anticonceptivo');
    } finally {
      setLoading(false);
    }
  };

  // Resetea el formulario a su estado inicial.
  const resetForm = () => {
    setFormData({
      tipoAnticonceptivo: 'ORAL',
      fum: new Date().toISOString().split('T')[0],
      fechaAplicacion: new Date().toISOString().split('T')[0],
      proximaRenovacion: '',
      observaciones: '',
      estado: 'ACTIVO'
    });
    setEditingId(null);
  };

  // Objeto que contiene todos los estilos para el componente.
  const styles = {
    container: {
      maxWidth: '1350px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2937'
    },
    newButton: {
      padding: '6px 12px',
      backgroundColor: '#e5e7eb',
      borderRadius: '6px',
      color: '#374151',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px'
    },
    formContainer: {
      backgroundColor: '#f9fafb',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    },
    formTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '16px',
      paddingBottom: '6px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      marginBottom: '12px'
    },
    label: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#4b5563'
    },
    input: {
      width: '100%',
      padding: '6px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      outline: 'none',
      transition: 'all 0.2s',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      outline: 'none',
      minHeight: '60px',
      resize: 'vertical',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    grid2Cols: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '12px'
    },
    submitButton: {
      width: '100%',
      padding: '8px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      backgroundColor: '#3b82f6'
    },
    tableHeader: {
      fontWeight: '600',
      textAlign: 'left',
      color: '#374151',
      backgroundColor: '#f9fafb'
    }
  };

  // --- 3. RENDERIZADO DEL COMPONENTE (JSX) ---
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Gestión de Métodos Anticonceptivos</h2>
        {editingId && (
          <button 
            onClick={resetForm}
            style={styles.newButton}
          >
            <span style={{ marginRight: '4px' }}>+</span> Nuevo Registro
          </button>
        )}
      </div>
      
      <div>
        {/* Formulario de creación/edición */}
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>
            {editingId ? '✏️ Editar Anticonceptivo' : '➕ Nuevo Anticonceptivo'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.grid2Cols}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Tipo de Anticonceptivo *</label>
                <select name="tipoAnticonceptivo" value={formData.tipoAnticonceptivo} onChange={handleChange} required style={styles.input}>
                  {tiposAnticonceptivos.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Estado *</label>
                <select name="estado" value={formData.estado} onChange={handleChange} required style={styles.input}>
                  {estadosAnticonceptivos.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={styles.grid2Cols}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Fecha Última Menstruación (FUM)</label>
                <input type="date" name="fum" value={formData.fum} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Fecha de Aplicación *</label>
                <input type="date" name="fechaAplicacion" value={formData.fechaAplicacion} onChange={handleChange} required style={styles.input} />
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Próxima Renovación</label>
              <input type="date" name="proximaRenovacion" value={formData.proximaRenovacion} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Observaciones *</label>
              <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} required style={styles.textarea} placeholder="Detalles del método, dosis, marca, etc." />
            </div>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
        
        {/* Tabla con la lista de anticonceptivos registrados */}
        <div style={styles.formContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={styles.formTitle}>📋 Métodos Anticonceptivos Registrados</h3>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {anticonceptivos.length} {anticonceptivos.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          
          {loading && !anticonceptivos.length ? (
            <div style={{ textAlign: 'center', padding: '20px' }}><p>Cargando anticonceptivos...</p></div>
          ) : anticonceptivos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ marginBottom: '16px' }}>No se han registrado métodos anticonceptivos para este paciente.</p>
              <button onClick={resetForm} style={styles.newButton}><span>+</span> Agregar primer registro</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px' }}>Método</th>
                    <th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px' }}>F. Aplicación</th>
                    <th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px' }}>Próx. Renovación</th>
                    <th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px' }}>Estado</th>
                    <th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {anticonceptivos.map(anticonceptivo => (
                    <tr key={anticonceptivo.antic_cod_antic} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '500' }}>{tiposAnticonceptivos.find(t => t.value === anticonceptivo.antic_tipo_antic)?.label || anticonceptivo.antic_tipo_antic}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>FUM: {anticonceptivo.antic_fum_antic?.split('T')[0] || 'No registrada'}</div>
                      </td>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>{anticonceptivo.antic_fap_antic?.split('T')[0]}</td>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>{anticonceptivo.antic_prox_antic?.split('T')[0] || 'No definida'}</td>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>
                        <select
                          value={anticonceptivo.antic_est_antic}
                          onChange={(e) => handleChangeStatus(anticonceptivo.antic_cod_antic, e.target.value)}
                          style={{ 
                            padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                            backgroundColor: anticonceptivo.antic_est_antic === 'ACTIVO' ? '#dbeafe' : anticonceptivo.antic_est_antic === 'SUSPENDIDO' ? '#fef3c7' : '#f3f4f6',
                            color: anticonceptivo.antic_est_antic === 'ACTIVO' ? '#1e40af' : anticonceptivo.antic_est_antic === 'SUSPENDIDO' ? '#92400e' : '#374151',
                            border: 'none', outline: 'none'
                          }}
                        >
                          {estadosAnticonceptivos.map(estado => (
                            <option key={estado.value} value={estado.value} style={{ backgroundColor: 'white', color: '#1f2937' }}>{estado.label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'top' }}>
                        <button onClick={() => handleEdit(anticonceptivo)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '12px', fontSize: '14px' }}>Editar</button>
                        <button onClick={() => handleDelete(anticonceptivo.antic_cod_antic)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Se añade la validación de PropTypes para la prop pacienteId.
AnticonceptivosComponent.propTypes = {
  pacienteId: PropTypes.number.isRequired,
};

export default AnticonceptivosComponent;