import { jwtDecode } from "jwt-decode"; 

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos
    return decoded.exp < currentTime; // Devuelve true si el token ha expirado
  } catch (error) {
    return true; // Si hay un error, considera el token como expirado
  }
};