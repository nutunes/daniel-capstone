import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";

import { useAuth } from "./AuthProvider";
import { getClientCredentialsToken } from "@/util/spotifyUtils";

const RecommendSong = () => {
    const [recommendation, setRecommendation] = useState(null);
    const { user } = useAuth();
    const [token, setToken] = useState(null)

    const fetchToken = async() => {
        const cctoken = await getClientCredentialsToken();
        setToken(cctoken)
    }

    const getSpotifySong = async(spotify_id) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/tracks/${spotify_id}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (!response || !response.ok){
                throw new Error('failed to get song')
            }
            const responseJSON = await response.json()
            setRecommendation(responseJSON)
        } catch(error){
            console.error(error)
        }
    }

    const handleGetRecommendation = async() => {
        const response = await fetch(`http://127.0.0.1:8000/recommend_song?user_id=${user}`);
        const song = await response.json()
        getSpotifySong(song.spotify_id)
    }

    useEffect(()=>{
        fetchToken()
    }, [recommendation])

    return (
        <Dialog onOpenChange={()=>setRecommendation(null)}>
            <DialogTrigger asChild>
                <Button variant='outline' size='lg'
                    className='text-red !border-red hover:text-background hover:!bg-red focus:scale-105 
                    active:scale-105 p-15 text-4xl border-5 w-full'
                    >Get New Song</Button>
            </DialogTrigger>
            <DialogContent className='w-900px'>
                <DialogHeader>
                    <DialogTitle className='text-center text-5xl font-fredoka'>
                        Get New Song!
                    </DialogTitle>
                    <DialogDescription className='font-fredoka text-center'>
                        Get a new song that FineTune knows you will like! This will only give you a song with a greater than 80% chance of you liking it.
                    </DialogDescription>
                </DialogHeader>
                <div className='flex flex-row gap-2 justify-center'>
                    {!recommendation && <Button variant='outline' size='lg'
                        className='text-orange !border-orange hover:text-background hover:!bg-orange
                        focus:scale-105 active:scale-105 p-3 border-2'
                        onClick={handleGetRecommendation}>Give me a song!</Button>}
                    {recommendation && <div className='rounded-4xl border border-foreground p-3 flex flex-row justify-between'>
                        <div className='flex flex-row gap-3'>
                            <img className='rounded-sm h-20 w-20' src={recommendation.album.images[0].url} />
                            <div className='flex flex-col justify-between'>
                                <p className='font-fredoka'>{recommendation.name}</p>
                                <p className='font-fredoka'>
                                    {recommendation.artists.map(artist=>artist.name).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default RecommendSong