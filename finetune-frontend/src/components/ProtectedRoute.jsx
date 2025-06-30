//This file will ensure that the user is logged in before rendering any further pages
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = (WrappedComponent) => {
    return (props)=>{
        const { user, setUser } = useAuth();
        const navigate = useNavigate();

        useEffect(()=>{
            if (!user){
                fetch("http://127.0.0.1:3000/login/session-status", { credentials: "include"})
                    .then((response)=>response.json())
                    .then((data)=>{
                        if (data.id){
                            setUser(data);
                        } else{
                            navigate('/')
                        }
                    })
                    .catch(()=>{
                        navigate('/')
                    })
            }
        }, [user, setUser, navigate])

        if (!user){
            return <p>Loading...</p>
        }

        return <WrappedComponent {...props} />
    }
}

export default ProtectedRoute;