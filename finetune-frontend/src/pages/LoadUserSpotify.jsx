import { useEffect } from "react";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const redirectUri = 'http://127.0.0.1:5173/loaduserspotify'


const LoadUserSpotify = () => {

    const requestAccessToken = async(code) => {
        const codeVerifier = localStorage.getItem('code_verifier');
        const url = "https://accounts/spotify.com/api/token";
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
            const response = await body.json();
            if (!response || !response.ok){
                throw new Error('failed to get spotify access token');
            }
            //TODO: USE response.access_token TO LOAD SPOTIFY 
            //PUT response.refresh_token IN THE DB
        } catch(error){
            console.error(error);
        }
    }


    useEffect(()=>{
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get('code');
        if (urlParams.get('error')){
            console.error('failed to retrieve users spotify information');
        }

    }, [])


    return (
        <div>
            <h1 className='font-fredoka' >Loading Your Spotify details...</h1>
        </div>
    )
}

export default LoadUserSpotify;