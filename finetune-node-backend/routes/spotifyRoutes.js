const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const {isAuthenticated} = require('../middleware/auth')



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
    const song = await prisma.song.findUnique({where: {spotify_id}})
    const exists = song ? true : false;
    res.json(exists);
})

//Add a song to the database
router.post('/add_song', isAuthenticated, async(req, res)=>{
    try {
        const { spotify_id, recording_mbid, isrc, title, album, mfccs } = req.body;
        if (!spotify_id || !recording_mbid || !isrc || !title || !album || !mfccs){
            return res.status(400).json({error: 'you must include spotify id, recording mbid, title, album, album mbid'});
        }
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
        res.json(song.id)
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
                    : {disconnect: {id: song.id}}
            }
        });
        res.json(updatedUser.id);
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})




module.exports = router;