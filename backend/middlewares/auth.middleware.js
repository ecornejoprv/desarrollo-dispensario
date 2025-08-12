// NUEVO ARCHIVO: middlewares/auth.middleware.js

import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js'; // Ajusta la ruta si es necesario

/**
 * Middleware para proteger rutas. Verifica el token y adjunta el usuario y sus permisos al request.
 */
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Obtener token del header
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar token y obtener el payload { uid: ... }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. OBTENER USUARIO Y PERMISOS FRESCOS DESDE LA BD
            // Esta es la parte más importante. Usamos el uid del token para buscar en la BD.
            const userWithPermissions = await UserModel.findOneByUid(decoded.uid);
            
            if (!userWithPermissions) {
                return res.status(401).json({ message: 'El usuario de este token ya no existe.' });
            }

            // 4. Adjuntar la información al objeto `req`
            req.user = userWithPermissions; // Objeto de usuario completo
            
            // Para mantener la compatibilidad con tu código actual, buscamos también las empresas
            const userCompaniesDetails = await UserModel.findOneByUserName(userWithPermissions.usua_nom_usua);
            req.userCompanies = userCompaniesDetails.empresas_acceso || []; // Permisos de empresa

            next();
        } catch (error) {
            console.error('ERROR DE AUTENTICACIÓN:', error.name);
            return res.status(401).json({ message: 'No autorizado, token inválido o expirado.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
    }
};

/**
 * Middleware para verificar si el usuario es Administrador.
 * Debe usarse SIEMPRE DESPUÉS de `protect`.
 */
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role_id === 1) { // Asume que el rol de admin es 1
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
};

// Puedes crear más verificadores de rol de la misma manera
export const isMedico = (req, res, next) => {
    if (req.user && (req.user.role_id === 2 || req.user.role_id === 1)) {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado.' });
    }
};