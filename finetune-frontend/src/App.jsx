import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeToggle } from "./components/ThemeToggle";
import { useAuth } from "./components/AuthProvider";

function App() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const ProtectedHome = ProtectedRoute(Home)

  useEffect(() => {
    fetch('http://localhost:3000/login/session-status', {credentials: 'include'})
      .then((response)=>response.json())
      .then((data)=>{
        if (data.id){
          setUser(data.id);
          navigate('/home'); //go to home screen if logged in
        } else{
          navigate('/welcome')
        }
      })
  },[]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/home" element={<ProtectedHome />}/>
        {/*Everything except the welcome page is contingent on the user being logged in*/}
      </Routes>
    </div>
  );
}

export default App;
