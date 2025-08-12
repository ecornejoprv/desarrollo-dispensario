// server.js (Versión Completa y Definitiva, sin Omisiones)
// ==============================================================================
// @summary: Se añade el middleware 'filterByActiveCompany' a la cadena de
//           protección de rutas para filtrar los datos según el contexto de
//           trabajo activo seleccionado por el usuario en el frontend.
// ==============================================================================

// --- 1. IMPORTACIÓN DE MÓDULOS Y RUTAS ---
import express from "express";
import cors from "cors";

// Importación de todas las rutas de la aplicación.
import userRoutes from "./routes/user.route.js";
import pacientesRoutes from "./routes/pacientes.route.js";
import citasRoutes from './routes/citas.route.js';
import atencionRoute from './routes/atencion.route.js';
import diagnosticoRoute from './routes/diagnostico.route.js';
import procedimientoRoute from './routes/procedimiento.route.js';
import cie10Route from './routes/cie10.route.js';
import existenciaCostosRouter from './routes/existenciaCostosRouter.js';
import productosRouter from './routes/productos.route.js';
import prescripcionesRouter from './routes/prescripciones.route.js';
import fisioterapiaRoute from './routes/fisioterapia.route.js';
import antecedentesRoutes from './routes/antecedentes.route.js';
import triajesRoutes from './routes/triaje.route.js';
import alergiasRoutes from './routes/alergias.route.js';
import empleadoRoutes from './routes/empleado.route.js';
import odontogramaRoute from './routes/odontograma.route.js';
import evaluacionOsteomuscularRoute from './routes/evaluacionOsteomuscular.route.js';
import anticonceptivosRoutes from './routes/anticonceptivos.route.js';
import reporteRoutes from './routes/reportecie10.route.js';
import reportecombinadoroute from './routes/reportecombinado.route.js';
import prevencionRoutes from './routes/prevencion.route.js';
import reportesSistemasRoutes from './routes/morbi.route.js';
import secuenciasRoutes from './routes/secuencias.route.js';
import recetaRoutes from './routes/receta.route.js';
import medicoRoutes from './routes/medico.route.js';

// --- 2. IMPORTACIÓN DE MIDDLEWARES DE SEGURIDAD ---
// Middleware principal que verifica el token y carga los permisos TOTALES del usuario.
import { protect, isAdmin } from "./middlewares/auth.middleware.js";
// NUEVO middleware que filtra los permisos según el contexto de trabajo activo.
import { filterByActiveCompany } from "./middlewares/filterByActiveCompany.middleware.js";

// --- 3. CONFIGURACIÓN INICIAL DE LA APP EXPRESS ---
const app = express();
app.use(cors());
app.use(express.json());

// --- 4. DEFINICIÓN DE RUTAS ---

// --- A. RUTAS PÚBLICAS ---
// Rutas que no requieren autenticación, como login y registro.
app.use("/api/v1/users", userRoutes);

// --- B. RUTAS PROTEGIDAS ---
// Todas las rutas a partir de aquí requieren un token válido.
// La cadena de middlewares `protect, filterByActiveCompany` asegura que:
// 1. El usuario esté autenticado.
// 2. Los datos se filtren según el grupo de empresas activo que el usuario seleccionó.

// Módulos que dependen directamente del contexto de la empresa activa
app.use('/api/v1/pacientes', protect, filterByActiveCompany, pacientesRoutes);
app.use('/api/v1/citas', protect, filterByActiveCompany, citasRoutes);
app.use('/api/v1/atenciones', protect, filterByActiveCompany, atencionRoute);
app.use('/api/v1/prescripciones', protect, filterByActiveCompany, prescripcionesRouter);
app.use('/api/v1/triajes', protect, filterByActiveCompany, triajesRoutes);
app.use('/api/v1/antecedentes', protect, filterByActiveCompany, antecedentesRoutes);
app.use('/api/v1/alergias', protect, filterByActiveCompany, alergiasRoutes);
app.use('/api/v1/odontograma', protect, filterByActiveCompany, odontogramaRoute);
app.use('/api/v1/fisioterapia', protect, filterByActiveCompany, fisioterapiaRoute);
app.use('/api/v1/anticonceptivos', protect, filterByActiveCompany, anticonceptivosRoutes);
app.use('/api/v1/evaluacion-osteomuscular', protect, filterByActiveCompany, evaluacionOsteomuscularRoute);
app.use('/api/v1/empleados', protect, filterByActiveCompany, empleadoRoutes);

// Reportes que también deben ser filtrados por el contexto de la empresa activa
app.use('/api/v1/reportes/cie10', protect, filterByActiveCompany, reporteRoutes);
app.use('/api/v1/reportes/combinado', protect, filterByActiveCompany, reportecombinadoroute);
app.use('/api/v1/reportes/prevencion', protect, filterByActiveCompany, prevencionRoutes);
app.use('/api/v1/reportes/morbilidad', protect, filterByActiveCompany, reportesSistemasRoutes);
app.use('/api/v1/secuencias', secuenciasRoutes);

// Módulos que solo necesitan autenticación pero son globales (no dependen de la empresa activa)
app.use("/api/v1/diagnosticos", protect, diagnosticoRoute);
app.use("/api/v1/procedimientos", protect, procedimientoRoute);
app.use("/api/v1/cie10", protect, cie10Route);
app.use('/api/v1/existencias', protect, existenciaCostosRouter);
app.use('/api/v1/productos', protect, productosRouter);
app.use('/api/v1/recetas', recetaRoutes);
app.use('/api/v1/medicos', protect, medicoRoutes);

// --- 5. INICIALIZACIÓN DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});