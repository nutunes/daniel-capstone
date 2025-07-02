import { useNavigate } from "react-router-dom"

import { UserRound } from "lucide-react"
import { House } from "lucide-react"

import { Button } from "./ui/button"

const LoggedInHeader = ({page}) => {
    const navigate = useNavigate();


    return (
        <div className='self-center'>
            <h3 className='text-6xl font-fredoka'>FineTune</h3>
            <Button variant='outline' size='icon'
                className='absolute top-0 right-10 h-[50px] w-[50px] flex items-center justify-center
                    text-foreground !border-foreground hover:text-background hover:!bg-foreground
                    focus: scale-105 active:scale-105 p-2 border-2'
                onClick={()=>page==='home'? navigate('/profile') : navigate('/home')}>
                {page==='home'
                    ? <UserRound className='!w-full !h-full' />
                    : <House className='!w-full !h-full' /> }
            </Button>
        </div>
    )
}


export default LoggedInHeader