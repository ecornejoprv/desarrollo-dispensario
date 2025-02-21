import { useState, useEffect } from "react"; // Solo importa lo que necesitas
import api from "../api"; // Importar la instancia de `api`

export default function Citas() {
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const response = await api.get("/api/v1/citas"); // Usar `api`
        setCitas(response.data);
      } catch (error) {
        console.error("Error fetching citas:", error);
      }
    };

    fetchCitas();
  }, []);

  return (
    <div>
      <h1>Citas</h1>
      <ul>
        {citas.map((cita) => (
          <li key={cita.id}>{cita.description}</li>
        ))}
      </ul>
    </div>
  );
}