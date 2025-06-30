import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import NewUser from "./pages/NewUser";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeToggle } from "./components/ThemeToggle";
import { useAuth } from "./components/AuthProvider";


const validPaths = ['/newuser']

function App() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const ProtectedHome = ProtectedRoute(Home);
  const ProtectedNewUser = ProtectedRoute(NewUser);


  useEffect(() => {
    fetch('http://localhost:3000/login/session-status', {credentials: 'include'})
      .then((response)=>response.json())
      .then((data)=>{
        if (data.id){
          setUser(data.id);
          if (!validPaths.includes(window.location.pathname)){ //go to home if you are not on any designated valid paths
            navigate('/home');
          }
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
        <Route path="/newuser" element={<ProtectedNewUser />} />
        {/*Everything except the welcome page is contingent on the user being logged in*/}
      </Routes>
    </div>
  );
}

export default App;
