import { getDatosEmpleadoByCedula } from "../models/empleado.model.js";

export const obtenerDatosEmpleado = async (req, res) => {
  const { cedula, codEmpresa } = req.params;
  
  try {
    const empleado = await getDatosEmpleadoByCedula(cedula, codEmpresa);
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
