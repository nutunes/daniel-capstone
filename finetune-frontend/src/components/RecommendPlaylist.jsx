import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"



import { useAuth } from "./AuthProvider";
import { getClientCredentialsToken } from "@/util/spotifyUtils";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET


const RecommendPlaylist = ({userAccount}) => {
    const [recommendedSongs, setRecommendedSongs] = useState(null);
    const { user } = useAuth();

    const handleGetPlaylist = async() => {
        try {
            const updateResponse = await fetch(`http://127.0.0.1:3000/spotify/reg_updated`, {
                credentials: 'include'
            })
            const needUpdate = await updateResponse.json();
            if (needUpdate){
                toast('You have recently updated your liked/disliked songs so your algorithm needs to refresh. Please wait briefly.')
            }
            const response = await fetch(`http://127.0.0.1:8000/recommend_playlist?user_id=${user}`);
            const playlist = await response.json()
            if (playlist === null){
                toast('There are no songs in the database that fit your music taste and instrument desires :(')
            }
            setRecommendedSongs(playlist)
        } catch(error){
            console.error('failed to get playlist ' + error)
        }
    }

    return (
        <Dialog onOpenChange={()=>{
            setRecommendedSongs(null);
        }}>
            <DialogTrigger asChild>
                <Button variant='outline' size='lg'
                    className='text-darkgreen !border-darkgreen hover:text-background hover:!bg-darkgreen 
                        focus:scale-105 active:scale-105 p-15 text-4xl border-5 w-full'
                    >Get New Playlist</Button>
            </DialogTrigger>
            <DialogContent className='w-900px'>
                <DialogHeader>
                    <DialogTitle className='text-center text-5xl font-fredoka'>
                        Get a New Playlist!
                    </DialogTitle>
                    <DialogDescription className='font-fredoka text-center'>
                        Let FineTune create you a Spotify playlist of songs that you will like
                    </DialogDescription>
                </DialogHeader>
                <div className='flex flex-row gap-2 justify-center items-center flex-1'>
                    {!recommendedSongs && <Button variant='outline' size='lg'
                    className='text-orange !border-orange hover:text-background hover:!bg-orange
                    focus:scale-105 active:scale-105 p-3 border-2 flex-1'
                    onClick={handleGetPlaylist}>Give me a Playlist!</Button>}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default RecommendPlaylist;