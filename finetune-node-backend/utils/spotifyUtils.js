/*
    This utils file extracts logic for spotify operations that don't require a user to be logged in into functions
    instead of it all being in different routes

    It also includes some functions from the frontend's Spotify Utils because I do not want imports going between
    frontend and backend
*/


const { CommonWords, Letters } = require('./200MostCommonWords.js');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const clientId = process.env.VITE_SPOTIFY_CLIENT_ID
const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET


const checkIfInDatabase = async(spotify_id) => {
    const song = await prisma.song.findUnique({
        where: {spotify_id}
    })
    const exists = song ? song.id : false;
    return exists;
}

const checkIfUnavailable = async(spotify_id) => {
    const song = await prisma.unavailable_Songs.findUnique({
        where: {spotify_id}
    })
    const exists = song ? true : false;
    return exists;
}

const addSongToDatabase = async(spotify_id, recording_mbid, isrc, title, album, mfccs) => {
    const song = await prisma.song.create({
        data: {
            spotify_id,
            recording_mbid,
            isrc,
            title,
            album,
            mfccs,
        }
    });
    return song.id
}

const addSongToUnavailable = async(spotify_id) => {
    const song = await prisma.unavailable_Songs.create({
        data: {
            spotify_id
        }
    })
    return song.spotify_id
}


//This function retrieves a recording's (song's) MBID using its International Standard Recording Code (ISRC) given by Spotify
const getMBID = async(ISRC) => {
    try {
        const url = `https://musicbrainz.org/ws/2/recording?query=isrc:${ISRC}&fmt=json`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'FineTune/1.0 ( daniel.palmer024@gmail.com )',
                'Accept': 'application/json',
            }
        });
        if (!response.ok){
            if (response.status === 503){
                console.log('hit rate limit');
                //Try again in one second
                await delay(1000);
                return getMBID(ISRC)
            } else{
                throw new Error('failed to get mbid')
            }
        }
        const responseJSON = await response.json();
        const MBID = responseJSON.recordings[0].id;
        return MBID;
    } catch(error){
        console.error('failed to get mbid ' + error);
    }
}

//This function gets the MFCCs from a recording's MBID
const getMFCC = async(MBID) => {
    try {
        const url = `https://acousticbrainz.org/api/v1/low-level?recording_ids=${MBID}`;
        const response = await fetch(url);
        if (!response.ok){
            if (response.status === 429){
                console.log('hit rate limit');
                await delay(1000);
                return getMFCC(MBID);
            } else{
                throw new Error('failed to get mfcc')
            }
        }
        const responseJSON = await response.json();
        const mfccs = responseJSON[MBID]["0"].lowlevel.mfcc.mean;
        return mfccs;
    } catch(error){
        console.error('failed to get mfccs' + error);
    }
}

//This function puts a song in the database
const uploadSpotifyTrackToDatabase = async(track) => {
    try {
        //Get MBID from the track's isrc
        const isrc = track.external_ids.isrc;
        const MBID = await getMBID(isrc)
        if (!MBID){
            console.log('failed to get mbid')
            throw new Error('failed to get mbid');
        }

        //Then get MFCCs
        const mfccs = await getMFCC(MBID);
        if (!mfccs){
            throw new Error('failed to get mfccs');
        }

        //Then put it in the database
        console.log('uploading track to db')
        add_id = await addSongToDatabase(track.id, MBID, isrc, track.name, track.album.name, mfccs);
        return await fetch(`http://127.0.0.1:8000/add_instruments_to_song?song_id=${add_id}`)

    } catch(error){
        console.error('error uploading song to database' + error);
        return null
    }
}

//This function delays a designated amount of time
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}



const getClientCredentialsToken = async() => {
    const basicAuth = Buffer.from(clientId + ':' + clientSecret).toString('base64')
    try {
        const response = await fetch('https://accounts.spotify.com/api/token',{
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + basicAuth,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials'
            }),
        })
        if (!response || !response.ok){
            if (response.status === 429){
                //Rate limiting
                await delay(1000)
                return getClientCredentialsToken();
            }
            throw new Error(`failed to get client token code=${response.status}`);
        }
        const responseJSON = await response.json();
        return responseJSON.access_token;
    } catch (error){
        console.error(error);
    }
}

