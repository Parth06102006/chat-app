import {Request, Response,NextFunction } from "express";
import ApiError from "../utils/ApiError";


export const errorHandler = (error:ApiError|Error,req:Request,res:Response,next:NextFunction)=>{
    const err = error;
    if(!(error instanceof ApiError))
    {
        //@ts-ignore
        const statusCode = err.statusCode || 404;
        const message = err.message ||'Something went Wrong' ;
        //@ts-ignore
        const error = new ApiError(message,statusCode,err.errors|| [],err.stack)

        const response = 
        {
            ...error,
            mssage:err.message,
        }
        //@ts-ignore
        return res.status(err.statusCode).json(response)
    }
}