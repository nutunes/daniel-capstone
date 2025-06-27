import { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import RegisterModal from './RegisterModal';

const LoginMenu = () => {
    const [showRegModal, setShowRegModal] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
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