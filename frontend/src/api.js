// src/api.js (Código Completo y Corregido)
// ==============================================================================
// @summary: Se actualiza el interceptor de respuesta para que ignore los
//           errores 401 que provienen específicamente de la ruta de login.
//           Esto permite que el componente de Login maneje los errores de
//           credenciales incorrectas localmente, sin activar el modal global
//           de "sesión expirada".
// ==============================================================================

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { createRoot } from "react-dom/client";
import SessionExpiredModal from "./components/SessionExpiredModal";
import React from "react";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      const activeCompanies = localStorage.getItem('activeCompanies');
      if (activeCompanies) {
        config.headers['X-Active-Companies'] = JSON.parse(activeCompanies).join(',');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // --- CAMBIO CLAVE AQUÍ ---
      // Se añade una condición para verificar que la URL del error NO SEA la de login.
      const isLoginAttempt = error.config.url === '/api/v1/users/login';

      // El modal de sesión expirada solo se mostrará si:
      // 1. El error es 401 (No autorizado) o 403 (Prohibido).
      // 2. Y la petición NO FUE un intento de login.
      if ( (error.response.status === 401 || error.response.status === 403) && !isLoginAttempt ) {
        console.warn("Autorización fallida en una ruta protegida. Limpiando sesión y redirigiendo a login.");
        
        localStorage.clear();

        if (!document.getElementById('session-expired-modal-root')) {
          const modal = document.createElement("div");
          modal.id = 'session-expired-modal-root';
          document.body.appendChild(modal);
          const root = createRoot(modal);
          root.render(
            React.createElement(SessionExpiredModal, {
              isOpen: true,
              onClose: () => {
                root.unmount();
                document.body.removeChild(modal);
                window.location.href = "/login";
              },
            })
          );
        }
      }
    }
    // Para TODOS los errores (incluyendo el 401 del login), se rechaza la promesa
    // para que el bloque .catch() del componente que hizo la llamada pueda manejarlo.
    return Promise.reject(error);
  }
);

export default api;