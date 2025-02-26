import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, requiredRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si la ruta no requiere roles específicos, permitir el acceso
  if (!requiredRoles) {
    return children;
  }

  // Si la ruta requiere roles específicos, verificar si el usuario tiene uno de esos roles
  if (requiredRoles && !requiredRoles.includes(role)) {
    return <Navigate to="/home" />; // O redirigir a una página de "Acceso denegado"
  }

  return children;
};

export default PrivateRoute;