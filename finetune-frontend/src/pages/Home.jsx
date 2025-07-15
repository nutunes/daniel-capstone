import { useAuth } from "@/components/AuthProvider";

import LoggedInHeader from "@/components/LoggedInHeader";
import { Button } from "@/components/ui/button";
import TestSong from "@/components/TestSong";


const Home = () => {
    const {user} = useAuth();

    return (
        <div className='flex flex-col flex-1 w-full relative'>
            <LoggedInHeader page='Home'/>
            <div className='flex-1 flex flex-col justify-center items-center'>
                <div className='flex flex-col gap-5 w-fit'>
                    <TestSong />

                    <Button variant='outline' size='lg'
                        className='text-red !border-red hover:text-background hover:!bg-red 
                        focus:scale-105 active:scale-105 p-15 text-4xl border-5 w-full'
                        >Get New Song</Button>

                    <Button variant='outline' size='lg'
                        className='text-darkgreen !border-darkgreen hover:text-background hover:!bg-darkgreen 
                        focus:scale-105 active:scale-105 p-15 text-4xl border-5 w-full'
                        >Get New Playlist</Button>
                </div>
            </div>
        </div>
    )
}

export default Home;