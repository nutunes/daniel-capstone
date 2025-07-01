import { Button } from "./ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";

const SongElement = ({track, addSong}) => {
    const name = track.name;
    const artists = track.artists;
    const image = track.album.images[0].url;

    const handleAddSong = async(like) => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/spotify/add_song`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    like,
                    spotify_id: track.id,
                    title: name,
                    album: track.album.name,
                    spotify_album_id: track.album.id,
                }),
                credentials: 'include',
            });
            console.log(response);
            // if (!response || !response.ok){
            //     throw new Error('failed to add song');
            // }
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

export default SongElement;