const getDBSongFromSpotifyID = async(spotify_id) => {
    const songInDB = await prisma.song.findUnique({
        where: {
            spotify_id
        }
    })
    return songInDB;
}

// This function gets a random spotify song by creating a random search query and getting a random song that results
// from that search query
//
// It returns a song that has been uploaded to the database - it has MFCCs available. 
const getRandomSpotifySong = async(retries=0) => {
    try {
        const token = await getClientCredentialsToken();
        if (!token){
            throw new Error('failed to get token');
        }
        const odds = Math.random();
        let search = '';
        if (odds <= 0.7){
            // Pick a random word from common words with 70% probability
            search = CommonWords[Math.floor(Math.random()*CommonWords.length)]
        } else{
            // Pick a random letter
            search = Letters[Math.floor(Math.random()*Letters.length)]
        }
        // Get a random result between the zeroth and thousandth inclusive. 
        let offset = Math.floor(Math.random()*1001);
        // Get the track that is the offset'th song in the search results for the random search term
        const url = `https://api.spotify.com/v1/search?q=${search}&type=track&limit=1&offset=${offset}`
        const response = await fetch(url, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        if (!response || !response.ok){
            if (response.status === 429){
                //ratelimiting
                await delay(1000);
                return getRandomSpotifySong(retries)
            }
            throw new Error(`failed to search for song error code: ${response.status}`)
        }
        const responseJSON = await response.json();
        if (!responseJSON.tracks || !responseJSON.tracks.items || responseJSON.tracks.items.length < 1){
            return await getRandomSpotifySong(retries+1);
        }
        const song = responseJSON.tracks.items[0];
        //Check if song is in database
        const exists = await checkIfInDatabase(song.id);
        if (!exists){
            try {
                const upload = await uploadSpotifyTrackToDatabase(song);
                if (!upload){
                    console.log('failed upload')
                    await addSongToUnavailable(song.id)
                    throw new Error('failed upload');
                }
                return getDBSongFromSpotifyID(song.id);
            } catch { //Either the MBID or MFCCs were unable to be retrieved, try again for another random song
                if (retries >= 100){
                    throw new Error('tried 100 times and failed');
                }
                return await getRandomSpotifySong(retries+1);
            }
        }
        return getDBSongFromSpotifyID(song.id);
    } catch(error) {
        console.error('failed to get random spotify song ' + error);
    }
}


const shuffleArray = (arr) => {
    for (let i = arr.length-1; i  > 0; i--){
        const j = Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
}


const seedDatabase = async() => {
    try {
        let token = await getClientCredentialsToken()
        if (!token) {
            throw new Error('failed to get token');
        }
        let terms = [...CommonWords, ...Letters]
        terms = shuffleArray(terms)
        for (let searchTerm of terms){
            console.log(searchTerm)
            let url = `https://api.spotify.com/v1/search?q=${searchTerm}&type=track&limit=50`
            while(url !== null){
                const response = await fetch(url, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                if (response.status === 429){
                    //ratelimiting - delay and then make exact same call again
                    await delay(1000)
                } else if (response.status === 401){
                    //bad authorization, refresh token and then try again
                    token = await getClientCredentialsToken()
                } else if (!response.ok){
                    // throw new Error('spotify search fail')
                    // Try again please
                    token = await getClientCredentialsToken()
                    await delay(1000*60)
                } else {
                    const responseJSON = await response.json()
                    if (!responseJSON.tracks || !responseJSON.tracks.items){
                        // response had no tracks, this is an error
                        // Break and try next search term
                        url = null;
                    } else{
                        const tracks = responseJSON.tracks.items
                        for (let track of tracks) {
                            const exists = await checkIfInDatabase(track.id)
                            const unavailable = await checkIfUnavailable(track.id)
                            if (!exists && !unavailable){
                                const upload = await uploadSpotifyTrackToDatabase(track);
                                if (!upload){
                                    const unavailable = await addSongToUnavailable(track.id);
                                }
                            }
                        }
                        url = responseJSON.tracks.next
                    }
                }
            }
        }
    } catch(error){
        console.error('failed to seed database ' + error)
    }
}


module.exports =  { checkIfInDatabase, checkIfUnavailable, addSongToDatabase, getRandomSpotifySong, seedDatabase }