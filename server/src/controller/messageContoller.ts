import { asyncHandler } from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import Message from "../models/Message";
import cloudinary from "../utils/cloudinary";
import { io,userSocketMap } from "../server";

//Get All users except the logged in user

export const getUsersForSidebar = asyncHandler(async(req,res)=>{
    try {
        //@ts-ignore
        const userId = req.user._id
        const filteredUsers = await User.find({_id:{$ne:userId}}).select('-password')

        //Count number of messages not seen
        const unseenMessages = {}
        const promises = filteredUsers.map(async(user)=>{
            const messages = await Message.find({senderId:user._id,receiverId:userId,seen:false})
            if(messages.length>0){
                //@ts-ignore
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        //@ts-ignore
        return res.status(200).json(new ApiResponse('Users Messages got successfully',{users:filteredUsers,unseenMessages:unseenMessages}))
    } catch (error:any) {
        console.log(error.message)
        throw new ApiError(error.message,404)
    }
})

//Get all messages for the selected User
export const getMessages = asyncHandler(async(req,res)=>{
    try {
        //@ts-ignore
        const selectedUserId = req.params.id
        //@ts-ignore
        const myId = req.user._id

        const messages = await Message.find({$or:[
            {senderId:myId,receiverId:selectedUserId},
            {senderId:selectedUserId,receiverId:myId},
        ]}).select('-password')

        await Message.updateMany({senderId:selectedUserId, receiverId:myId},{seen:true})

        //@ts-ignore
        return res.status(200).json(new ApiResponse('Users Messages got successfully',{messages}))
    } catch (error:any) {
        console.log(error.message)
        throw new ApiError(error.message,404)
    }
})

//api to amrk message as seen using message id
export const markMessageAsSeen = asyncHandler(async(req,res)=>{
    try {
        //@ts-ignore
        const {id} = req.params;
        await Message.findByIdAndUpdate(id,{seen:true})
        //@ts-ignore
        return res.status(200).json(new ApiResponse('Seen Messages'))
    } catch (error : any) {
        console.log(error.message)
        throw new ApiError(error.message,404)
    }
})

export const sendMessage = asyncHandler(async(req,res)=>{
    try {
        //@ts-ignore
        const {text,image} = req.body;
        console.log(text)
        console.log(image)
        //@ts-ignore
        const receiverId = req.params.id;
        //@ts-ignore
        const senderId = req.user._id;
        let imageUrl;
        if(image)
        {
            const uploadResponse = await cloudinary.uploader.upload(image);
            if(uploadResponse)
                {
                    imageUrl = uploadResponse.secure_url;
                }
            }
            const newMessage = await Message.create({senderId,receiverId,text,image:imageUrl})
            console.log(newMessage)
            //Emit the new message to the receiver socket
            const receiverSocketId = userSocketMap[receiverId]
            if(receiverSocketId){
                io.to(receiverSocketId).emit('newMessage',newMessage)
            }
            
        //@ts-ignore
        return res.status(200).json(new ApiResponse('Message Sent',{message:newMessage}))
    } catch (error) {
        
    }
})