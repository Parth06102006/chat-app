import { NextFunction} from "express";

type RequestHandler = (req:Request,res:Response,next?:NextFunction) =>Promise<void>

export const asyncHandler = (requestHandler : RequestHandler)=>{
    return ((req:Request,res:Response,next:NextFunction)=>{Promise.resolve(requestHandler(req,res,next)).catch(next)})
}