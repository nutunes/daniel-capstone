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

router.patch('/add_song', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;
        console.log(userId);
        const {like, spotify_id, title, album, spotify_album_id} = req.body;
        if (like !== true && like !== false){
            return res.status(400).json({error: 'like must be either true or false'});
        }
        if (!spotify_id || !title || !album || !spotify_album_id){
            return res.status(400).json({error: 'must specify spotify id, title, album, and spotify album id'});
        }
        const song = await prisma.song.upsert({
            where: { spotify_id },
            update: {}, //do nothing if it exists
            create: {
                spotify_id,
                title,
                album,
                spotify_album_id
            },
        });
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                likedSongs: like==='like' 
                    ? {connect: {id: song.id}}
                    : {disconnect: {id: song.id}},
                dislikedSongs: like==='false'
                    ? {connect: {id: song.id}}
                    : {disconnect: {id: song.id}}
            }
        });
        res.json(updatedUser.id);
    } catch(error){
        res.status(500).json({error: 'server error'});
    }
})


module.exports = router;