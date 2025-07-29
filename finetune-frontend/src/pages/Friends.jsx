import { useState } from 'react'
import { useAuth } from "@/components/AuthProvider"
import UsersFriends from "@/components/UsersFriends";
import IncomingFriendRequests from "@/components/IncomingFriendRequests";
import RecommendedFriends from "@/components/RecommendedFriends";
import LoggedInHeader from "@/components/LoggedInHeader";

const Friends = () => {
    const { user } = useAuth();
    const [friendPageRefresh, setFriendPageRefresh] = useState(false);


    return (
        <div className='flex flex-col flex-1 w-full relative'>
            <LoggedInHeader page='Friends'/>
            <div className='flex-1 flex flex-row justify-around items-start m-20 gap-20'>
                <UsersFriends friendPageRefresh={friendPageRefresh} setFriendPageRefresh={setFriendPageRefresh}/>
                <RecommendedFriends friendPageRefresh={friendPageRefresh} setFriendPageRefresh={setFriendPageRefresh}/>
                <IncomingFriendRequests friendPageRefresh={friendPageRefresh} setFriendPageRefresh={setFriendPageRefresh}/>
            </div>
        </div>
    )
}


export default Friends