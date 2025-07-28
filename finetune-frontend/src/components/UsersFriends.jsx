import { useState, useEffect } from 'react'


const UsersFriends = () => {
    const [friends, setFriends] = useState(null);


    const fetchFriends = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/friends/all_friends`, {
                credentials: 'include',
            });
            if (!response || !response.ok){
                throw new Error('failed to get friends');
            }
            const responseJSON = await response.json();
            setFriends(responseJSON);
        } catch(error){
            console.error('failed to fetch friends ' + error)
        }
    }

    useEffect(()=>{
        fetchFriends();
    }, [])

    return (
        <div className='flex flex-col items-center flex-1'>
            <p className='font-fredoka text-3xl'>Your Friends</p>
            <div className='flex flex-col m-10 items-center'>
                {friends === null && <p className='font-fredoka'>Loading friends...</p>}
                {friends?.length === 0 && <p className='font-fredoka'>You have added no friends</p>}
            </div>
        </div>
    )
}


export default UsersFriends