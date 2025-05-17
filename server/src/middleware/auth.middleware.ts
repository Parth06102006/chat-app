import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import jwt from 'jsonwebtoken'

//Middleware to protect routes
export const protectedRoutes = asyncHandler(async(req,res,next)=>{

    try {
        //@ts-ignore
        const token = req.headers.token;
        const decoded = jwt.verify(token,process.env.JWT_SECRET!)
        //@ts-ignore
        const user = await User.findById(decoded.userId).select('-password')
        if(!user)
        {
            throw new ApiError('User not found',403)
        }
        //@ts-ignore
        req.user = user;
        //@ts-ignore
        next();
    } catch (error:any) {
        console.log(error.message)
        throw new ApiError(error.message,400)
    }

})

