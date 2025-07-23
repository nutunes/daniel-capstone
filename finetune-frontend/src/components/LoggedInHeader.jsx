import { useNavigate } from "react-router-dom"

import { UserRound } from "lucide-react"
import { UsersRound } from "lucide-react"
import { House } from "lucide-react"

import { Button } from "./ui/button"
import NotificationsMenu from "./NotificationsMenu"

const LoggedInHeader = ({page}) => {
    const navigate = useNavigate();


    return (
        <div className='self-center'>
            <h3 className='text-6xl font-fredoka'>FineTune - {page}</h3>
            <div className='absolute top-0 right-10 flex flex-row gap-2'>
            <NotificationsMenu />
            <Button variant='outline' size='icon'
                className='h-[50px] w-[50px] flex items-center justify-center
                    text-foreground !border-foreground hover:text-background hover:!bg-foreground
                    focus: scale-105 active:scale-105 p-2 border-2'
                onClick={()=>page==='Profile'? navigate('/home') : navigate('/profile')}>
                {page==='Profile'
                    ? <House className='!w-full !h-full' />
                    : <UserRound className='!w-full !h-full' /> }

            </Button>
            </div>

            <Button variant='outline' size='icon'
                className='absolute top-0 left-10 h-[50px] w-[50px] flex items-center justify-center
                    text-foreground !border-foreground hover:text-background hover:!bg-foreground
                    focus: scale-105 active:scale-105 p-2 border-2'
                onClick={()=>page==='Friends'? navigate('/home') : navigate('/friends')}>
                {page==='Friends'
                    ? <House className='!w-full !h-full' />
                    : <UsersRound className='!w-full !h-full' /> }
            </Button>
        </div>
    )
}


export default LoggedInHeader