import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { useAuth } from './AuthProvider';
import RegisterModal from './RegisterModal';

const LoginMenu = () => {
    const [showRegModal, setShowRegModal] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [badCreds, setBadCreds] = useState(false)
    const navigate = useNavigate();
    const {setUser} = useAuth();

        const handleLogin = async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(`http://127.0.0.1:3000/login`, {
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
                if (response.status === 400){
                    //Fail login
                    setBadCreds(true);
                } else if (!response.ok){
                    throw new Error('login fail');
                }
                else{
                    const responseJSON = await response.json();
                    setUser(responseJSON.id);
                    navigate('/home');
                }
            } catch (error){
                console.error(error);
            }
        }

    return (
        <div className='z-1 bg-background rounded-4xl p-5'>
            <div className='m-10'>
                <h1 className='text-8xl font-fredoka'> FineTune</h1>
                {/*Icon placeholder*/}
            </div>
            <div>
                <form className='flex flex-col gap-5' onSubmit={handleLogin}>
                    <Input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required/>
                    <Input placeholder="Password" type='password' value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                    {badCreds && <Button type='button' variant='outline' size='sm' className='text-red !border-red pointer-events-none'>Invalid Username or Password</Button>}
                    <div className='flex gap-5'>
                        <Button type='button' variant='outline' size='lg' 
                        className='text-orange !border-orange flex-1 hover:text-darkpurple hover:!bg-orange focus:scale-105 active:scale-105' onClick={setShowRegModal}>
                            Register</Button>
                        <Button type='submit' variant='outline' size='lg' 
                        className='text-indigo !border-indigo flex-1 hover:text-darkpurple hover:!bg-indigo focus:scale-105 active:scale-105'>
                            Login</Button>
                    </div>
                </form>
            </div>
            <RegisterModal showModal={showRegModal} setShowModal={setShowRegModal} />
        </div>
    )
}


export default LoginMenu;