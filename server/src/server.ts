import express, { Request, RequestHandler, Response } from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { dbConnect } from './db/dbConfig'
import { errorHandler } from './middleware/errorHandler'
import userRouter from './routes/userRoute'
import messageRouter from './routes/messageRoute,'
import { Server } from 'socket.io'

//Creat express app using http server
const app = express()
const server = http.createServer(app)

//Initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // or your frontend origin
    credentials: true,
  },
});

//store online users
type userProps = {[userId:string]:string}
export const userSocketMap:userProps = {} //{userId:socketId}

//Socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log('User Connected',userId)
    if(typeof(userId)==='string' && userId) userSocketMap[userId] = socket.id
    //Emit online users to all connected users
    io.emit('getOnlineUsers',Object.keys(userSocketMap))

    socket.on("disconnect",()=>{
        console.log('User Disconnected',userId)
        if(userId && typeof(userId)==='string') delete userSocketMap[userId];
        io.emit('getOnlineUsers',Object.keys(userSocketMap))
    })
})

//middleware
app.use(express.json({limit:'4mb'}))
app.use(cors())

// app.use('/api/status', (req:Request, res:Response) => res.send('<p>Server is live</p>'))

//Route Setup
app.use('/api/auth',userRouter)
app.use('/api/messages',messageRouter)

//Connect to mongodb

const PORT = process.env.PORT || 5000 ;

dbConnect().then(()=>{server.listen(PORT,()=>console.log(`Server is running on port: ${PORT}`))}).catch(()=>{console.log('Error connecting to the Database')})
//@ts-ignore
app.use(errorHandler)