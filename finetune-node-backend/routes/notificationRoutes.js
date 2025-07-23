const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const {isAuthenticated} = require('../middleware/auth')


// This route gets a user's notifications
router.get('/', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;
        const notifs = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                notifications: true,
            }
        })
        res.json(notifs.notifications)
    } catch (error){
        res.status(500).json({error: 'server error'})
    }
})


// This route sends a daily notification to ensure that it works
router.get('/test', async(req, res)=>{
    try{
        const notif = await dailyNotification('2ca24dc2-7f1d-48be-a855-485041cf0e95');
        res.json(notif)
        
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})

module.exports = router