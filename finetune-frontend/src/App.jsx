import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { ThemeToggle } from "./components/ThemeToggle";
import { useAuth } from "./components/AuthProvider";

import { Button } from "./components/ui/button";

import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import NewUser from "./pages/NewUser";
import LoadUserSpotify from "./pages/LoadUserSpotify";
import ProtectedRoute from "./components/ProtectedRoute";


const validPaths = ['/newuser', '/loaduserspotify']

function App() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const ProtectedHome = ProtectedRoute(Home);
  const ProtectedNewUser = ProtectedRoute(NewUser);
  const ProtectedLoadSpotify = ProtectedRoute(LoadUserSpotify);

  const handleLogout = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/login/logout`, {
        method: "POST",
        credentials: 'include',
      })
      if (!response.ok){
        throw new Error('failed to logout');
      }
      setUser(null);
      navigate('/');
    } catch(error) {
      console.error(error);
    }
  }


  useEffect(() => {
    fetch('http://127.0.0.1:3000/login/session-status', {credentials: 'include'})
      .then((response)=>response.json())
      .then((data)=>{
        if (data.id){
          setUser(data.id);
          if (!validPaths.includes(window.location.pathname)){ //go to home if you are not on any designated valid paths
            console.log(window.location.pathname);
            navigate('/home');
          }
        } else{
          navigate('/welcome')
        }
      })
  },[]);


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <div className="flex flex-row justify-between gap-2 fixed top-4 right-4">
        <ThemeToggle />
        {user && <Button variant='outline' size='sm'
          className='text-foreground !border-foreground hover:text-background hover:!bg-foreground'
          onClick={handleLogout}
          >Logout</Button>}
      </div>
      <Routes>
        <Route path='/' element={<Navigate to={user ? '/home' : '/welcome'} replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<ProtectedHome />}/>
        <Route path="/newuser" element={<ProtectedNewUser />} />
        <Route path="/loaduserspotify" element={<ProtectedLoadSpotify />} />
        {/*Everything except the welcome page is contingent on the user being logged in*/}
      </Routes>
    </div>
  );
}

export default App;
