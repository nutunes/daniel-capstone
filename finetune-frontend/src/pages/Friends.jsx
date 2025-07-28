import { useAuth } from "@/components/AuthProvider"

import LoggedInHeader from "@/components/LoggedInHeader";

const Friends = () => {
    const { user } = useAuth();


    return (
        <div className='flex flex-col flex-1 w-full relative'>
            <LoggedInHeader page='Friends'/>
            <div className='flex-1 flex flex-row justify-around items-start m-20'>
                <p className='font-fredoka'>Friends</p>
                <p className='font-fredoka'>Recommended</p>
                <p className='font-fredoka'>Requests</p>
            </div>
        </div>
    )
}


export default Friends