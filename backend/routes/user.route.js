import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { verifyAdmin, verifyToken } from "../middlewares/jwt.middleware.js";

const router = Router()

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/profile', verifyToken, UserController.profile)

//Admin
router.get('/', verifyToken, verifyAdmin, UserController.findAll)
router.put('/update-role-med/:uid',verifyToken, verifyAdmin, UserController.updateRoleMed)

export default router;