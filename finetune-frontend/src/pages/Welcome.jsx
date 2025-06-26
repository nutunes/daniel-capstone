import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'


const WelcomePage = () => {
    const [showRegDialog, setShowRegDialog] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
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
                        <Button type='button' variant='outline' size='lg' 
                        className='text-orange !border-orange flex-1 hover:text-darkpurple hover:!bg-orange focus:scale-105 active:scale-105' onClick={setShowRegDialog}>
                            Register</Button>
                        <Button type='submit' variant='outline' size='lg' 
                        className='text-indigo !border-indigo flex-1 hover:text-darkpurple hover:!bg-indigo focus:scale-105 active:scale-105'>
                            Login</Button>
                    </div>
                </form>
            </div>
            <Dialog open={showRegDialog} onOpenChange={setShowRegDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Register User</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default WelcomePage