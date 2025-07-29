import { useState, useEffect } from 'react'
import IncomingRequestElement from './IncomingRequestElement';


const IncomingFriendRequests = ({friendPageRefresh, setFriendPageRefresh}) => {
    const [requests, setRequests] = useState(null);


    const fetchRequests = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/friends/received_requests`, {
                credentials: 'include',
            });
            if (!response || !response.ok){
                throw new Error('failed to get friends');
            }
            const responseJSON = await response.json();
            setRequests(responseJSON);
        } catch(error){
            console.error('failed to fetch friends ' + error)
        }
    }

    useEffect(()=>{
        fetchRequests();
    }, [friendPageRefresh])


    return (
        <div className='flex flex-col items-center flex-1'>
            <p className='font-fredoka text-3xl text-center'>Incoming Friend Requests</p>
            <div className='flex flex-col m-10 items-center w-full gap-3'>
                {requests === null && <p className='font-fredoka'>Loading requests...</p>}
                {requests?.length === 0 && <p className='font-fredoka'>You have no incoming friend requests</p>}
                {requests?.map(request=>{
                    return(
                        <IncomingRequestElement request={request} updated={()=>setFriendPageRefresh(prev=>!prev)} key={request.id}/>
                    )
                })}
            </div>
        </div>
    )
}


export default IncomingFriendRequests