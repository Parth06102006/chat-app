import { useContext,useEffect } from 'react'
import { Routes,Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import {Toaster} from 'react-hot-toast'
import { AuthContext } from './contexts/AuthContext'

const App = () => {
  const auth = useContext(AuthContext)
  if(!auth) {
      throw new Error('AuthContext not found')
  }
  const  {authUser} = auth
  useEffect(()=>{
    console.log('CHANGED...',authUser)
  },[authUser])
  return (
    <div className="bg-[url('./bgImage.svg')] bg-cover">
      <Toaster/>
      <Routes>
        <Route path="/" element={authUser ? <HomePage/>:<Navigate to="/login"/>}/>
        <Route path="/login" element={!authUser ? <LoginPage/>:<Navigate to="/"/>}/>
        <Route path="/profile" element={authUser ? <ProfilePage/>:<Navigate to="/login"/>}/>
        <Route path="*" element={<div><p>Error</p></div>}/>
      </Routes>
    </div>
  )
}

export default App