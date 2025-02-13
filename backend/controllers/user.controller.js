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
        console.log(req.body);
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({error: 'username and password are required'})
        }

        const user = await UserModel.findOneByUserName(username);
        if(!user) {
            return res.status(404).json({ 
                ok: false, 
                msg: 'username not found' 
            })
        }

        const isMatch = await bcryptjs.compare(password, user.usua_pass_usua)

        if (!isMatch) {
            return res.status(401).json({ 
                ok: false, 
                msg: 'invalid password' 
            })
        }

        const token = jwt.sign({ username: user.usua_nom_usua, role_id: user.role_id }, 
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        )

        return res.json({ 
            ok: true, 
            msg: {token, role_id: user.role_id}       
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            ok: false, 
            msg: 'Internal server error' 
        })
    }
}

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

export const UserController = {
    register, 
    login,
    profile,
    findAll,
    updateRoleMed
}