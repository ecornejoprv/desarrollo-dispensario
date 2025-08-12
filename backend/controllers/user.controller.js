import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import  {UserModel}  from '../models/user.model.js';


const register = async (req, res) => {
    try {
        console.log(req.body);
        const { username, password, email } = req.body;

        //aquí hacer la validación de ingreso de datos
        if (!username || !password || !email) {
            return res.status(400).json({ 
                ok: false, 
                msg: 'username, password and email are required' 
            })
        }

        //Valido si el usuario ya existe
        const user  = await UserModel.findOneByUserName(username);

        if (user) {
            return res.status(409).json({ 
                ok: false, 
                msg: 'username already exists' 
            })
        }
        //Creación del usuario
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = await UserModel.create({ username, password: hashedPassword, email })

//        Token //Falta hacerle el refresh
        const token = jwt.sign({ username: newUser.usua_nom_usua, role_id: newUser.role_id }, 
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )

        return res.status(201).json({ 
            ok: true, 
            msg: {token, role_id: newUser.role_id}     
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            ok: false, 
            msg: token 
        })
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        const user = await UserModel.findOneByUserName(username);
        if (!user) {
            return res.status(404).json({ ok: false, msg: 'Usuario o contraseña incorrectos' }); // Mensaje más genérico
        }

        const isMatch = await bcryptjs.compare(password, user.usua_pass_usua);
        if (!isMatch) {
            return res.status(401).json({ ok: false, msg: 'Usuario o contraseña incorrectos' }); // Mensaje más genérico
        }

        // --- CAMBIO CLAVE AQUÍ ---
        // El payload del token ahora solo contiene el identificador único del usuario.
        const payload = {
            uid: user.usua_cod_usua
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "10h" }
        );

        // La respuesta al frontend sigue siendo la misma, enviando los datos que necesita la UI.
        // La diferencia es que 'empresas_acceso' ya no está DENTRO del token.
        const especialidad = await UserModel.getEspecialidadByMedicoId(user.usua_cod_medic);

        return res.json({
            ok: true,
            msg: {
                token,
                role_id: user.role_id,
                username: user.usua_nom_usua,
                nombre_completo: user.usua_nombre_completo,
                especialista: user.usua_cod_medic,
                especialidad,
                empresas_acceso: user.empresas_acceso || [],
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, msg: 'Internal server error' });
    }
};

const logout = async (req, res) => {
    try {
      // Aquí puedes invalidar el token si es necesario
      // Por ejemplo, almacenar el token en una lista negra (blacklist)
      return res.status(200).json({ ok: true, msg: "Logged out successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ ok: false, msg: "Internal server error" });
    }
  };

const profile = async (req, res) => {
    try {
        const usuario = await UserModel.findOneByUserName(req.user)
        return res.json({ok: true, msg: usuario})   
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
        
    }
}

const findAll = async (req, res) => {
    try {
        const users = await UserModel.findAll()

        return res.json({ok: true, msg: users})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
        
    }
}

const updateRoleMed = async (req, res) => {
    try {
        const {uid} = req.params
        
        const user = await UserModel.findOneByUid(uid)
        if(!user) {
            return res.status(404).json({ 
                ok: false, 
                msg: 'username not found' 
            })
        }
        const updateUser = await UserModel.updateRoleMed(uid)

        return res.json({ok: true, msg: updateUser})


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: 'Error server'
        })
        
    }
}

// NUEVO CONTROLADOR: Obtiene los permisos actuales de un usuario
const getUserPermissions = async (req, res) => {
    try {
        const { uid } = req.params;
        const permissions = await UserModel.findPermissionsByUid(uid);
        return res.json({ ok: true, permissions });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, msg: 'Error al obtener permisos.' });
    }
};

// NUEVO CONTROLADOR: Actualiza la lista de permisos de un usuario
const updateUserPermissions = async (req, res) => {
    try {
        const { uid } = req.params;
        const { companyIds } = req.body; // Espera un array de IDs de empresa, ej: [182, 222]

        if (!Array.isArray(companyIds)) {
            return res.status(400).json({ ok: false, msg: 'companyIds debe ser un array.' });
        }

        await UserModel.updatePermissionsForUser(uid, companyIds);
        
        return res.json({ ok: true, msg: 'Permisos actualizados correctamente.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, msg: 'Error al actualizar permisos.' });
    }
};


export const UserController = {
    register, 
    login,
    profile,
    findAll,
    updateRoleMed,
    getUserPermissions,     
    updateUserPermissions
}