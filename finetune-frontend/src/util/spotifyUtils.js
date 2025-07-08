
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

//This function gets an album's MBID from Music Brainz
const getReleaseID = async(albumName) => {
    try {
        const url = `https://musicbrainz.org/ws/2/release?query=${albumName}&limit=1&fmt=json`;
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
                return getReleaseID(albumName)
            } else{
                throw new Error('failed to get release id')
            }
        }
        const responseJSON = await response.json();
        return responseJSON.releases[0].id;
    } catch(error){
        console.error('failed to get release id' + error);
    }
}

//This function normalizes strings so that comparing the titles of songs can be made with less error
const normalizeString = (string) => {
    return string
        .replace(/\s*(feat\.?|ft\.?|with)\s+[^()\-]+/gi, '') // remove "feat. Name", "ft. Name", "with Name"
        .replace(/\(.*?(feat\.?|ft\.?|with).*?\)/gi, '')     // remove anything in parentheses that mentions features
        .normalize('NFKD')                  // Unicode normalization (decompose)
        .replace(/[\u0300-\u036f]/g, '')   // Remove diacritics (what was separated with the previous line)
        .toLowerCase()                     // Case insensitive
        .replace(/[’‘‛❛❜′`ʻʼʽ]/g, "'")  // Normalize various apostrophes to straight '
        .replace(/["“”„‟«»]/g, '"')       // Normalize quotes to "
        .replace(/&/g, 'and')              // Convert & to and (optional)
        .replace(/[\(\)\[\]\{\}]/g, '')   // Remove brackets/parentheses
        .replace(/[.,;:!?\/\\\-–—―]/g, ' ') // Replace punctuation with space
        .replace(/\s+/g, ' ')              // Collapse multiple spaces
        .trim();                          // Trim leading/trailing spaces
}

//This function retrieves a recording's (song's) MBID from Music Brainz
const getMBID = async(releaseID, title) => {
    try {
        const url = `https://musicbrainz.org/ws/2/release/${releaseID}?inc=recordings&fmt=json`;
        console.log(url);
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
                return getMBID(releaseID)
            } else{
                throw new Error('failed to get mbid')
            }
        }
        const responseJSON = await response.json();
        const tracks = responseJSON.media[0].tracks;
        const normalizedTitle = normalizeString(title);
        for (let track of tracks){
            const normalizedTrackTitle = normalizeString(track.title);
            if (normalizedTrackTitle === normalizedTitle || normalizedTrackTitle.includes(normalizedTitle) || normalizedTitle.includes(normalizedTrackTitle)){
                return track.recording.id;
            } else {
                console.log(`${normalizedTrackTitle} is not ${normalizedTitle}`)
            }
        }
    } catch(error){
        console.error('failed to get mbid' + error);
    }
}

//This function puts a song in the database
const uploadToDatabase = async(track) => {
    try {
        //First get release ID
        const releaseID = await getReleaseID(track.album.name);
        if (!releaseID){
            throw new Error('failed to get release id');
        }

        console.log('album id: ' + releaseID)
        //Then get MBID from the releaseid
        const MBID = await getMBID(releaseID, track.name);
        if (!MBID){
            throw new Error('failed to get mbid');
        }

        console.log('recording id: ' + MBID)
        //TODO then get MFCC
        
        //Then put it in the database
        const response = await fetch(`http://127.0.0.1:3000/spotify/add_song`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                spotify_id: track.id,
                recording_mbid: MBID,
                title: track.name,
                album: track.album.name,
                album_mbid: releaseID,
            }),
            credentials: 'include',
        });
        if (!response.ok){
            throw new Error('failed to upload song to database');
        }
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
            console.log(responseJSON.items);

            for (let track of responseJSON.items){
                trackIDs.push(track.id);
                const exists = await checkIfInDatabase(track.id);
                if (!exists){
                    //Song is already in database, nothing further to do except for link it with the user
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
            await delay(2000);
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

export { checkIfInDatabase, uploadToDatabase, addSongToUser, uploadUsersTop300Tracks }