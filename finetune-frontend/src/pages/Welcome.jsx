import { useState, useRef} from "react";
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

import InteractiveBackground from "@/components/InteractiveBackground";


const WelcomePage = () => {
    const [showRegDialog, setShowRegDialog] = useState(false);
    const [coords, setCoords] = useState({x:-1000,y:-1000})
    const menuRef = useRef(null);

    const handleLogin = (e) => {
        e.preventDefault();
    }

    const handleMouseMove = (e) => {
        setCoords({x: e.clientX, y: e.clientY})
    }

    return (
        <div className='flex flex-col' onMouseMove={handleMouseMove}>
            <InteractiveBackground coords={coords}/>
            <div className='z-1 bg-background rounded-md p-5'>
                <div className='m-10'>
                    <h1 className='text-8xl font-semibold '> FineTune</h1>
                    {/*Icon placeholder*/}
                </div>
                <div ref={menuRef}>
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
        </div>
    )
}

export default WelcomePage