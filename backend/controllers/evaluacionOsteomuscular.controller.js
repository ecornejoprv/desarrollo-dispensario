import {
    listarVersionesPorPaciente,
    crearNuevaVersion,
    obtenerEvaluacionCompleta,
    actualizarEvaluacion
} from '../models/evaluacionOsteomuscular.model.js';

export const listarVersionesController = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const versiones = await listarVersionesPorPaciente(parseInt(pacienteId));
        res.status(200).json(versiones);
    } catch (error) {
        //console.error("Error detallado en listarVersionesController:", error);
        res.status(500).json({ message: "Error al listar las versiones de evaluación.", error: error.message });
    }
};

export const crearNuevaVersionController = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const nuevaVersion = await crearNuevaVersion(parseInt(pacienteId));
        res.status(201).json(nuevaVersion);
    } catch (error) {
        //console.error("Error detallado en crearNuevaVersionController:", error);
        res.status(500).json({ message: "Error al crear una nueva versión de la evaluación.", error: error.message });
    }
};

export const obtenerEvaluacionController = async (req, res) => {
    try {
        const { evaluacionId } = req.params;
        const evaluacion = await obtenerEvaluacionCompleta(parseInt(evaluacionId));
        if (!evaluacion) {
            return res.status(404).json({ message: "Evaluación no encontrada." });
        }
        res.status(200).json(evaluacion);
    } catch (error) {
        //console.error("Error detallado en obtenerEvaluacionController:", error);
        res.status(500).json({ message: "Error al obtener la evaluación.", error: error.message });
    }
};

export const actualizarEvaluacionController = async (req, res) => {
    try {
        const { evaluacionId } = req.params;
        const datosParaActualizar = req.body;

        if (!datosParaActualizar || !datosParaActualizar.datosPrincipales || !datosParaActualizar.detalles) {
            return res.status(400).json({ message: "El cuerpo de la solicitud es inválido. Se esperan 'datosPrincipales' y 'detalles'." });
        }

        const evaluacionActualizada = await actualizarEvaluacion(parseInt(evaluacionId), datosParaActualizar);
        res.status(200).json(evaluacionActualizada);
    } catch (error) {
        //console.error("Error detallado en actualizarEvaluacionController:", error);
        
        res.status(500).json({ message: "Error al actualizar la evaluación.", error: error.message });
    }
};