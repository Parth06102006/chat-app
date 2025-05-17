import mongoose from "mongoose";

export const dbConnect = async()=>{
    try {
        mongoose.connection.on('connected',()=>console.log('Database connected'))

        await mongoose.connect(`${process.env.MONGODB_URL}/chat-app`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}