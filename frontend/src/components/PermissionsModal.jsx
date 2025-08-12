// src/components/PermissionsModal.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect } from 'react';
import api from '../api';
import './styles/PermissionsModal.css'; // Crearemos este archivo para los estilos

const PermissionsModal = ({ user, onClose }) => {
  // Estado para la lista de TODAS las empresas disponibles en el sistema
  const [allCompanies, setAllCompanies] = useState([]);
  // Estado para los permisos ACTUALES del usuario que estamos editando
  const [userPermissions, setUserPermissions] = useState([]);
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // useEffect para cargar los datos cuando se abre el modal (cuando cambia el 'user')
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Hacemos dos llamadas a la API en paralelo para ser más eficientes
        const [companiesResponse, permissionsResponse] = await Promise.all([
          api.get('/api/v1/pacientes/empresas'), // Obtiene todas las empresas
          api.get(`/api/v1/users/${user.usua_cod_usua}/permissions`) // Obtiene los permisos del usuario
        ]);

        setAllCompanies(companiesResponse.data);
        setUserPermissions(permissionsResponse.data.permissions); // Guardamos el array de IDs [182, 192]
        setError('');
      } catch (err) {
        setError('Error al cargar los datos de permisos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.usua_cod_usua]); // Se ejecuta cada vez que el ID del usuario cambie

  // Maneja el cambio en un checkbox
  const handlePermissionChange = (companyId) => {
    setUserPermissions(prevPermissions => {
      // Si el permiso ya existe, lo quitamos (desmarcar)
      if (prevPermissions.includes(companyId)) {
        return prevPermissions.filter(id => id !== companyId);
      } else {
        // Si no existe, lo añadimos (marcar)
        return [...prevPermissions, companyId];
      }
    });
  };

  // Maneja el guardado de los cambios
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      // Llama al endpoint del backend para actualizar los permisos
      await api.put(`/api/v1/users/${user.usua_cod_usua}/permissions`, {
        companyIds: userPermissions // Envía el nuevo array de permisos
      });
      alert('Permisos actualizados correctamente.');
      onClose(); // Cierra el modal después de guardar
    } catch (err) {
      setError('No se pudieron guardar los cambios.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Gestionar Permisos para: {user.usua_nom_usua}</h2>
        
        {loading && <p>Cargando permisos...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="permissions-list">
            {allCompanies.map(company => (
              <div key={company.empr_cod_empr} className="permission-item">
                <label>
                  <input
                    type="checkbox"
                    // El checkbox estará marcado si el ID de la empresa está en el array de permisos del usuario
                    checked={userPermissions.includes(company.empr_cod_empr)}
                    onChange={() => handlePermissionChange(company.empr_cod_empr)}
                  />
                  {company.empr_nom_empr}
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} disabled={saving} className="button-secondary">
            Cancelar
          </button>
          <button onClick={handleSaveChanges} disabled={saving || loading} className="button-primary">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;