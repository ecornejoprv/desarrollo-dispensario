// controllers/receta.controller.js (Código Completo con Logs)

import { getDatosReceta } from '../models/receta.model.js';

export const obtenerDatosRecetaPorAtencionId = async (req, res) => {
    try {
        const { atencionId } = req.params;
        const datosReceta = await getDatosReceta(atencionId);
        res.status(200).json(datosReceta);
    } catch (error) {
        // --- CAMBIO: Se añade un console.error para ver el error en la terminal del backend ---
        console.error("Error detallado en el controlador de recetas:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};