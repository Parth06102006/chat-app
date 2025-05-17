import { Router } from "express";
import { protectedRoutes } from "../middleware/auth.middleware";
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controller/messageContoller";

const router = Router()

//@ts-ignore
router.get('/users',protectedRoutes,getUsersForSidebar)
//@ts-ignore
router.get('/:id',protectedRoutes,getMessages)
//@ts-ignore
router.put('/mark/:id',protectedRoutes,markMessageAsSeen)
//@ts-ignore
router.post('/send/:id',protectedRoutes,sendMessage)

export default router