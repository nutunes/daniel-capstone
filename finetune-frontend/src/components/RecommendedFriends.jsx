import { useState, useEffect } from 'react'
import RecommendedUserElement from './RecommendedUserElement';


const RecommendedFriends = () => {
    const [recommendedUsers, setRecommendedUsers] = useState(null);

    const fetchRecommendedUsers = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/friends/recommended_friends`, {
                credentials: 'include',
            });
            if (!response || !response.ok){
                throw new Error('failed to get friends');
            }
            const responseJSON = await response.json();
            setRecommendedUsers(responseJSON);
        } catch(error){
            console.error('failed to fetch friends ' + error)
        }
    }

    useEffect(()=>{
        fetchRecommendedUsers();
    }, [])



    return (
        <div className='flex flex-col items-center flex-1'>
            <p className='font-fredoka text-3xl'>Recommended Users</p>
            <div className='flex flex-col m-10 items-center w-full gap-3'>
                {recommendedUsers === null && <p className='font-fredoka'>Loading friends...</p>}
                {recommendedUsers?.length === 0 && <p className='font-fredoka'>You have added no friends</p>}
                {recommendedUsers?.map(user=>{
                    return(
                        <RecommendedUserElement user={user} updated={fetchRecommendedUsers} key={user.id} />
                    )
                })}
            </div>
        </div>
    )
}


export default RecommendedFriends