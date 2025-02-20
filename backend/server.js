import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import pacientesRoutes from "./routes/pacientes.route.js"; // Importar las rutas de pacientes

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/v1/users", userRoutes);
app.use("/api/v1", pacientesRoutes); // Usar las rutas de pacientes

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});