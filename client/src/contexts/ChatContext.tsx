import React,{ createContext, useContext, useState,useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";

interface MessageType {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp?: string;
  seen?: boolean;
}

interface UserType {
  _id: string;
  name: string;
  email?: string;
}

interface UnseenMessagesType {
  [userId: string]: number;
}

interface ChatContextType {
  messages: MessageType[];
  users: UserType[];
  selectedUser: UserType | null;
  getUsers: () => Promise<void>;
  getMessage: (userId: string) => Promise<void>;
  sendMessage: (messageData: Omit<MessageType, '_id'>) => Promise<void>;
  setSelectedUser: (user: UserType | null) => void;
  unseenMessages: UnseenMessagesType;
  setUnseenMessages: React.Dispatch<React.SetStateAction<UnseenMessagesType>>;
}



export const ChatContext = createContext<ChatContextType|null>(null);

export const ChatProvider = ({children} : {children:React.ReactNode})=>{
    const [messages,setMessages] = useState<MessageType[]>([])
    const [users,setUsers] = useState<UserType[]>([])
    const [selectedUser,setSelectedUser] = useState<UserType | null>(null)
    const [unseenMessages,setUnseenMessages] = useState<UnseenMessagesType>({})
    const auth = useContext(AuthContext)
    if(!auth) {
        throw new Error('AuthContext not found')
    }
    const {socket,axios} =auth

    //Function to get the users for the sideBar
    const getUsers = async()=>{
        try {
            const {data} = await axios.get('api/messages/users');
            if(data.success){
                setUsers(data.data.users)
                setUnseenMessages(data.data.unseenMessages)
            }
        } catch (error) {
            // @ts-expect-error if unsuccessful
            toast.error(error.message)   
        }
    }

    //Function to get the users for the selected user
    const getMessage = async(userId:string)=>{
        try {
            const {data} = await axios.get(`api/messages/${userId}`);
            if(data.success)
                {
                    setMessages(data.data.messages)
                }
        } catch (error) {
            // @ts-expect-error if unsuccessful
            toast.error(error.message)
        }
    }

    //function to send Message to selected user
    const sendMessage = async(messageData : Omit<MessageType, '_id'>):Promise<void>=>{
        try {
            if(!selectedUser) return ;
            const {data} = await axios.post(`api/messages/send/${selectedUser._id}`,messageData);
            if(data.success)
            {
                setMessages((prevMessage)=>[...prevMessage,data.data.message])
            }
        } catch (error) {
            // @ts-expect-error if unsuccessful
            toast.error(error.message)
        }
    }

    //Function to subscribe to messages for selcted User
    const subscribeToMessages = async()=>{
        if(!socket) return;
        socket.on('newMessage',(newMessage:MessageType)=>{
                if (selectedUser && newMessage.senderId === selectedUser._id)
                {
                    newMessage.seen = true
                    setMessages((prevMessage)=>[...prevMessage,newMessage])
                    axios.put(`/api/messages/mark/${newMessage._id}`)
                }
                else
                {
                    setUnseenMessages((prevUnseenMessages)=>({
                        ...prevUnseenMessages,[newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                    }))
                }
            }   
        )
    }

    //Function to unsubscorbe from messages
    const unsubscribeFromMessages = ()=>{
        if(socket) socket.off('newMessage');
    }

    useEffect(()=>{
        subscribeToMessages()
        return ()=>{unsubscribeFromMessages()}
    },[socket,selectedUser])


  const value: ChatContextType = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessage,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

    return (<ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
)}