import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import bcryptjs from 'bcryptjs'
import { generateToken } from "../utils/tokenGenerator";
import ApiResponse from "../utils/ApiResponse";
import cloudinary from '../utils/cloudinary'

export const signUp = asyncHandler(async(req,res)=>{
    //@ts-ignore
    const {fullname,email,password,bio} = req.body;
    if([fullname,email,password,bio].some(t=> t?.trim() === ''))
    {
        throw new ApiError('Missing Details',403)
    }
    console.log('Fullname',fullname)
    console.log('email',email)
    console.log('password',password)
    console.log('bio',bio)
    const existingUser = await User.findOne({email})
    if(existingUser){
        throw new ApiError('User Already Exsists',403)
    }

    try {
        const salt = bcryptjs.genSaltSync(10)
        const hashedPassword = bcryptjs.hashSync(password,salt)

        const newUser = await User.create({email,fullname,bio,password:hashedPassword});

        //@ts-ignore
        const token = generateToken(newUser._id)

        //@ts-ignore
        return res.status(201).json(new ApiResponse('User Created Successfully', {newUser,token}, 201))

    } catch (error:any) {
        console.log('Something went wrong')
        console.log('Signing Up')
        console.log(error.message)
        throw new ApiError('error.message',401)
    }
})

export const login = asyncHandler(async(req,res)=>{
    //@ts-ignore
    const {email,password} = req.body;
    console.log(email,password)
    if(!email||!password)
    {
        throw new ApiError('Missing Details',403)
    }

    try {
        const existingUser = await User.findOne({email})
        if(!existingUser){
            throw new ApiError('User Does not Exsists',403)
        }

        //compare the password with the hashed password
        const isPasswordValid = bcryptjs.compareSync(password,existingUser.password)
        if(!isPasswordValid)
            {
                throw new ApiError('Password Incorrect',403)
            }

        //@ts-ignore
        const token = generateToken(existingUser._id)
        console.log('TOKEN--<',token)

        //@ts-ignore
        return res.status(200).json(new ApiResponse('User Created Successfully',{...existingUser,token}, 200))

    } catch (error:any) {
        console.log('Something went wrong')
        console.log(error.message)
        throw new ApiError('error.message',401)
    }
})

export const checkAuth = asyncHandler(async(req,res)=>
    {
        //@ts-ignore
        return res.json(new ApiResponse('Success',{user:req.user}))
    }
)

//controller to update user profile
export const updateProfile = asyncHandler(async(req,res)=>{
    try {
        //@ts-ignore
        const {profilePic,bio,fullname} = req.body;
        //@ts-ignore
        const userId = req.user._id
        let updatedUser;
        if(!profilePic)
        {
            updatedUser = await User.findByIdAndUpdate(userId,{bio,fullname},{new:true})
        }
        else
        {
            const upload = await cloudinary.uploader.upload(profilePic)
            if(!upload)
            {
                throw new ApiError('Cannot update the ProfilePic',404)
            }

            updatedUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullname},{new:true})
        }

        //@ts-ignore
        return res.status(200).json(new ApiResponse('Profile Pic Updated Successfully',{user:updatedUser},200))
    } catch (error : any) {
        console.log(error.message)
        throw new ApiError('Profile Cannot be Updated',404)
    }   
})