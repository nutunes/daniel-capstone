const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const {isAuthenticated} = require('../middleware/auth')
const { checkIfInDatabase, addSongToDatabase, getRandomSpotifySong } = require('../utils/spotifyUtils')


//This route adds a refresh token to a user's profile
router.patch('/refresh_token', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;
        const {refresh_token} = req.body;
        if (!refresh_token){
            return res.status(400).json({error: 'must include a refresh token'});
        }
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                spotifyRefreshToken: refresh_token
            }
        });
        res.json(updatedUser.id);
    }catch (error){
        res.status(500).json({error: 'server error'});
    }
})

//Check if a song is in the db
router.get('/exists', isAuthenticated, async(req, res)=>{
    const { spotify_id } = req.query;
    if (!req.query){
        return res.status(404).json({error: 'must query for a spotify id'});
    }
    res.json(await checkIfInDatabase(spotify_id))
})

//Add a song to the database
router.post('/add_song', isAuthenticated, async(req, res)=>{
    try {
        const { spotify_id, recording_mbid, isrc, title, album, mfccs } = req.body;
        if (!spotify_id || !recording_mbid || !isrc || !title || !album || !mfccs){
            return res.status(400).json({error: 'you must include spotify id, recording mbid, title, album, album mbid'});
        }
        res.json(await addSongToDatabase(spotify_id, recording_mbid, isrc, title, album, mfccs));
    } catch(error){
        return res.status(500).json({error: 'server fail'})
    }
})

//Add a song to a user's liked/disliked songs
router.patch('/add_song_to_user', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;
        const { like, spotify_id } = req.body;
        if (like !== true && like !== false){
            return res.status(400).json({error: 'like must be either true or false'})
        }
        if (!spotify_id){
            return res.status(400).json({error: 'must specify song id'})
        }
        const song = await prisma.song.findUnique({where: {spotify_id}});
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                likedSongs: like 
                    ? {connect: {id: song.id}}
                    : {disconnect: {id: song.id}},
                dislikedSongs: !like
                    ? {connect: {id: song.id}}
                    : {disconnect: {id: song.id}},
                updateRegression: true,
            }
        });
        res.json(updatedUser.id);
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})

//Get a user's liked songs
router.get('/liked_songs', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;
        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {
                likedSongs: true,
            }
        });
        res.json(user.likedSongs)
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})

//Get a random song from spotify that is in the database
router.get('/random_song', async(req, res)=>{
    try {
        res.json(await getRandomSpotifySong())
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})


//Check if a user's algorithm needs to update
router.get('/reg_updated', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;;
        const user = await prisma.user.findUnique({
            where: {id: userId}
        });
        res.json(user.updateRegression)
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})


//Get a user's recommended songs
router.get('/songs_for_feedback', isAuthenticated, async(req, res)=>{
    try{
        const userId = req.session.userId;
        const songs = await prisma.song.findMany({
            where:{
                recommendedTo: {
                    some: {id: userId}
                },
                likedBy: {
                    none: {id: userId}
                },
                dislikedBy: {
                    none: {id: userId}
                }
            }
        });
        res.json(songs)
    } catch(error){
        console.error(error);
    }
})


module.exports = router;