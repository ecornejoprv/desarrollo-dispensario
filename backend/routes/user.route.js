// routes/user.route.js

import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
// Importamos nuestros middlewares de autenticación y roles
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// --- Rutas Públicas ---
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// --- Rutas Protegidas para el Usuario Logueado ---
router.get('/profile', protect, UserController.profile);

// --- RUTAS NUEVAS: SOLO PARA ADMINISTRADORES ---
// Esta ruta ya la tienes, la protegemos con isAdmin
router.get('/', protect, isAdmin, UserController.findAll);

// NUEVA RUTA: Para obtener los permisos de un usuario específico
router.get('/:uid/permissions', protect, isAdmin, UserController.getUserPermissions);

// NUEVA RUTA: Para actualizar los permisos de un usuario específico
router.put('/:uid/permissions', protect, isAdmin, UserController.updateUserPermissions);

// ... (tu otra ruta de update-role-med)
router.put('/update-role-med/:uid', protect, isAdmin, UserController.updateRoleMed);

export default router;