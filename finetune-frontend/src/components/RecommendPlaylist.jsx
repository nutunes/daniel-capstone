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
    const [token, setToken] = useState(null)
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

    const patchRefreshToken = async(refreshToken) => {
        try {
            const response = await fetch(`http://127.0.0.1:3000/spotify/refresh_token`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh_token: refreshToken
                }),
                credentials: 'include',
            })
            if (!response || !response.ok){
                throw new Error('failed to update refresh token')
            }
        } catch(error){
            console.error(error);
        }
    }

    const getRefreshToken = async() => {
        try{
            const refreshToken = userAccount.spotifyRefreshToken;
            const url = "https://accounts.spotify.com/api/token";

            const payload = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: clientId,
                }),
            }
            const response = await fetch(url, payload);
            if (!response || !response.ok){
                throw new Error('failed to refresh token');
            }
            const responseJSON = await response.json();
            setToken(responseJSON.access_token)
            if (responseJSON.refresh_token){
                await patchRefreshToken(responseJSON.refresh_token);
            }
            return responseJSON.access_token
        } catch(error){
            console.error('failed to get refresh token ' + error);
        }
    }

    const handleCreatePlaylist = async() => {
        try{
            let validToken = token;
            if (!validToken){
                validToken = await getRefreshToken();
            }
            const userSpotifyProfileResponse = await fetch(`https://api.spotify.com/v1/me`, {
                headers: {
                    'Authorization': 'Bearer ' + validToken
                }
            })
            const spotifyProfile = await userSpotifyProfileResponse.json();
            console.log(spotifyProfile.id);
            const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${spotifyProfile.id}/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + validToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "name": "FineTune Recommended Playlist",
                    "description": "30 songs FineTune knows you will love"  
                })
            });
            const createdPlaylist = await createPlaylistResponse.json();
            const trackUris = recommendedSongs.map(song => `spotify:track:${song.spotify_id}`)
            const updatedPlaylistResponse = await fetch(`https://api.spotify.com/v1/playlists/${createdPlaylist.id}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + validToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "uris": trackUris,
                })
            })

        } catch(error){
            console.error('failed to create playlist');
        }
    }

    useEffect(()=>{
        if (userAccount !== null && recommendedSongs !== null){
            handleCreatePlaylist();
        }
    }, [recommendedSongs])


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