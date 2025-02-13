import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {

    let token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }

    token = token.split(" ")[1];

    try {

        const { username, role_id } = jwt.verify(token, process.env.JWT_SECRET); // Extraer el username del payload
        req.user = username; // Asignar el username a req.user
        req.role_id = role_id; // Asignar el role_id a req.role_id
        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: 'Invalid token'
        })
        
    }
}

export const verifyAdmin = (req, res, next) => {
    if (req.role_id == 1) {
        return next()
    }
    return res.status(403).json({ error: "Unauthorized only admin user" });
}

export const verifyMedico = (req, res, next) => {
    if (req.role_id == 2 || req.role_id == 1) {
        return next()
        
    }
    return res.status(403).json({ error: "Unauthorized only medico" });
}

export const verifyEnfermera = (req, res, next) => {
    if (req.role_id == 3) {
        return next()
        
    }
    return res.status(403).json({ error: "Unauthorized only enfermera" });
}