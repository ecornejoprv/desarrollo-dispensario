import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import pacientesRoutes from "./routes/pacientes.route.js"; // Importar las rutas de pacientes
import citasRoutes from './routes/citas.route.js'; // Importa las rutas de citas
import atencionRoute from './routes/atencion.route.js'; // Importa las rutas de atenciones
import diagnosticoRoute from './routes/diagnostico.route.js';
import procedimientoRoute from './routes/procedimiento.route.js';
import cie10Route from './routes/cie10.route.js';
// import existenciaCostosRouter from './routes/existenciaCostosRouter.js'; // Importa el router de existenciaCostos
// import productosRouter from './routes/productos.route.js';
import prescripcionesRouter from './routes/prescripciones.route.js';
import fisioterapiaRoute from './routes/fisioterapia.route.js';
import antecedentesRoutes from './routes/antecedentes.route.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/v1/users", userRoutes);
app.use("/api/v1", pacientesRoutes); // Usar las rutas de pacientes
app.use("/api", pacientesRoutes); // Prefijo /api para todas las rutas
app.use('/api/v1', citasRoutes);//CITAS
app.use('/api/v1/atenciones', atencionRoute);
app.use("/api/v1/diagnosticos", diagnosticoRoute);
app.use("/api/v1/procedimientos", procedimientoRoute); 
app.use("/api/v1/cie10", cie10Route);
app.use('/api/v1', prescripcionesRouter);
app.use('/api/v1/fisioterapia', fisioterapiaRoute);
// Monta las rutas de antecedentes bajo /api/v1
app.use('/api/v1', antecedentesRoutes);
// // Rutas de Informix
// app.use('/api/v1', existenciaCostosRouter);
// app.use('/api/v1/productos', productosRouter);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});