import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Citas from "./pages/Citas";
import Layout from "./components/Layout";
import Pacientes from "./pages/Pacientes";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Odontologia from "./pages/Odontologia";
import Fisioterapia from "./pages/Fisioterapia";
import Enfermeria from "./pages/Enfermeria";
import MedicinaGeneral from "./pages/MedicinaGeneral";
import Atencita from "./pages/Atencita";
import HistoriaClinica from "./pages/HistoriaClinica";
import Pacientesreport from "./pages/Pacientesreport";
import AtencionesEnferReport from "./pages/AtencionesEnferReport";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de Login (sin Layout) */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas que incluyen Navbar */}
        <Route element={<Layout />}>
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/citas"
            element={
              <PrivateRoute>
                <Citas />
              </PrivateRoute>
            }
          />
          <Route
            path="/pacientes"
            element={
              <PrivateRoute>
                <Pacientes />
              </PrivateRoute>
            }
          />
          <Route
            path="/historia-clinica"
            element={
              <PrivateRoute>
                <HistoriaClinica />
              </PrivateRoute>
            }
          />
          <Route
            path="/odontologia"
            element={
              <PrivateRoute requiredRoles={["1", "3"]}>
                <Odontologia />
              </PrivateRoute>
            }
          />
          <Route
            path="/fisioterapia"
            element={
              <PrivateRoute requiredRoles={["1", "4"]}>
                <Fisioterapia />
              </PrivateRoute>
            }
          />
          <Route
            path="/atencita"
            element={
              <PrivateRoute requiredRoles={["1", "5"]}>
                <Atencita />
              </PrivateRoute>
            }
          />
          <Route
            path="/medicina-general"
            element={
              <PrivateRoute requiredRoles={["1", "2"]}>
                <MedicinaGeneral />
              </PrivateRoute>
            }
          />

          <Route
            path="/enfermeria"
            element={
              <PrivateRoute requiredRoles={["1", "2"]}>
                <Enfermeria />
              </PrivateRoute>
            }
          />
          <Route
            path="/pacientesreport"
            element={
              <PrivateRoute requiredRoles={["1", "2"]}>
                <Pacientesreport />
              </PrivateRoute>
            }
          />
          <Route
            path="/enfermreport"
            element={
              <PrivateRoute requiredRoles={["1", "2"]}>
                <AtencionesEnferReport />
              </PrivateRoute>
            }
          />  

        </Route>
        
         
        {/* Redirigir a /login si la ruta no coincide */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;