import { Button } from "./ui/button";
import { toast } from "sonner";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { addSongToUser} from "@/util/spotifyUtils";

const RecommendedSongElement = ({track, updated}) => {
    const name = track.name;
    const artists = track.artists;
    const image = track.album.images[0].url;

    const handleAddSong = async(like) => {
        try {
            const user = await addSongToUser(like, track.id);
            if (user){
                toast(`Successfully added ${name} to your ${like ? 'liked' : 'disliked'} songs`);
            } else{
                toast(`Could not extract information from ${name}, please add another song`)
            }
            updated();
        } catch(error){
            console.error(error);
        }
    }

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
                    onClick={()=>handleAddSong(true)}><ThumbsUp/></Button>
                <Button variant='outline' size='sm'
                    className='text-red !border-red hover:text-darkpurple hover:!bg-red'
                    onClick={()=>handleAddSong(false)}><ThumbsDown/></Button>
            </div>
        </div>
    )
}

export default RecommendedSongElement;