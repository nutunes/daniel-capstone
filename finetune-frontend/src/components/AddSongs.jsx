import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SongElement from "./SongElement";

import { useAuth } from "./AuthProvider";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET


const AddSongs = () => {
    const [searchString, setSearchString] = useState('');
    const { user } = useAuth();
    const [token, setToken] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    const fetchToken = async() => {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token',{
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials'
                }),
            })
            if (!response || !response.ok){
                throw new Error('failed to get client token');
            }
            const responseJSON = await response.json();
            setToken(responseJSON.access_token);

        } catch (error){
            console.error(error);
        }
    }

    const fetchSongs = async() => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${searchString}&type=track&limit=${20}`,{
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (!response || !response.ok){
                throw new Error('failed to search for songs');
            }
            const responseJSON = await response.json();
            setSearchResults(responseJSON.tracks.items);
        } catch(error){
            console.error(error);
        }
    }

    const handleSearch = async() => {
        fetchSongs();
    }

    useEffect(()=>{
        fetchToken();
    },[])

    const clearSearch = () => {
        setSearchString('');
        setSearchResults([]);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' size='lg'
                    className='text-indigo !border-indigo hover:text-darkpurple hover:!bg-indigo focus:scale-105 active:scale-105 p-15 text-4xl border-5'
                    >Add Songs Manually</Button>
            </DialogTrigger>
            <DialogContent className='w-900px'>
                <DialogHeader>
                    <DialogTitle className='text-center text-5xl font-fredoka'>
                        Manually Add Songs
                    </DialogTitle>
                    <DialogDescription className='font-fredoka'>
                        Add songs that you either like or dislike to tailor the algorithm to your music taste!
                    </DialogDescription>
                </DialogHeader>
                <div className='flex flex-row gap-2'>
                    <Input placeholder='Search for a song' className='font-fredoka' value={searchString} onChange={(e)=>{
                        setSearchString(e.target.value);
                        setSearchResults([])
                        }} />
                    {searchString && <Button variant='outline' size='sm'
                        className='text-orange !border-orange hover:text-darkpurple hover:!bg-orange focus:scale-105 active:scale-105'
                        onClick={handleSearch}>Search</Button>}
                </div>
                {<div className='overflow-y-auto max-h-[400px] mt-4 flex flex-col gap-4' style={{scrollbarWidth: 'thin'}}>
                    {searchResults.map((track)=>{
                        return (
                            <SongElement 
                                track={track}
                                key={track.id}
                                clear={clearSearch}
                            />
                        )
                    })}
                </div>}
            </DialogContent>
        </Dialog>
    )
}

export default AddSongs;