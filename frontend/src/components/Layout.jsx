import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useState } from "react";

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Pasamos el estado "open" al Navbar para que controle el menú */}
      <Navbar open={open} setOpen={setOpen} />
      
      {/* Contenedor principal */}
      <div className={`main-content ${open ? "shifted" : ""}`}>
        <Outlet /> {/* Aquí se renderizan las páginas */}
      </div>
    </div>
  );
}
