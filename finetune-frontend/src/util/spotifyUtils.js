//This function checks if a song is already present in the database
const checkIfInDatabase = async(spotifyId) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/spotify/exists?spotify_id=${spotifyId}`, {
            credentials: 'include',
        });
        if (!response.ok){
            throw new Error('failed to check if song was in database')
        }
        const responseJSON = await response.json();
        return responseJSON;
    } catch(error){
        console.error(error);
    }
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
        console.log(url);
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
const uploadToDatabase = async(track) => {
    try {
        //Get MBID from the track's isrc
        const isrc = track.external_ids.isrc;
        const MBID = await getMBID(isrc)
        if (!MBID){
            throw new Error('failed to get mbid');
        }

        //Then get MFCCs
        const mfccs = await getMFCC(MBID);
        if (!mfccs){
            throw new Error('failed to get mfccs');
        }

        //Then put it in the database
        const response = await fetch(`http://127.0.0.1:3000/spotify/add_song`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                spotify_id: track.id,
                recording_mbid: MBID,
                isrc,
                title: track.name,
                album: track.album.name,
                mfccs: mfccs,
            }),
            credentials: 'include',
        });
        if (!response.ok){
            throw new Error('failed to upload song to database');
        }
        return await response.json();
    } catch(error){
        console.error('error uploading song to database' + error);
    }
}

//This function delays a designated amount of time
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//This function adds a song to a user's liked/disliked lists
const addSongToUser = async(like, spotifyId) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/spotify/add_song_to_user`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                like,
                spotify_id: spotifyId,
            }),
            credentials: 'include',
        });
        if (!response.ok){
            throw new Error('failed to add song to user');
        }
        return await response.json()
    } catch(error){
        console.error(error);
    }
}

//This function uploads a user's top 300 tracks to their profile
const uploadUsersTop300Tracks = async(token, done) => {
    //Tracks to upload
    let spotifyTracks = [];
    let trackIDs = [];
    let newTracks = []; 
    
    //Get top 500 tracks
    try {
        let url = 'https://api.spotify.com/v1/me/top/tracks?limit=50'
        for (let i = 0; i < 6; i++){ //Fetch 50 songs, 6 times
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (!response.ok){
                //I am near certain that, because of strict mode, this is going to be an issue
                //But, because it is good practice I am going to leave the error checking here for the final version
                throw new Error('fetch songs fail')
            }
            const responseJSON = await response.json();

            for (let track of responseJSON.items){
                trackIDs.push(track.id);
                const exists = await checkIfInDatabase(track.id);
                if (!exists){
                    newTracks.push(track);
                }
            }

            spotifyTracks = [...spotifyTracks, ...responseJSON.items];
            if (responseJSON.next === null){
                //Don't keep searching for more songs if you have no more top items
                break; 
            }
            url = responseJSON.next;
        }
    } catch(error){
        console.error('error retrieving top 500 tracks' + error);
    }

    //Process new tracks that are not in the database. This involves getting their MusicBrainz ID, 
    //getting their MFCCs, and then adding to the database
    //Because of ratelimiting, do a new track every 2 seconds. This is because we make 2 calls to an api
    //that limits to 10 calls in 10 seconds
    try {
        for (let track of newTracks){
            await uploadToDatabase(track);
            await delay(1000);
        }
    } catch(error){
        console.error('error uploading song to database' + error);
    }

    //Upload all tracks to the users profile - at this point they all exist in the song database
    try {
        let numadded = 0;
        let loopedthrough = 0;
        for ( let id of trackIDs){
            const exists = await checkIfInDatabase(id);
            loopedthrough++;
            if (exists){
                await addSongToUser(true, id);
                numadded++;
            }
        }
        console.log(`numadded: ${numadded} loopedthrough: ${loopedthrough}`)
        done(true);
    } catch(error){
        console.error('error adding tracks to user profile'+error);
    }
}

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

const getClientCredentialsToken = async() => {
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
        return responseJSON.access_token;
    } catch (error){
        console.error(error);
    }
}



export { checkIfInDatabase, uploadToDatabase, addSongToUser, uploadUsersTop300Tracks, getClientCredentialsToken }