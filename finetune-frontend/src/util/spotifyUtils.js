

const uploadUsersTop500Tracks = async(token) => {
    //Tracks to upload
    let spotifyTracks = []; 
    
    //Get top 500 tracks
    try {
        for (let i = 0; i < 10; i++){ //Fetch 50 songs, 10 times
            const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            // if (!response.ok){
            //     //I am near certain that, because of strict mode, this is going to be an issue
            //     //But, because it is good practice I am going to leave the error checking here for the final version
            //     throw new Error('fetch songs fail')
            // }
            const responseJSON = await response.json();
            console.log(responseJSON);
            spotifyTracks = [...spotifyTracks, ...responseJSON.items];
            if (responseJSON.next === null){
                //Don't keep searching for more songs if you have no more top items
                break; 
            }
        }
    } catch(error){
        console.error(error);
    }
    console.log('spotify tracks: ' + spotifyTracks)
    //Upload tracks to the db
    try {
        for ( track of spotifyTracks){
            const response = await fetch(`http://127.0.0.1:3000/spotify/add_song`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    like: true,
                    spotify_id: track.id,
                    title: track.name,
                    album: track.album.name,
                    spotify_album_id: track.album.idm
                }),
                credentials: 'include',
            })
            // Commented out for same strict mode issue
            // if (!response.ok){
            //     throw new Error('failed to add song');
            // }
        }
    } catch(error){
        console.error(error);
    }
}

export { uploadUsersTop500Tracks }