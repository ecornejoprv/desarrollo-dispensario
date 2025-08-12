// controllers/secuencias.controller.js (Código Completo)

import { generarSiguienteNumeroReceta } from '../models/secuencias.model.js';

export const obtenerSecuencialReceta = async (req, res) => {
    try {
        // El locationId (cita_cod_sucu) vendrá en el body de la petición
        const { locationId } = req.body;
        if (!locationId) {
            return res.status(400).json({ success: false, message: "El ID de la ubicación es requerido." });
        }
        const secuencial = await generarSiguienteNumeroReceta(locationId);
        res.status(200).json({ success: true, secuencial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};