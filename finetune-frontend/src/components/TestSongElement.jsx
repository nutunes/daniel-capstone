import { Button } from "./ui/button";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";

import { checkIfInDatabase, uploadToDatabase, addSongToUser} from "@/util/spotifyUtils";

const TestSongElement = ({track, clear}) => {
    const name = track.name;
    const artists = track.artists;
    const image = track.album.images[0].url;
    const { user } = useAuth()

    const handleTestSong = async(like) => {
        try {
            let exists = await checkIfInDatabase(track.id);
            if (!exists){
                await uploadToDatabase(track);
                exists = await checkIfInDatabase(track.id)
            }
            if (exists){
                const updateResponse = await fetch(`http://127.0.0.1:3000/spotify/reg_updated`,{
                    credentials: 'include',
                })
                const needUpdate = await updateResponse.json();
                if (needUpdate){
                    toast('You have recently updated your liked/disliked songs so your algorithm needs to refresh. Please wait briefly.')
                }
                const response = await fetch(`http://127.0.0.1:8000/will_i_like?user_id=${user}&song_id=${exists}`)
                const odds = await response.json()
                const rounded_odds = (odds*100).toFixed(2)
                if (rounded_odds < 50){
                    toast(`There is a ${rounded_odds}% chance you will like ${name}. Don't be mad at me if its not your style!`)
                } else if(rounded_odds < 80){
                    toast(`There is a ${rounded_odds}% chance you will like ${name}. I'd give it a go!`)
                } else{
                    toast(`There is a ${rounded_odds}% chance you will like ${name}. Play it right now!`)
                }
            } else {
                toast(`Could not extract information for ${name}, please test another song`)
            }
            clear()
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
            <div className='flex flex-col justify-between gap-2 self-center'>
                <Button variant='outline' size='sm'
                    className='text-indigo !border-indigo hover:text-darkpurple hover:!bg-indigo'
                    onClick={()=>handleTestSong(true)}>Test</Button>
            </div>
        </div>
    )
}

export default TestSongElement;