import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { createRoot } from "react-dom/client";
import SessionExpiredModal from "./components/SessionExpiredModal";
import React from "react";

const api = axios.create({
  baseURL: "http://localhost:5000", // URL de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para verificar el token antes de cada solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Tiempo actual en segundos

      if (decoded.exp < currentTime) {
        // Si el token ha expirado
        localStorage.removeItem("token"); // Eliminar el token
        localStorage.removeItem("role"); // Eliminar el rol
        localStorage.removeItem("username"); // Eliminar el nombre de usuario

        // Mostrar el modal
        const modal = document.createElement("div");
        document.body.appendChild(modal);
        const root = createRoot(modal);

        root.render(
          React.createElement(SessionExpiredModal, {
            isOpen: true,
            onClose: () => {
              root.unmount(); // Desmontar el modal
              document.body.removeChild(modal);
              window.location.href = "/login"; // Redirigir al login
            },
          })
        );

        return Promise.reject(new Error("Token expirado"));
      } else {
        // Si el token es válido, agregarlo a la solicitud
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Si hay un error al decodificar el token
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");

      // Mostrar el modal
      const modal = document.createElement("div");
      document.body.appendChild(modal);
      const root = createRoot(modal);

      root.render(
        React.createElement(SessionExpiredModal, {
          isOpen: true,
          onClose: () => {
            root.unmount(); // Desmontar el modal
            document.body.removeChild(modal);
            window.location.href = "/login"; // Redirigir al login
          },
        })
      );

      return Promise.reject(new Error("Token inválido"));
    }
  }

  return config;
});

// Función para cerrar sesión
export const logout = async () => {
  try {
    await api.post("/api/v1/users/logout"); // Llama a la ruta de logout en el backend
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    window.location.href = "/login"; // Redirigir al usuario a la página de login
  }
};

export default api;