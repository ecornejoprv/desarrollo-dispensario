import {
  crearAntecedentePersonal,
  obtenerAntecedentesPersonales,
  crearAntecedenteGineco,
  obtenerAntecedentesGineco,
  crearAntecedenteTrabajo,
  obtenerAntecedentesTrabajo,
  crearHistorialToxico,
  obtenerHistorialToxico,
  crearAccidenteEnfermedad,
  obtenerAccidentesEnfermedades,
  crearActividadExtralaboral,
  obtenerActividadesExtralaborales,
  actualizarAntecedentePersonal,
  actualizarActividadExtralaboral,
  actualizarAccidenteEnfermedad,
  actualizarHistorialToxico,
  actualizarAntecedenteTrabajo,
  actualizarAntecedenteGineco,
  eliminarAntecedentePersonal,
eliminarAntecedenteGineco,
eliminarAntecedenteTrabajo,
eliminarHistorialToxico,
eliminarAccidenteEnfermedad,
eliminarActividadExtralaboral
} from '../models/antecedentes.model.js';

// Antecedentes Personales
export const crearAntecedentePersonalController = async (req, res) => {
  const { pacienteId, observacion } = req.body;

  if (!pacienteId || !observacion) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const antecedente = await crearAntecedentePersonal(pacienteId, observacion);
    res.status(201).json(antecedente);
  } catch (error) {
    res.status(500).json({ error: "Error al crear antecedente personal: " + error.message });
  }
};

