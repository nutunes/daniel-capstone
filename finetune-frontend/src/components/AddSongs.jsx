import { Button } from "./ui/button";

const AddSongs = () => {
    return (
        <Button variant='outline' size='lg'
            className='text-indigo !border-indigo flex-1 hover:text-darkpurple hover:!bg-indigo focus:scale-105 active:scale-105 p-3'
            >Add Songs Manually</Button>
    )
}

export default AddSongs;