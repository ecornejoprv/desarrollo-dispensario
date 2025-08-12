import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import api from '../api';

const AlergiasComponent = ({ pacienteId }) => {
  const [alergias, setAlergias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', tipo: 'Medicamento', gravedad: 'moderada',
    fechaDiagnostico: new Date().toISOString().split('T')[0],
    sintomas: '', tratamiento: '', observaciones: '', estado: 'activa'
  });
  const [editingId, setEditingId] = useState(null);

  const fetchAlergias = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/alergias/paciente/${pacienteId}`);
      setAlergias(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar alergias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pacienteId) fetchAlergias();
  }, [pacienteId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingId ? `/api/v1/alergias/${editingId}` : '/api/v1/alergias';
      const method = editingId ? 'put' : 'post';
      const response = await api[method](url, { ...formData, pacienteId });
      toast.success(editingId ? 'Alergia actualizada correctamente' : 'Alergia creada correctamente');
      fetchAlergias();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alergia) => {
    setFormData({
      nombre: alergia.aler_nom_aler, tipo: alergia.aler_tipo_aler,
      gravedad: alergia.aler_grav_aler, fechaDiagnostico: alergia.aler_fec_aler.split('T')[0],
      sintomas: alergia.aler_sin_aler, tratamiento: alergia.aler_tra_aler,
      observaciones: alergia.aler_obs_aler, estado: alergia.aler_est_aler
    });
    setEditingId(alergia.aler_cod_aler);
  };

  // CORRECCIÓN: La función handleDelete ahora no envía un body.
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de marcar esta alergia como inactiva?')) return;
    try {
      setLoading(true);
      // El backend ahora obtiene el usuario del token, por lo que no se necesita enviar un body.
      await api.delete(`/api/v1/alergias/${id}`);
      toast.success('Alergia marcada como inactiva');
      fetchAlergias();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar alergia');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '', tipo: 'Medicamento', gravedad: 'moderada',
      fechaDiagnostico: new Date().toISOString().split('T')[0],
      sintomas: '', tratamiento: '', observaciones: '', estado: 'activa'
    });
    setEditingId(null);
  };

  const styles = {
    container: { maxWidth: '1350px', margin: '0 auto', padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '20px', fontWeight: '600', color: '#1f2937', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
    newButton: { padding: '6px 12px', backgroundColor: '#e5e7eb', borderRadius: '6px', color: '#374151', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', fontSize: '14px', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
    formContainer: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', marginBottom: '24px' },
    formTitle: { fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' },
    label: { fontSize: '13px', fontWeight: '500', color: '#4b5563', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
    input: { width: '100%', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', transition: 'all 0.2s', fontSize: '14px', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minHeight: '60px', resize: 'vertical', fontSize: '14px', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', boxSizing: 'border-box' },
    grid2Cols: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
    submitButton: { width: '100%', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', backgroundColor: '#3b82f6' },
    tableHeader: { fontWeight: '600', textAlign: 'left', color: '#374151', backgroundColor: '#f9fafb' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Gestión de Alergias</h2>
        {editingId && ( <button onClick={resetForm} style={styles.newButton}><span>+</span> Nueva Alergia</button> )}
      </div>
      <div>
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>{editingId ? '✏️ Editar Alergia' : '➕ Nueva Alergia'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}><label style={styles.label}>Nombre*</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={styles.input}/></div>
            <div style={styles.grid2Cols}>
              <div style={styles.inputGroup}><label style={styles.label}>Tipo*</label><select name="tipo" value={formData.tipo} onChange={handleChange} required style={styles.input}><option value="Medicamento">Medicamento</option><option value="Alimento">Alimento</option><option value="Ambiental">Ambiental</option><option value="Otro">Otro</option></select></div>
              <div style={styles.inputGroup}><label style={styles.label}>Gravedad*</label><select name="gravedad" value={formData.gravedad} onChange={handleChange} required style={styles.input}><option value="leve">Leve</option><option value="moderada">Moderada</option><option value="severa">Severa</option><option value="crítica">Crítica</option></select></div>
            </div>
            <div style={styles.inputGroup}><label style={styles.label}>Fecha Diagnóstico*</label><input type="date" name="fechaDiagnostico" value={formData.fechaDiagnostico} onChange={handleChange} required style={styles.input}/></div>
            <div style={styles.inputGroup}><label style={styles.label}>Síntomas</label><textarea name="sintomas" value={formData.sintomas} onChange={handleChange} style={styles.textarea} placeholder="Describa los síntomas principales..."/></div>
            <div style={styles.inputGroup}><label style={styles.label}>Tratamiento</label><textarea name="tratamiento" value={formData.tratamiento} onChange={handleChange} style={styles.textarea} placeholder="Indique tratamiento o recomendaciones..."/></div>
            <div style={styles.inputGroup}><label style={styles.label}>Observaciones</label><textarea name="observaciones" value={formData.observaciones} onChange={handleChange} style={styles.textarea} placeholder="Otras observaciones relevantes..."/></div>
            {editingId && (<div style={styles.inputGroup}><label style={styles.label}>Estado</label><select name="estado" value={formData.estado} onChange={handleChange} style={styles.input}><option value="activa">Activa</option><option value="inactiva">Inactiva</option><option value="resuelta">Resuelta</option></select></div>)}
            <button type="submit" disabled={loading} style={styles.submitButton}>{loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}</button>
          </form>
        </div>
        <div style={styles.formContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={styles.formTitle}>📋 Alergias Registradas</h3>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>{alergias.length} {alergias.length === 1 ? 'registro' : 'registros'}</span>
          </div>
          {loading && !alergias.length ? (<div style={{ textAlign: 'center', padding: '20px' }}><p>Cargando alergias...</p></div>) : alergias.length === 0 ? (<div style={{ textAlign: 'center', padding: '20px' }}><p style={{ marginBottom: '16px' }}>No se han registrado alergias para este paciente.</p><button onClick={resetForm} style={styles.newButton}><span>+</span> Agregar primera alergia</button></div>) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}><th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px' }}>Alergeno</th><th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px' }}>Tipo/Gravedad</th><th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px' }}>Fecha</th><th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px' }}>Estado</th><th style={{ ...styles.tableHeader, padding: '8px 12px', fontSize: '12px', textAlign: 'right' }}>Acciones</th></tr>
                </thead>
                <tbody>
                  {alergias.map(alergia => (
                    <tr key={alergia.aler_cod_aler} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}><div style={{ fontWeight: '500' }}>{alergia.aler_nom_aler}</div><div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{alergia.aler_sin_aler || 'Sin síntomas registrados'}</div></td>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}><div style={{ fontSize: '13px' }}>{alergia.aler_tipo_aler}</div><div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginTop: '4px', backgroundColor: alergia.aler_grav_aler === 'leve' ? '#dcfce7' : alergia.aler_grav_aler === 'moderada' ? '#fef9c3' : alergia.aler_grav_aler === 'severa' ? '#ffedd5' : '#fee2e2', color: alergia.aler_grav_aler === 'leve' ? '#166534' : alergia.aler_grav_aler === 'moderada' ? '#854d0e' : alergia.aler_grav_aler === 'severa' ? '#9a3412' : '#991b1b' }}>{alergia.aler_grav_aler}</div></td>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}><div>{new Date(alergia.aler_fec_aler).toLocaleDateString()}</div><div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{alergia.aler_tra_aler ? 'Con tratamiento' : 'Sin tratamiento'}</div></td>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}><div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: alergia.aler_est_aler === 'activa' ? '#dbeafe' : alergia.aler_est_aler === 'inactiva' ? '#f3f4f6' : '#f3e8ff', color: alergia.aler_est_aler === 'activa' ? '#1e40af' : alergia.aler_est_aler === 'inactiva' ? '#374151' : '#6b21a8' }}>{alergia.aler_est_aler}</div></td>
                      <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'top' }}><button onClick={() => handleEdit(alergia)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '12px', fontSize: '14px' }}>Editar</button><button onClick={() => handleDelete(alergia.aler_cod_aler)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>Eliminar</button></td>
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

AlergiasComponent.propTypes = {
  pacienteId: PropTypes.number.isRequired,
};

export default AlergiasComponent;