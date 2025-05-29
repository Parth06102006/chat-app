import  { useContext, useEffect, useRef,useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../contexts/ChatContext'
import { AuthContext } from '../contexts/AuthContext'
import {toast} from 'react-hot-toast'

const ChatContainer = () => {
  const scrollEnd = useRef<HTMLDivElement | null>(null)
  const chat  = useContext(ChatContext);
  const auth  = useContext(AuthContext);
  if(!chat)
  {
    throw new Error('no chat context found')
  }
  if(!auth)
  {
    throw new Error('no auth context found')
  }
  const {messages,selectedUser,setSelectedUser,sendMessage,getMessage} = chat
  const {authUser,onlineUsers} = auth
  const [input,setInput] = useState('')

  const handleSendMessage = async (e: React.MouseEvent<HTMLImageElement> | React.KeyboardEvent<HTMLInputElement> | React.FormEvent)=>
    {
      console.log(input)
      e.preventDefault()
      if(!authUser) {
        toast.error("User not authenticated");
        return;
      }
      if(!selectedUser) {
        toast.error("Please select a user to send message");
        return;
      }
      if(input.trim()==='') return;
      await sendMessage({
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text: input.trim(),
      });
      setInput('')
    }

  const handleSendImage = async(e: React.ChangeEvent<HTMLInputElement>)=>{
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0]
    console.log('FILE',file)
    if(!file || !file.type.startsWith('image/'))
    {
      toast.error('Select a image file')
      return
    }
    const reader = new FileReader()
    console.log('Reader',reader)
    reader.onloadend = async () => {
      try {
        if (!authUser || !selectedUser) {
          toast.error("Cannot send image. Missing user information.");
          return;
        }
        const base64Image = reader.result as string;

        await sendMessage({
          senderId: authUser._id,
          receiverId: selectedUser._id,
          text: '',
          image: base64Image,
        })
        e.target.value = ''; // clear input after sending
      } catch (err) {
        //@ts-expect-error if unsuccessful
        console.log(err.message)
        toast.error('Failed to send image');
      }
    };

    reader.readAsDataURL(file)
    console.log('finish')
  }
  useEffect(()=>{
    if(scrollEnd.current && messages){
      scrollEnd.current.scrollIntoView({behavior:"smooth"})
    }
  },[messages])

  useEffect(()=>
    {
      if(selectedUser)
      {
        getMessage(selectedUser._id)
      }
    },[selectedUser])

  if(!authUser)
  {
    return <div>'No User Found'</div>
  }
  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/*header*/ }
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="profile_pic" className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullname}
          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>
        <img onClick={()=>{setSelectedUser(null)}} src={assets.arrow_icon} alt="" className='md:hidden max-w-7'/>
        <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5'/>
      </div>
      {/*chat area */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg , index)=>(
          <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}` }>
            {msg.image ? (<img src={msg.image} alt='' className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'/>) : 
              (<p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId === authUser._id  ? 'rounded-br-none':'rounded-bl-none'}`}>{msg.text}</p>)}
              <div className='text-center text-xs'>
                <img src={msg.senderId === authUser._id ? authUser.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-7 rounded-full'/>
                <p className='text-gray-500'>{msg.createdAt && formatMessageTime(msg.createdAt)}</p>
              </div>
          </div>))}
          <div ref={scrollEnd}></div>
      </div>
      {/*bottom area */}
      <div className='absoute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex flex-1 items-center bg-gray-100/12 px-3 rounded-full'>
          <input onChange={(e)=>{setInput(e.target.value)}} value={input} onKeyDown={(e)=>{if(e.key === 'Enter'){handleSendMessage(e)}}} type="text" placeholder='Send a message' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'/>
          <input onChange={handleSendImage} type="file" id='image' accept='image/png image/jpeg' hidden/>
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer'/>
          </label>
        </div>``
          <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer'/>
      </div>
    </div>
  ) :
  (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/20 max-md:hidden'>
      <img src={assets.logo_icon} className='max-w-16' alt='' />
      <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer