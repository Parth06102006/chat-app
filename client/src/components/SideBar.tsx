import { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { ChatContext } from '../contexts/ChatContext'


const SideBar = () => {
    const chat = useContext(ChatContext)
    const navigate = useNavigate()
    const [input,setInput] = useState<string | boolean>(false)
    const auth = useContext(AuthContext)
    if(!chat)
    {
        throw new Error('No chat context found')
    }
    if(!auth)
    {
        throw new Error('No auth context found')
    }
    const {
        getUsers,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
    } = chat
    const {logout,onlineUsers} = auth
    const filteredUsers = input && typeof input==='string' ? users.filter((user)=>user.fullname.toLowerCase().includes(input.toLowerCase())) : users

    useEffect(()=>{getUsers();
        console.log('Online',onlineUsers)
    },[onlineUsers])
  return (
    <div className={`bg-[#8185B2]/20 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? 'max-md:hidden': ''}`}>
        <div className='pb-5'>
            <div className='flex justify-between items-center p-2'>
                <img src={assets.logo} alt="logo" className='max-w-40' />
                <div className='relative py-2 group'>
                    <img src={assets.menu_icon} alt="Menu" className='max-h-5 cursor-pointer' />
                    <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
                        <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
                        <hr className='my-2 border-t border-gray-500' />
                        <p onClick={logout} className='cursor-pointer text-sm'>Logout</p>
                    </div>
                </div>
            </div>
        </div>
        <div className='bg-[#282142] rounded-full flex items-center gap-2  py-3 px-4 mt-5'>
            <img src={assets.search_icon} alt="Search" className='w-3' />
            <input onChange={(e)=>{setInput(e.target.value)}} type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1'placeholder='Search User...' />
        </div>
        <div className='flex flex-col'>
            {filteredUsers.map((user,index)=>(<div key={index} onClick={
                ()=>{
                    setSelectedUser(user); 
                    setUnseenMessages(prev=>({...prev ,[user._id]:0}))
                }
            } 
                className={`relative flex items-center gap-2 p-2 pl-4 rounded-3xl cursor-pointer max-sm:text-sm border mt-2 border-gray-700/30 ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}>
                <img src={user?.profilePic || assets.avatar_icon} alt="" className='w-[35px] aspect-[1/1] rounded-full' />
                <div className='flex flex-col leading-5'>
                    <p>{user?.fullname}</p>
                    {
                        //static data
                        onlineUsers.includes(user._id) ? <span className='text-green-400 text-xs'>Online</span> : <span className='text-neutral-400 text-xs'>Offline</span>
                    }
                </div>
                {unseenMessages[user._id]>0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>{index}</p>}
            </div>))}
        </div>
    </div>
  )
}

export default SideBar