import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "./AuthProvider"

const RegisterModal = ({showModal, setShowModal}) => {
    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState(undefined);
    const [password, setPassword] = useState('');
    const [validPassword, setValidPassword] = useState(undefined);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async(e) => {
        e.preventDefault();
        const availableUsername = await checkUsernameAvailability();
        if (!availableUsername) return;
        const passwordValid = checkValidPassword();
        if (!passwordValid) return;
        console.log('register')
        try {
            const response = await fetch(`http://127.0.0.1:3000/login/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                }),
                credentials: 'include',
            })
            if (!response.ok){
                throw new Error('failed to register');
            }
            const responseJSON = await response.json();
            setUser(responseJSON.id);
            navigate('/newuser');
        } catch(error){
            console.error(error);
        }
    }

    const checkUsernameAvailability = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/login/usernameAvailable?username=${username}`);
            if (!response.ok){
                throw new Error('failed to check username');
            }
            const responseJSON = await response.json();
            setUsernameAvailable(responseJSON.available);
            return responseJSON.available;
        } catch (error){
            console.error(error);
        }
    }

    //can add more password requirements
    const checkValidPassword = () => {
        //Set state is to trigger a rerender in the ui, return value is for the submit function
        if (!password){
            setValidPassword(undefined);
            return false;
        }
        if (password.length >= 8){
            setValidPassword(true)
            return true;
        }
        setValidPassword(false)
        return false;
    }
    
    return (
        <div>
            <Dialog open={showModal} onOpenChange={()=>{
                setShowModal((prev)=>!prev)
                setUsername('');
                setPassword('');
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <p  className='text-5xl font-fredoka'>Register User</p>
                        </DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div>
                        <form className='flex flex-col gap-5' onSubmit={handleRegister}>
                            <div className='flex flex-row gap-2'>
                                <Input placeholder='Username' value={username} onChange={(e)=>{
                                    setUsername(e.target.value);
                                    setUsernameAvailable(undefined);
                                }} required/>
                                {username && <Button type='button' variant='outline' size='sm' 
                                className='text-orange !border-orange hover:text-darkpurple hover:!bg-orange focus:scale-105 active:scale-105'
                                onClick={checkUsernameAvailability}
                                >Check Availability</Button>}
                            </div>
                            {usernameAvailable === true && <Button type='button' variant='outline' size='sm'
                                className='text-palegreen !border-palegreen pointer-events-none p-2'>Username Available</Button>}
                            {usernameAvailable === false && <Button type='button' variant='outline' size='sm'
                                className='text-red !border-red pointer-events-none p-2'>Username Unavailable</Button>}
                            <Input placeholder="Password" type='password' value={password} onChange={(e)=>{
                                setPassword(e.target.value)
                                setValidPassword(undefined);
                            }} required/>
                            {validPassword === true && <Button type='button' variant='outline' size='sm'
                                className='text-palegreen !border-palegreen pointer-events-none p-2'>Valid Password</Button>}
                            {validPassword === false && <Button type='button' variant='outline' size='sm'
                                className='text-red !border-red pointer-events-none p-2'>Invalid password, must be 8 characters</Button>}
                            <Button type='submit' variant='outline' size='lg' className='text-indigo !border-indigo flex-1 hover:text-darkpurple hover:!bg-indigo focus:scale-105 active:scale-105 p-2'>
                                Create Account
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default RegisterModal;