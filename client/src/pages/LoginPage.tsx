import { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../contexts/AuthContext'

const LoginPage = () => {
    const [currentState,setCurrentState] = useState<string>('SignUp')
    const [fullname,setFullName] = useState<string>('')
    const [email,setEmail] = useState<string>('')
    const [password,setPassword] = useState<string>('')
    const [bio,setBio] = useState<string>('')
    const [isDataSubmitted,setIsDataSubmitted] = useState<boolean>(false);
    const auth = useContext(AuthContext)
    if(!auth) {
        throw new Error('AuthContext not found')
    }
    const {login} = auth
    
    const onSubmitHandler = (event:React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        if(currentState ==='SignUp' && !isDataSubmitted)
            {
                setIsDataSubmitted(true)
                return;
            }
            login(currentState === 'SignUp' ? 'signup':'login',{fullname,email,password,bio})
    }


  return (
      <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
        {/*left */}
        <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]'/>
        {/*right */}
        <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
            <h2 className='font-medium text-2xl flex justify-between items-center'>
                {currentState}
                {isDataSubmitted && <img onClick={()=>{setIsDataSubmitted(false)}} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/>}
            </h2>
            {currentState === 'SignUp' && !isDataSubmitted && (
            <input type="text" onChange={(e)=>{setFullName(e.target.value)}} className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Full Name' required/>)}
            {!isDataSubmitted && (
                <>
                    <input onChange={(e)=>{setEmail(e.target.value)}} type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
                    <input onChange={(e)=>{setPassword(e.target.value)}} type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
                </>
            )}
            {
                currentState === 'SignUp' && isDataSubmitted && (
                    <textarea rows={4} onChange={(e)=>{setBio(e.target.value)}} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Provide a short bio' required></textarea>
                )
            }
            <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
                {currentState === 'SignUp' ? 'Create Account' : 'Login Now'}
            </button>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
                <input type="checkbox" />
                <p>Agree to the terms of use & privacy policy</p>
            </div>
            <div className='flex flex-col gap-2'>
                {currentState === 'SignUp' ? (<p className='text-sm text-gray-600'>Already have a account?<span onClick={()=>{setCurrentState('Login');setIsDataSubmitted(false)}} className='text-violet-500 font-medium cursor-pointer'>Login here</span></p>) : (<p className='text-sm text-gray-600'>Create an account <span onClick={()=>setCurrentState('SignUp')} className='text-violet-500 font-medium cursor-pointer'>Click here</span></p>)}
            </div>
        </form>
    </div>
  )
}

export default LoginPage