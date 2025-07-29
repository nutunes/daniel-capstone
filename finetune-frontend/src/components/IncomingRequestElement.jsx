import { Button } from "./ui/button";
import { toast } from "sonner";


const IncomingRequestElement = ({request, updated}) => {
    const sender = request.sender;

    const handleRequestResponse = async(accept) => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/friends/request_response`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    requestId: request.id,
                    accept,
                }),
                credentials: 'include',
            })
            if (!response || !response.ok){
                throw new Error('failed to respond to request');
            }
            toast(`${accept ? 'Accepted' : 'Rejected'} friend request from ${sender.username}`)
            updated();
        } catch(error){
            console.error('failed to respond to friend request ' + error)
        }
    }

    return (
        <div className='rounded-4xl border border-offwhite p-3 flex flex-row justify-between w-full items-center'>
            <p className='font-fredoka'>{sender.username}</p>
            <div className='flex flex-row justify-between gap-2'>
                <Button variant='outline' size='sm'
                    className='text-palegreen !border-palegreen hover:text-darkpurple hover:!bg-palegreen'
                    onClick={()=>handleRequestResponse(true)}><p className='font-fredoka'>Accept</p></Button>
                <Button variant='outline' size='sm'
                    className='text-red !border-red hover:text-darkpurple hover:!bg-red'
                    onClick={()=>handleRequestResponse(false)}><p className='font-fredoka'>Reject</p></Button>
            </div>
        </div>
    )
}


export default IncomingRequestElement