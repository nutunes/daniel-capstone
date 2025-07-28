import { Button } from "./ui/button";
import { toast } from "sonner";


const IncomingRequestElement = ({sender}) => {

    const handleRequestResponse = async(accept) => {
        try {

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