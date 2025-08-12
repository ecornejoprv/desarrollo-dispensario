// App.jsx (Código Completo y Actualizado)
// ==============================================================================
// @summary: Se elimina la ruta para '/seleccionar-empresa' y su importación,
//           ya que el flujo de selección de contexto ahora está integrado
//           directamente en el componente de Login.
// ==============================================================================

// --- 1. IMPORTACIONES DE MÓDulos Y COMPONENTES ---

import { AuthProvider } from "./components/context/AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importa todas las páginas
import Home from "./pages/Home";
import Citas from "./pages/Citas";
import Pacientes from "./pages/Pacientes";
import Login from "./pages/Login";
import Odontologia from "./pages/Odontologia";
import Fisioterapia from "./pages/Fisioterapia";
import Enfermeria from "./pages/Enfermeria";
import MedicinaGeneral from "./pages/MedicinaGeneral";
import Atencita from "./pages/Atencita";
import HistoriaClinica from "./pages/HistoriaClinica";
import ReporteAtenciones from "./pages/ReporteAtenciones";
import ReporteActividades from "./pages/ReportatencionesEnfer";
import ReporteDiagnosticosGenero from "./pages/Reportecie10";
import Reporteprevencion from "./pages/ReportePrevencion";
import ReporteMorbilidad from "./pages/MorbiReport";
import GestionUsuarios from "./pages/GestionUsuarios"; 

// Importa componentes de estructura y protección.
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import { MasterDataProvider } from './components/context/MasterDataContext';
// Se elimina la importación de CompanySelector, ya no es necesario.

// --- 2. DEFINICIÓN DEL COMPONENTE PRINCIPAL DE LA APLICACIÓN ---
function App() {
  return (
    <Router>
      <AuthProvider>
        <MasterDataProvider>
          <Routes>

            {/* --- A. RUTA PÚBLICA --- */}
            <Route path="/login" element={<Login />} />

            {/* --- B. RUTAS PROTEGIDAS --- */}
            <Route element={<Layout />}>
              
              <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/citas" element={<PrivateRoute><Citas /></PrivateRoute>} />
              <Route path="/pacientes" element={<PrivateRoute><Pacientes /></PrivateRoute>} />
              <Route path="/historia-clinica" element={<PrivateRoute><HistoriaClinica /></PrivateRoute>} />
              <Route path="/reporte-atenciones" element={<PrivateRoute><ReporteAtenciones /></PrivateRoute>} />
              <Route path="/odontologia" element={<PrivateRoute requiredRoles={["1", "3"]}><Odontologia /></PrivateRoute>} />
              <Route path="/fisioterapia" element={<PrivateRoute requiredRoles={["1", "4"]}><Fisioterapia /></PrivateRoute>} />
              <Route path="/atencita" element={<PrivateRoute requiredRoles={["1", "5"]}><Atencita /></PrivateRoute>} />
              <Route path="/medicina-general" element={<PrivateRoute requiredRoles={["1", "2"]}><MedicinaGeneral /></PrivateRoute>} />
              <Route path="/enfermeria" element={<PrivateRoute requiredRoles={["1", "5"]}><Enfermeria /></PrivateRoute>} />
              <Route path="/enfermreport" element={<PrivateRoute requiredRoles={["1", "5"]}><ReporteActividades /></PrivateRoute>} />
              <Route path="/cie10report" element={<PrivateRoute requiredRoles={["1", "5", "2"]}><ReporteDiagnosticosGenero /></PrivateRoute>} />
              <Route path="/prevencionreport" element={<PrivateRoute requiredRoles={["1", "5", "2"]}><Reporteprevencion /></PrivateRoute>} />
              <Route path="/morbireport" element={<PrivateRoute requiredRoles={["1", "5", "2"]}><ReporteMorbilidad /></PrivateRoute>} />
              
              <Route
                path="/admin/usuarios"
                element={
                  <PrivateRoute requiredRoles={["1"]}>
                    <GestionUsuarios />
                  </PrivateRoute>
                }
              />
              
              {/* Se elimina la ruta a '/seleccionar-empresa' de esta sección. */}

            </Route>

            {/* --- C. RUTA COMODÍN (Catch-all) --- */}
            <Route path="*" element={<Navigate to="/login" />} />

          </Routes>
        </MasterDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;