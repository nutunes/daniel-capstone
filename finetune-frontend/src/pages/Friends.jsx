import { useAuth } from "@/components/AuthProvider"

import LoggedInHeader from "@/components/LoggedInHeader";

const Friends = () => {
    const { user } = useAuth();


    return (
        <div className='flex flex-col flex-1 w-full relative'>
            <LoggedInHeader page='Friends'/>
            <div className='flex-1 flex flex-col justify-center items-center'>
                <p className='font-fredoka'>Friends Page Placeholder</p>
                <p className='font-fredoka'>{user}</p>
            </div>
        </div>
    )
}


export default Friends