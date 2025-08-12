// NUEVO ARCHIVO: middlewares/filterByActiveCompany.middleware.js

export const filterByActiveCompany = (req, res, next) => {
    // req.user y req.userCompanies ya fueron establecidos por el middleware 'protect'.
    const totalUserCompanies = req.userCompanies || [];
    
    const activeCompaniesHeader = req.headers['x-active-companies'];

    // Si no se envía el header, continuamos usando todos los permisos del usuario.
    if (!activeCompaniesHeader) {
        return next();
    }

    // Convierte el header (ej. "182,222") a un array de números.
    const requestedCompanies = activeCompaniesHeader.split(',').map(Number);

    // *** VALIDACIÓN DE SEGURIDAD CRÍTICA ***
    // Verifica que cada empresa solicitada esté en la lista de permisos totales del usuario.
    const isValid = requestedCompanies.every(companyId => totalUserCompanies.includes(companyId));

    if (!isValid) {
        // Si el usuario intenta acceder a empresas para las que no tiene permiso, se le deniega el acceso.
        return res.status(403).json({ message: 'Acceso denegado. Intento de acceso a empresa no autorizada.' });
    }

    // Si la validación es exitosa, sobreescribimos los permisos de la petición
    // para que solo contengan los del grupo de trabajo activo.
    req.userCompanies = requestedCompanies;
    
    next();
};