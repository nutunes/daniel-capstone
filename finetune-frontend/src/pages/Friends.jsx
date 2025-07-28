import { useAuth } from "@/components/AuthProvider"
import UsersFriends from "@/components/UsersFriends";
import IncomingFriendRequests from "@/components/IncomingFriendRequests";
import LoggedInHeader from "@/components/LoggedInHeader";

const Friends = () => {
    const { user } = useAuth();


    return (
        <div className='flex flex-col flex-1 w-full relative'>
            <LoggedInHeader page='Friends'/>
            <div className='flex-1 flex flex-row justify-around items-start m-20'>
                <UsersFriends />
                <p className='font-fredoka flex-1'>Recommended</p>
                <IncomingFriendRequests />
            </div>
        </div>
    )
}


export default Friends