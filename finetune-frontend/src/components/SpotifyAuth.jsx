import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const generateRandomString = (length) =>{
    const possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x)=>acc + possible[x%possible.length], "");
}

const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const redirectUri = 'http://127.0.0.1:5173/loaduserspotify'

const scope = 'user-top-read'
const authUrl = new URL("https://accounts.spotify.com/authorize")

const SpotifyAuth = () => {
    const navigate = useNavigate();

    const requestAuth = async () => {
        //Send request to Spotify, will redirect to spotify's page
        const codeVerifier = generateRandomString(64);
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);

        window.localStorage.setItem('code_verifier', codeVerifier);

        const params = {
            response_type: 'code',
            client_id: clientId,
            scope,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            redirect_uri: redirectUri,
        }
        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    }

    return (
        <div>
            <Button variant = 'outline' size='lg' className='text-palegreen !border-palegreen flex-1 hover:text-darkpurple hover:!bg-palegreen focus:scale-105 active:scale-105'
                onClick={requestAuth}>Connect to Spotify</Button>
            <Button onClick={()=>navigate('/loaduserspotify')}>Test</Button>
        </div>
    )
}

export default SpotifyAuth;