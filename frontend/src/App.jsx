import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Citas from "./pages/Citas";
import Layout from "./components/Layout"; // Importa el Layout
import Pacientes from "./pages/Pacientes";
import Login from "./pages/Login"; // Importa el componente Login
import PrivateRoute from "./components/PrivateRoute"; // Importa el componente PrivateRoute

function App() {
  console.log("App component is rendering");

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
        </Route>

        {/* Redirigir a /login si la ruta no coincide */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;