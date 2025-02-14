import React, { useState } from "react";
import api from "../api"; // Importar la instancia de Axios
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/api/v1/users/login", {
        username,
        password,
      });

      // Guardar el token en localStorage
      localStorage.setItem("token", data.msg.token);

      // Redirigir al Home después del login exitoso
      navigate("/home");
    } catch (error) {
      console.error("Error durante el login:", error);
      alert("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Acceder</button>
      </form>
    </div>
  );
}