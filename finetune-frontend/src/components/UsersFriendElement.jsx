import { Button } from "./ui/button";



const UsersFriendElement = ({friend}) => {



    return (
        <div className='rounded-4xl border border-offwhite p-3 flex flex-row justify-between w-full items-center'>
            <p className='font-fredoka'>{friend.username}</p>
            <div className='flex flex-row justify-between gap-2'>
                <Button variant='outline' size='sm'
                    className='text-orange !border-orange hover:text-darkpurple hover:!bg-orange'
                    ><p className='font-fredoka'>Action</p></Button>
            </div>
        </div>
    )
}


export default UsersFriendElement