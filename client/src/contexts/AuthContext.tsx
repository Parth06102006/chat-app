import React,{createContext, useEffect, useState } from "react"
import axios, { type AxiosInstance } from 'axios'
const backendUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendUrl;
import toast from 'react-hot-toast'
import {io, Socket} from 'socket.io-client'

interface CredentialsTypes {
    fullname?:string
    email?:string
    password?:string
    bio?:string
}

export interface UserType {
  _id: string;
  fullname: string;
  email?: string;
  bio?: string;
  profilePic?: string;
}

interface ProfileUpdationTypes {
    profilePic?:string;
    fullname?:string;
    bio?:string;
}

export interface AuthContextType  
{
    axios:AxiosInstance;
    authUser : UserType | null;
    onlineUsers:string[];
    socket:Socket|null;
    login:(state:'signup'|'login',credentials:CredentialsTypes)=>Promise<void>;
    logout:()=>void;
    updateProfile:(body:ProfileUpdationTypes)=>Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}:{children : React.ReactNode})=>
{
    const [token,setToken] = useState<string|null>(localStorage.getItem('token')||null)
    const [authUser,setAuthUser] = useState<UserType|null>(null)
    const [onlineUsers,setOnlineUsers] = useState<string[]>([])
    const [socket,setSocket] = useState<Socket|null>(null)

    //Chech if the user is authenticated and if so , set the user data and connect the socket
    const checkAuth = async()=>
    {
        try {
            const {data} = await axios.get('/api/auth/check')
            if(data?.success){
                setAuthUser(data.data.user)
                connectSocket(data.data.user)

            }
        } catch (error) {
            // @ts-expect-error if unsuccessful
            toast.error(error.message)
        }
    }

    //Login Function to handle the user authentication and socket connection

    const login = async(state:'signup'|'login',credentials:CredentialsTypes)=>{
        try {
            const {data} = await axios.post(`/api/auth/${state}`,credentials)

            if(data?.success){
                setAuthUser(data.data._doc._id)
                connectSocket(data.userData);
                axios.defaults.headers.common['token'] = data.data.token
                setToken(data.data.token)
                localStorage.setItem('token',data.data.token)
                toast.success(data.message)
            }
            else
            {
                toast.error(data.message)
            }
        } catch (error) {
            // @ts-expect-error if unsuccessful
            toast.error(error.message)
        }
    }

    const logout = async()=>{
        localStorage.removeItem('token');
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        axios.defaults.headers.common['token'] = null
        toast.success('Logout Successfully')
        if(socket) socket.disconnect()
    }

    //Update profile function to handle user profile updates
    const updateProfile = async(body:ProfileUpdationTypes)=>{
        try {
            const {data} = await axios.put('/api/auth/updated-profile',body)
            if(data?.success){
                    setAuthUser(data.data.user);
                    toast.success('Profile Updated Successfully')
            }
        } catch (error) {
            // @ts-expect-error if unsuccessful
            toast.success(error.message)
        }
    }

    //Connect socket function to handle the socket connection and online users updates
    const connectSocket = (userData:UserType)=>{
        if(!userData||socket?.connected) return;
        const newSocket = io(backendUrl,{
            query:{
                userId:userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket)
        newSocket.on('getOnlineUsers',(userIds)=>{
            setOnlineUsers(userIds)
        })
    }

    useEffect(()=>{
        if(token)
        {
            axios.defaults.headers.common['token'] = token;
        }
        checkAuth();
    },[token])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}