import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Citas from "./pages/Citas";
import Layout from "./components/Layout"; // Importa el Layout
import Pacientes from "./pages/Pacientes";

function App() {
  console.log("App component is rendering");

  return (
    <Router>
      <Routes>
        {/* Rutas que incluyen Navbar */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/citas" element={<Citas />} />
          <Route path="/pacientes" element={<Pacientes />} />
        </Route>
        {/* Aquí podrías agregar un <Route path="/login" element={<Login />} /> sin Navbar */}
      </Routes>
    </Router>
  );
}

export default App;