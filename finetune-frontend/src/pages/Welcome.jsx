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
            <div className='header'>
                <h1 className='text-4xl'> FineTune</h1>
                {/*Icon placeholder*/}
            </div>
            <div>
                <form className='login-form' onSubmit={handleLogin}>
                    <Input placeholder="username" required/>
                    <Input placeholder="password" required/>
                    <div className='login-btns'>
                        <Button type='button' variant='outline' size='lg' onClick={handleRegister} className="text-orange">Register</Button>
                        <Button type='submit' variant='outline' size='lg' className='text-indigo'>Login</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default WelcomePage