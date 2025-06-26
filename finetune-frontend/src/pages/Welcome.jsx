import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input'

const WelcomePage = () => {

    const handleLogin = (e) => {
        e.preventDefault();
    }

    const handleRegister = (e) => {
        console.log('register');
    }

    return (
        <div className='flex flex-col'>
            <div className='m-10'>
                <h1 className='text-8xl font-semibold '> FineTune</h1>
                {/*Icon placeholder*/}
            </div>
            <div>
                <form className='flex flex-col gap-5' onSubmit={handleLogin}>
                    <Input placeholder="username" required/>
                    <Input placeholder="password" type='password' required/>
                    <div className='flex gap-5'>
                        <Button type='button' variant='outline' size='lg' onClick={handleRegister} className='text-orange flex-1 hover:text-darkpurple hover:bg-orange focus:scale-105 active:scale-105'>
                            Register</Button>
                        <Button type='submit' variant='outline' size='lg' className='text-indigo flex-1 hover:text-darkpurple hover:bg-indigo focus:scale-105 active:scale-105'>
                            Login</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default WelcomePage