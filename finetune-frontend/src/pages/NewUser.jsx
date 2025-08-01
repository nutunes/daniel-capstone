import SpotifyAuth from "@/components/SpotifyAuth";
import AddSongs from "@/components/AddSongs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useNavigate } from "react-router-dom";


const NewUser = () => {
    const navigate = useNavigate()


    const handleHomeClick = async() => {
        try {
            const response = await fetch('http://127.0.0.1:3000/spotify/liked_songs', {
                credentials: 'include',
            })
            if (!response || !response.ok) {
                throw new Error('failed to get liked songs')
            }
            const liked = await response.json()
            if (liked.length > 0) {
                navigate('/')
            } else{
                toast('You must like a song or link your Spotify before you can continue')
            }
        } catch(error){
            console.error('failed to get liked songs' + error)
        }
    }

    return (
        <div className='z-1 bg-background rounded-4xl p-5 flex flex-col gap-5 w-fit self-center'>
            <SpotifyAuth />
            <AddSongs />
            <Button variant='outline' size='lg'
            className='text-orange !border-orange hover:text-background hover:!bg-orange
            focus:scale-105 active:scale-105 p-15 text-4xl border-5'
            onClick={handleHomeClick}>Home</Button>
        </div>
    )
}


export default NewUser;