export const obtenerAntecedentesPersonalesController = async (req, res) => {
  const { pacienteId } = req.params;

  if (!pacienteId) {
    return res.status(400).json({ error: "Se requiere el ID del paciente" });
  }

  try {
    const antecedentes = await obtenerAntecedentesPersonales(pacienteId);
    res.status(200).json(antecedentes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener antecedentes personales: " + error.message });
  }
};

// Antecedentes Gineco-Obstétricos
export const crearAntecedenteGinecoController = async (req, res) => {
  try {
    const antecedente = await crearAntecedenteGineco(req.body);
    res.status(201).json(antecedente);
  } catch (error) {
    res.status(500).json({ error: "Error al crear antecedente gineco-obstétrico: " + error.message });
  }
};

export const obtenerAntecedentesGinecoController = async (req, res) => {
  const { pacienteId } = req.params;

  if (!pacienteId) {
    return res.status(400).json({ error: "Se requiere el ID del paciente" });
  }

  try {
    const antecedentes = await obtenerAntecedentesGineco(pacienteId);
    res.status(200).json(antecedentes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener antecedentes gineco-obstétricos: " + error.message });
  }
};

// Antecedentes de Trabajo
export const crearAntecedenteTrabajoController = async (req, res) => {
  try {
    const antecedente = await crearAntecedenteTrabajo(req.body);
    res.status(201).json(antecedente);
  } catch (error) {
    res.status(500).json({ error: "Error al crear antecedente de trabajo: " + error.message });
  }
};

export const obtenerAntecedentesTrabajoController = async (req, res) => {
  const { pacienteId } = req.params;

  if (!pacienteId) {
    return res.status(400).json({ error: "Se requiere el ID del paciente" });
  }

  try {
    const antecedentes = await obtenerAntecedentesTrabajo(pacienteId);
    res.status(200).json(antecedentes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener antecedentes de trabajo: " + error.message });
  }
};

// Historial Tóxico y Estilo de Vida
export const crearHistorialToxicoController = async (req, res) => {
  try {
    const historial = await crearHistorialToxico(req.body);
    res.status(201).json(historial);
  } catch (error) {
    res.status(500).json({ error: "Error al crear historial tóxico: " + error.message });
  }
};

export const obtenerHistorialToxicoController = async (req, res) => {
  const { pacienteId } = req.params;

  if (!pacienteId) {
    return res.status(400).json({ error: "Se requiere el ID del paciente" });
  }

  try {
    const historiales = await obtenerHistorialToxico(pacienteId);
    res.status(200).json(historiales);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener historial tóxico: " + error.message });
  }
};

// Accidentes y Enfermedades
export const crearAccidenteEnfermedadController = async (req, res) => {
  try {
    const registro = await crearAccidenteEnfermedad(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ error: "Error al crear registro de accidente/enfermedad: " + error.message });
  }
};

export const obtenerAccidentesEnfermedadesController = async (req, res) => {
  const { pacienteId } = req.params;

  if (!pacienteId) {
    return res.status(400).json({ error: "Se requiere el ID del paciente" });
  }

  try {
    const registros = await obtenerAccidentesEnfermedades(pacienteId);
    res.status(200).json(registros);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener accidentes/enfermedades: " + error.message });
  }
};

// Actividades Extralaborales
export const crearActividadExtralaboralController = async (req, res) => {
  try {
    const actividad = await crearActividadExtralaboral(req.body);
    res.status(201).json(actividad);
  } catch (error) {
    res.status(500).json({ error: "Error al crear actividad extralaboral: " + error.message });
  }
};

export const obtenerActividadesExtralaboralesController = async (req, res) => {
  const { pacienteId } = req.params;

  if (!pacienteId) {
    return res.status(400).json({ error: "Se requiere el ID del paciente" });
  }

  try {
    const actividades = await obtenerActividadesExtralaborales(pacienteId);
    res.status(200).json(actividades);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener actividades extralaborales: " + error.message });
  }
};
// Antecedentes Personales - UPDATE
export const actualizarAntecedentePersonalController = async (req, res) => {
const { id } = req.params;
const { observacion } = req.body;

if (!observacion) {
  return res.status(400).json({ error: "La observación es requerida" });
}

try {
  const antecedente = await actualizarAntecedentePersonal(id, observacion);
  if (!antecedente) {
    return res.status(404).json({ error: "Antecedente no encontrado" });
  }
  res.status(200).json(antecedente);
} catch (error) {
  res.status(500).json({ error: "Error al actualizar antecedente personal: " + error.message });
}
};

// Antecedentes Gineco-Obstétricos - UPDATE
export const actualizarAntecedenteGinecoController = async (req, res) => {
const { id } = req.params;

try {
  const antecedente = await actualizarAntecedenteGineco(id, req.body);
  if (!antecedente) {
    return res.status(404).json({ error: "Antecedente no encontrado" });
  }
  res.status(200).json(antecedente);
} catch (error) {
  res.status(500).json({ error: "Error al actualizar antecedente gineco-obstétrico: " + error.message });
}
};

// Antecedentes de Trabajo - UPDATE
export const actualizarAntecedenteTrabajoController = async (req, res) => {
const { id } = req.params;

try {
  const antecedente = await actualizarAntecedenteTrabajo(id, req.body);
  if (!antecedente) {
    return res.status(404).json({ error: "Antecedente no encontrado" });
  }
  res.status(200).json(antecedente);
} catch (error) {
  res.status(500).json({ error: "Error al actualizar antecedente de trabajo: " + error.message });
}
};

// Historial Tóxico y Estilo de Vida - UPDATE
export const actualizarHistorialToxicoController = async (req, res) => {
const { id } = req.params;

try {
  const historial = await actualizarHistorialToxico(id, req.body);
  if (!historial) {
    return res.status(404).json({ error: "Registro no encontrado" });
  }
  res.status(200).json(historial);
} catch (error) {
  res.status(500).json({ error: "Error al actualizar historial tóxico: " + error.message });
}
};

// Accidentes y Enfermedades - UPDATE
export const actualizarAccidenteEnfermedadController = async (req, res) => {
const { id } = req.params;

try {
  const registro = await actualizarAccidenteEnfermedad(id, req.body);
  if (!registro) {
    return res.status(404).json({ error: "Registro no encontrado" });
  }
  res.status(200).json(registro);
} catch (error) {
  res.status(500).json({ error: "Error al actualizar accidente/enfermedad: " + error.message });
}
};

// Actividades Extralaborales - UPDATE
export const actualizarActividadExtralaboralController = async (req, res) => {
const { id } = req.params;
const { descripcion } = req.body;

if (!descripcion) {
  return res.status(400).json({ error: "La descripción es requerida" });
}

try {
  const actividad = await actualizarActividadExtralaboral(id, descripcion);
  if (!actividad) {
    return res.status(404).json({ error: "Actividad no encontrada" });
  }
  res.status(200).json(actividad);
} catch (error) {
  res.status(500).json({ error: "Error al actualizar actividad extralaboral: " + error.message });
}
};
// Antecedentes Personales - DELETE
export const eliminarAntecedentePersonalController = async (req, res) => {
const { id } = req.params;

try {
  const antecedente = await eliminarAntecedentePersonal(id);
  if (!antecedente) {
    return res.status(404).json({ error: "Antecedente no encontrado" });
  }
  res.status(200).json({ message: "Antecedente eliminado correctamente", data: antecedente });
} catch (error) {
  res.status(500).json({ error: "Error al eliminar antecedente personal: " + error.message });
}
};

// Antecedentes Gineco-Obstétricos - DELETE
export const eliminarAntecedenteGinecoController = async (req, res) => {
const { id } = req.params;

try {
  const antecedente = await eliminarAntecedenteGineco(id);
  if (!antecedente) {
    return res.status(404).json({ error: "Antecedente no encontrado" });
  }
  res.status(200).json({ message: "Antecedente ginecológico eliminado correctamente", data: antecedente });
} catch (error) {
  res.status(500).json({ error: "Error al eliminar antecedente gineco-obstétrico: " + error.message });
}
};

// Antecedentes de Trabajo - DELETE
export const eliminarAntecedenteTrabajoController = async (req, res) => {
const { id } = req.params;

try {
  const antecedente = await eliminarAntecedenteTrabajo(id);
  if (!antecedente) {
    return res.status(404).json({ error: "Antecedente no encontrado" });
  }
  res.status(200).json({ message: "Antecedente laboral eliminado correctamente", data: antecedente });
} catch (error) {
  res.status(500).json({ error: "Error al eliminar antecedente de trabajo: " + error.message });
}
};

// Historial Tóxico y Estilo de Vida - DELETE
export const eliminarHistorialToxicoController = async (req, res) => {
const { id } = req.params;

try {
  const historial = await eliminarHistorialToxico(id);
  if (!historial) {
    return res.status(404).json({ error: "Registro no encontrado" });
  }
  res.status(200).json({ message: "Historial tóxico eliminado correctamente", data: historial });
} catch (error) {
  res.status(500).json({ error: "Error al eliminar historial tóxico: " + error.message });
}
};

// Accidentes y Enfermedades - DELETE
export const eliminarAccidenteEnfermedadController = async (req, res) => {
const { id } = req.params;

try {
  const registro = await eliminarAccidenteEnfermedad(id);
  if (!registro) {
    return res.status(404).json({ error: "Registro no encontrado" });
  }
  res.status(200).json({ message: "Accidente/enfermedad eliminado correctamente", data: registro });
} catch (error) {
  res.status(500).json({ error: "Error al eliminar accidente/enfermedad: " + error.message });
}
};

// Actividades Extralaborales - DELETE
export const eliminarActividadExtralaboralController = async (req, res) => {
const { id } = req.params;

try {
  const actividad = await eliminarActividadExtralaboral(id);
  if (!actividad) {
    return res.status(404).json({ error: "Actividad no encontrada" });
  }
  res.status(200).json({ message: "Actividad extralaboral eliminada correctamente", data: actividad });
} catch (error) {
  res.status(500).json({ error: "Error al eliminar actividad extralaboral: " + error.message });
}
};