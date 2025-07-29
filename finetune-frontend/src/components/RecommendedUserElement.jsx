import { Button } from "./ui/button";
import { toast } from "sonner";


const RecommendedUserElement = ({user, updated}) => {

    const handleSendRequest = async() => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/friends/send_request`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    friendId: user.id,
                }),
                credentials: 'include',
            })
            if (!response || !response.ok){
                throw new Error('failed to send friend request')
            }
            toast(`Sent friend request to ${user.username}`)
            updated();
        } catch(error){
            console.error('failed to send friend request ' + error)
        }
    }

    return (
        <div className='rounded-4xl border border-offwhite p-3 flex flex-row justify-between w-full items-center'>
            <p className='font-fredoka'>{user.username}</p>
            <div className='flex flex-row justify-between gap-2'>
                <Button variant='outline' size='sm'
                    className='text-indigo !border-indigo hover:text-darkpurple hover:!bg-indigo'
                    onClick={()=>handleSendRequest()}><p className='font-fredoka'>Send Request</p></Button>
            </div>
        </div>
    )
}


export default RecommendedUserElement