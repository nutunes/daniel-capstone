import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/components/AuthProvider"
import { uploadUsersTop300Tracks } from "@/util/spotifyUtils"

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const redirectUri = 'http://127.0.0.1:5173/loaduserspotify'


const LoadUserSpotify = () => {
    const { user } = useAuth();
    const [doneLoading, setDoneLoading] = useState(false);
    const navigate = useNavigate();
    
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
            console.log(response);
            if (!response || !response.ok){
                throw new Error('failed to update refresh token')
            }
        } catch(error){
            console.error(error);
        }
    }

    const requestAccessToken = async(code) => {
        const codeVerifier = localStorage.getItem('code_verifier');
        const url = "https://accounts.spotify.com/api/token";
        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                code_verifier: codeVerifier,
            }),
        }
        try {
            const body = await fetch(url, payload);
            //The reason this is commented out is documented below
            if (!body || !body.ok){
                throw new Error('failed to get spotify access token');
            }
            const response = await body.json();
            patchRefreshToken(response.refresh_token);
            //TODO: USE response.access_token TO LOAD SPOTIFY 
            uploadUsersTop300Tracks(response.access_token, setDoneLoading);
        } catch(error){
            console.error(error);
        }
    }

    //Note: Because this is running in strict mode, this useEffect gets ran twice which triggers the requestAccessToken twice. 
    //But, the requestAccessToken will fail on the second because the code has already been used. This is only a bug in development
    //and will not be present on the final product, so it can be ignored.
    useEffect(()=>{
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get('code');
        if (urlParams.get('error')){
            console.log(`fail: ${urlParams.get('error')}`);
        }
        requestAccessToken(code);
    }, [])

    useEffect(()=>{
        if (doneLoading === true){
            navigate('/home');
        }
    }, [doneLoading])


    return (
        <div className='w-fit self-center'>
            <h1 className='font-fredoka' >Loading Your Spotify details...</h1>
        </div>
    )
}

export default LoadUserSpotify;