import {useContext, useState} from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';


const ProfilePage = () => {

  const auth = useContext(AuthContext) 
  const navigate = useNavigate()
  const [selectedImage,setSelectedImage] = useState<File | null>(null);
  const nameInitial = auth?.authUser?.fullname || '';
  const bioInitial = auth?.authUser?.bio  || '';

  const [name,setName] = useState(nameInitial)
  const [bio,setBio] = useState(bioInitial)

  if (!auth) return <div>Auth Context not available</div>;

  const {authUser,updateProfile} = auth

  if (!authUser) return <div>User not authenticated</div>;


  const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    if(!selectedImage)
    {
      await updateProfile({fullname:name,bio});
      navigate('/')
      return
    }

    const reader =  new FileReader()
    reader.readAsDataURL(selectedImage)
    reader.onload = async()=>{
      const base64Image = reader.result
      await updateProfile({profilePic:base64Image as string,fullname:name,bio});
    }
    navigate('/')
  }
  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
        <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
                <h3 className='text-lg'>Profile Details</h3>
                <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer m-4'>
                  <input onChange={(e)=>{
                    if(e.target.files && e.target.files.length > 0)
                    {
                      setSelectedImage(e?.target?.files[0])}} 
                    }
                    type="file" id='avatar' accept='.png .jpg .jpeg' hidden/>
                  <img src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} alt="" className={`w-12 h-12 ${selectedImage && 'rounded-full'}`}/>
                  upload profile image
                </label>
                <input onChange={(e)=>{setName(e.target.value)}} value={name} type="text" required placeholder='Your name' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' />
                <textarea onChange={(e)=>{setBio(e.target.value)}} placeholder='Write profile bio' required value={bio} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' rows={4}></textarea>
                <button type='submit' className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer'>Save</button>
            </form>
            <img  className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImage && 'rounded-full'}`}src={authUser.profilePic ||assets.logo_icon} alt="" />
        </div>
    </div>
  )
}

export default ProfilePage