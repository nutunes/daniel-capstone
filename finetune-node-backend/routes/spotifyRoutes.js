const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.patch('/:id', async(req, res)=>{
    try {
        const userId = req.params.id;
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
        res.status(500).json({error: 'server error'})
    }
})



module.exports = router;