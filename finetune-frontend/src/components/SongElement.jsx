import { Button } from "./ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";

const SongElement = ({name, artists, image}) => {
    return (
        <div className='rounded-4xl border border-offwhite p-3 flex flex-row justify-between'>
            <div className='flex flex-row gap-3'>
                <img className='rounded-sm h-20 w-20' src={image} />
                <div className='flex flex-col justify-between'>
                    <p className='font-fredoka'>{name}</p>
                    <p className='font-fredoka'>
                        {artists.map(artist=>artist.name).join(', ')}</p>
                </div>
            </div>
            <div className='flex flex-col justify-between gap-2'>
                <Button variant='outline' size='sm'
                    className='text-palegreen !border-palegreen hover:text-darkpurple hover:!bg-palegreen'
                    ><ThumbsUp/></Button>
                <Button variant='outline' size='sm'
                    className='text-red !border-red hover:text-darkpurple hover:!bg-red'
                    ><ThumbsDown/></Button>
            </div>
        </div>
    )
}

export default SongElement;