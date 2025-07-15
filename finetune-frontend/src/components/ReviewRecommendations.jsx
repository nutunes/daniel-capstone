import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { getClientCredentialsToken } from "@/util/spotifyUtils";
import RecommendedSongElement from "./RecommendedSongElement";

const ReviewRecommendations = () => {
    const [recommendedSongs, setRecommendedSongs] = useState(null)


    const fetchToken = async() => {
        const cctoken = await getClientCredentialsToken();
        return cctoken;
    }

    // This function goes through the list of songs in the database and gets their Spotify tracks through
    // making batched requests to the Spotify API
    const convertToSpotifyTracks = async(songs, token) => {
        try {
            const maxIds = 50;
            let tracks = [];
            for (let i = 0; i < songs.length; i += maxIds){
                const batch = songs.slice(i, i+maxIds);
                const idList = batch.map(song=>song.spotify_id).join(',');
                const response = await fetch(`https://api.spotify.com/v1/tracks?ids=${idList}`, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                if (!response || !response.ok){
                    throw new Error('failed to get batch of songs')
                }
                const responseJSON = await response.json();
                tracks = tracks.concat(responseJSON.tracks);
            }
            setRecommendedSongs(tracks)
        } catch(error) {
            console.error(error)
        }
    }

    const fetchRecommendedSongs = async() => {
        try{
            const token = await fetchToken();
            const response = await fetch('http://127.0.0.1:3000/spotify/songs_for_feedback', {
                credentials: 'include',
            })
            if (!response || !response.ok){
                throw new Error('failed to get recommended songs')
            }
            const recommended = await response.json()
            convertToSpotifyTracks(recommended, token);
        } catch(error){
            console.error(error)
        }
    }

    useEffect(()=>{
        fetchRecommendedSongs();
    }, [])


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' size='lg'
                    className='text-red !border-red hover:text-background hover:!bg-red 
                    focus:scale-105 active:scale-105 p-15 text-4xl border-5'
                    >Review Recommended Songs</Button>
            </DialogTrigger>
            <DialogContent className='w-900px'>
                <DialogHeader>
                    <DialogTitle className='text-5xl font-fredoka'>
                        Give Feedback
                    </DialogTitle>
                    <DialogDescription className='font-fredoka'>
                        Let us know if you like or dislike the songs recommended to you so that your algorithm becomes more accurate!
                    </DialogDescription>
                </DialogHeader>
                {!recommendedSongs && <p className='font-fredoka text-xl text-center'>Loading...</p>}
                {recommendedSongs && <div className='overflow-y-auto max-h-[400px] mt-4 flex flex-col gap-4' style={{scrollbarWidth: 'thin'}}>
                    {recommendedSongs.map((track)=>{
                        return(
                            <RecommendedSongElement 
                                track={track}
                                key={track.id}
                                updated={fetchRecommendedSongs}
                            />
                        )
                    })}
                </div>}
            </DialogContent>
        </Dialog>
    )
}

export default ReviewRecommendations