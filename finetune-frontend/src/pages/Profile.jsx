import { useAuth } from "@/components/AuthProvider"

import LoggedInHeader from "@/components/LoggedInHeader";

const Profile = () => {
    const { user } = useAuth();


    return (
        <div className='flex flex-col flex-1 w-full relative'>
            <LoggedInHeader />
            <div className='flex-1 flex flex-col justify-center items-center'>
                <p className='font-fredoka'>Profile Page Placeholder</p>
                <p className='font-fredoka'>{user}</p>
            </div>
        </div>
    )
}


export default Profile