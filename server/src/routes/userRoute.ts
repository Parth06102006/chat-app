import { Router } from "express";
import { signUp,login,updateProfile,checkAuth } from "../controller/userController";
import { protectedRoutes } from "../middleware/auth.middleware";

const router = Router()

//@ts-ignore
router.post('/signup',signUp)
//@ts-ignore
router.post('/login',login)
//@ts-ignore
router.put('/updated-profile',protectedRoutes,updateProfile)
//@ts-ignore
router.get('/check',protectedRoutes,checkAuth)



export default router