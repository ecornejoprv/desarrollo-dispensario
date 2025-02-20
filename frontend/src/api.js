import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // URL de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


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