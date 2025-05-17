import { createContext, useContext, useState,useEffect,ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({children} : {children:ReactNode})=>{
    const [messages,setMessages] = useState([])
    const [users,setUsers] = useState<string[]>([])
    const [selectedUser,setSelectedUser] = useState<any>(null)
    const [unseenMessages,setUnseenMessages] = useState({})
    const {socket,axios} = useContext(AuthContext)

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
            console.log('Message got',messages)
        } catch (error) {
            // @ts-expect-error if unsuccessful
            toast.error(error.message)
        }
    }

    //function to send Message to selected user
    const sendMessage = async(messageData)=>{
        console.log('Messages before being sent',messages)
        try {
            const {data} = await axios.post(`api/messages/send/${selectedUser._id}`,messageData);

            console.log('Messages',messages)
            if(data.success)
            {
                console.log('Data',data)
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
        socket.on('newMessage',(newMessage)=>{
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


    const value = {
        messages,users,selectedUser,getUsers,getMessage,sendMessage,setSelectedUser,unseenMessages,setUnseenMessages
    }

    return (<ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
)}