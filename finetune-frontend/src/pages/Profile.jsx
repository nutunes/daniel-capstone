import { useAuth } from "@/components/AuthProvider"

import LoggedInHeader from "@/components/LoggedInHeader";
import AddSongs from "@/components/AddSongs";
import ReviewRecommendations from "@/components/ReviewRecommendations";

const Profile = () => {
    const { user } = useAuth();


    return (
        <div className='flex flex-col flex-1 w-full relative'>
            <LoggedInHeader page='Profile'/>
            <div className='flex-1 flex flex-col justify-center items-center'>
                <div className='flex flex-col gap-5 w-fit'>
                    <AddSongs />
                    <ReviewRecommendations />
                </div>
            </div>
        </div>
    )
}


export default Profile