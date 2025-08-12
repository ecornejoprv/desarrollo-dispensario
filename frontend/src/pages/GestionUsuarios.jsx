// src/pages/GestionUsuarios.jsx (Versión con Lista de Usuarios)

import React, { useState, useEffect } from 'react';
import api from '../api'; // Nuestra instancia de Axios
import './styles/GestionUsuarios.css'; // Crearemos este archivo para los estilos
import PermissionsModal from '../components/PermissionsModal'; // El modal que crearemos en el siguiente paso

const GestionUsuarios = () => {
  // Estado para almacenar la lista de usuarios obtenida de la API
  const [users, setUsers] = useState([]);
  // Estado para gestionar la carga de datos
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores
  const [error, setError] = useState('');
  
  // Estados para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // useEffect para cargar la lista de usuarios cuando el componente se monta
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Hacemos la llamada al endpoint que lista todos los usuarios (protegido por isAdmin)
        const response = await api.get('/api/v1/users');
        setUsers(response.data.msg); // Guardamos la lista en el estado
        setError('');
      } catch (err) {
        setError('No se pudo cargar la lista de usuarios.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // El array vacío asegura que se ejecute solo una vez

  // Función para abrir el modal de permisos para un usuario específico
  const handleManagePermissions = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="gestion-usuarios-container">
      <h1>Gestión de Usuarios</h1>
      <p>Administra los permisos de acceso a empresas para cada usuario del sistema.</p>

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre de Usuario</th>
            <th>Email</th>
            <th>Rol ID</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.usua_cod_usua}>
              <td>{user.usua_cod_usua}</td>
              <td>{user.usua_nom_usua}</td>
              <td>{user.usua_email_usua}</td>
              <td>{user.role_id}</td>
              <td>
                <button 
                  className="permissions-button"
                  onClick={() => handleManagePermissions(user)}
                >
                  Gestionar Permisos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* El modal se renderizará aquí cuando isModalOpen sea true */}
      {isModalOpen && selectedUser && (
        <PermissionsModal
          user={selectedUser}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default GestionUsuarios;