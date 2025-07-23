import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown } from "lucide-react";

import { useAuth } from "./AuthProvider";

import { addSongToUser } from "@/util/spotifyUtils";

const RecommendSong = () => {
    const [recSpotifyId, setRecSpotifyId] = useState(null);
    const [customizeMenu, setCustomizeMenu] = useState(false);
    const [cel, setCel] = useState(1);
    const [cla, setCla] = useState(1);
    const [flu, setFlu] = useState(1);
    const [gac, setGac] = useState(1);
    const [gel, setGel] = useState(1);
    const [org, setOrg] = useState(1);
    const [pia, setPia] = useState(1);
    const [sax, setSax] = useState(1);
    const [tru, setTru] = useState(1);
    const [vio, setVio] = useState(1);
    const [voi, setVoi] = useState(1);
    const { user } = useAuth();


    const handleAddSong = async(like) => {
        try {
            const user = await addSongToUser(like, recSpotifyId);
            if (user){
                toast(`Successfully added ${name} to your ${like ? 'liked' : 'disliked'} songs`);
            } else{
                toast(`Could not extract information from ${name}, please add another song`)
            }
            setRecSpotifyId(null)
        } catch(error){
            console.error(error);
        }
    }


    const handleGetRecommendation = async() => {
        const updateResponse = await fetch(`http://127.0.0.1:3000/spotify/reg_updated`, {
            credentials: 'include'
        })
        const needUpdate = await updateResponse.json();
        if (needUpdate){
            toast('You have recently updated your liked/disliked songs so your algorithm needs to refresh. Please wait briefly.')
        }
        const response = await fetch(`http://127.0.0.1:8000/recommend_song?user_id=${user}`);
        const song = await response.json()
        setRecSpotifyId(song.spotify_id)
    }

    return (
        <Dialog onOpenChange={()=>setRecSpotifyId(null)}>
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
                        Get a new song that FineTune knows you will like! This will only give you a song with a greater than 75% chance of you liking it.
                    </DialogDescription>
                </DialogHeader>
                <div className='flex flex-row gap-2 justify-center'>
                    {!recSpotifyId && <div className='flex flex-row gap-2'>
                        <Button variant='outline' size='lg'
                        className='text-orange !border-orange hover:text-background hover:!bg-orange
                        focus:scale-105 active:scale-105 p-3 border-2'
                        onClick={handleGetRecommendation}>Give me a song!</Button>
                        <Button variant='outline' size='lg'
                        className='text-indigo !border-indigo hover:text-background hover:!bg-indigo
                        focus:scale-105 active:scale-105 p-3 border-2'
                        onClick={()=>setCustomizeMenu((prev)=>!prev)}>Customize</Button>
                        </div>}
                    {customizeMenu && <div>

                        </div>}
                    {recSpotifyId && <div className='flex flex-col w-full'>
                        <iframe data-testid="embed-iframe" className='rounded-lg' 
                        src={`https://open.spotify.com/embed/track/${recSpotifyId}?utm_source=generator`} 
                        width="100%" height="200px" allow="autoplay; 
                        clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                        <div className='flex flex-row gap-2 w-full' >
                            <Button variant='outline' size='sm'
                                className='text-palegreen !border-palegreen hover:text-darkpurple hover:!bg-palegreen flex-1'
                                onClick={()=>handleAddSong(true)}><ThumbsUp/></Button>
                            <Button variant='outline' size='sm'
                                className='text-red !border-red hover:text-darkpurple hover:!bg-red flex-1'
                                onClick={()=>handleAddSong(false)}><ThumbsDown/></Button>
                        </div>
                    </div>}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default RecommendSong