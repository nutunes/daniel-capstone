import { useState, useEffect } from 'react'

import { useAuth } from "@/components/AuthProvider";

import LoggedInHeader from "@/components/LoggedInHeader";
import { Button } from "@/components/ui/button";
import TestSong from "@/components/TestSong";
import RecommendSong from "@/components/RecommendSong";
import RecommendPlaylist from '@/components/RecommendPlaylist';


const Home = () => {
    const [userAccount, setUserAccount] = useState(null);
    const {user} = useAuth();


    const fetchUserAccount = async() => {
        try{
            const response = await fetch(`http://127.0.0.1:3000/login/account`, {
                credentials: 'include',
            });
            if (!response || !response.ok){
                throw new Error('failed to fetch')
            }
            const profile = await response.json()
            setUserAccount(profile)
        } catch(error){
            console.error('failed to get account ' + error)
        }
    }

    useEffect(()=>{
        fetchUserAccount();
    }, [])


    return (
        <div className='flex flex-col flex-1 w-full relative'>
            <LoggedInHeader page='Home'/>
            <div className='flex-1 flex flex-col justify-center items-center'>
                <div className='flex flex-col gap-5 w-fit'>
                    <TestSong />

                    <RecommendSong />
                    {userAccount?.spotifyRefreshToken !== null && 
                        <RecommendPlaylist userAccount={userAccount}/>}
                </div>
            </div>
        </div>
    )
}

export default Home;