// middlewares/company.middleware.js
import jwt from 'jsonwebtoken';

export const extractUserCompanies = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.log("DEBUG MIDDLEWARE: No se proporcionó token en la solicitud."); // Log para depuración
        return res.status(401).json({ ok: false, msg: 'No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userCompanies = decoded.empresas_acceso || []; // Almacena el array de empresas en req.userCompanies
        console.log("DEBUG MIDDLEWARE: Token decodificado. userCompanies en req:", req.userCompanies); // Log para depuración
        next(); // Continúa con la siguiente función middleware o controlador de ruta
    } catch (error) {
        console.error("DEBUG MIDDLEWARE: Error al decodificar o verificar token:", error.message); // Log mejorado
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ ok: false, msg: 'Token expirado. Por favor, inicie sesión nuevamente.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ ok: false, msg: 'Token inválido. Acceso denegado.' });
        }
        return res.status(500).json({ ok: false, msg: 'Error interno del servidor al procesar el token.' });
    }
};