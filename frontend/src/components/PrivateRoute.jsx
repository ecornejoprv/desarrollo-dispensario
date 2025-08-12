// src/components/PrivateRoute.jsx (Código Completo y Corregido)
// ==============================================================================
// @summary: Este componente protege las rutas. Se ha actualizado para que use
//           el estado 'loading' del AuthContext. Ahora, muestra un mensaje de
//           "Cargando..." mientras el contexto verifica la sesión. Una vez
//           termina, redirige si no hay sesión o muestra el contenido si la hay,
//           asegurando que todos los componentes hijos (como Navbar) reciban
//           la información del usuario correctamente.
// ==============================================================================

import React from 'react';
import { Navigate }
from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Asegúrate de que la ruta sea correcta
import PropTypes from 'prop-types';

// El componente recibe 'children' (el componente a renderizar) y 'requiredRoles' (opcional).
const PrivateRoute = ({ children, requiredRoles }) => {
  // Obtiene el estado completo de autenticación desde el contexto.
  const { isAuthenticated, user, loading } = useAuth();

  // 1. ESTADO DE CARGA: Mientras el AuthContext está verificando el token (loading === true),
  //    mostramos un mensaje de carga. Esto previene que se renderice el resto de la app
  //    antes de tiempo.
  if (loading) {
    return <div>Cargando sesión...</div>; // O un componente de spinner más elegante.
  }

  // 2. VERIFICACIÓN DE AUTENTICACIÓN: Si la carga ha terminado y el usuario NO está autenticado,
  //    lo redirigimos a la página de login.
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 3. VERIFICACIÓN DE ROLES (Opcional): Si la ruta requiere roles específicos...
  if (requiredRoles && requiredRoles.length > 0) {
    // ...y el rol del usuario no está en la lista de roles requeridos...
    if (!user || !requiredRoles.includes(String(user.role))) {
      // ...lo redirigimos a la página de inicio, ya que no tiene permiso.
      return <Navigate to="/home" />;
    }
  }

  // 4. ACCESO PERMITIDO: Si todas las verificaciones pasan, renderizamos el componente hijo.
  return children;
};

// Se añaden PropTypes para una buena práctica de desarrollo.
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;