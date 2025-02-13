import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.route.js"; // Asegúrate de agregar la extensión .js

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/users", userRoutes);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});