const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const {isAuthenticated} = require('../middleware/auth')
const { weeklyNotification, createNotification } = require('../utils/notificationUtils')


// Set a notification to be opened
router.patch('/open', isAuthenticated, async(req, res)=>{
    const { notification_id } = req.query;
    if (!notification_id){
        return res.status(404).json({error: 'must include a notification id to open'})
    }
    const updatedNotification = await prisma.notification.update({
        where: {
            id: notification_id,
        },
        data: {
            read: true,
        }
    });
    res.json(updatedNotification)
})

//Delete a notification
router.delete('/', isAuthenticated, async(req, res)=>{
    const { notification_id } = req.query;
    if (!notification_id){
        return res.status(404).json({error: 'must include a notification id to delete'})
    }
    const deletedNotification = await prisma.notification.delete({
        where: {
            id: notification_id,
        }
    })
    res.json(deletedNotification.id)
})



// This route gets a user's notifications
router.get('/', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;
        const notifs = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                notifications: {
                    orderBy: {
                        createdAt: 'desc',
                    }
                }
            },
        })
        res.json(notifs.notifications)
    } catch (error){
        res.status(500).json({error: 'server error'})
    }
})





// This route sends a daily notification to ensure that it works
router.get('/test', async(req, res)=>{
    try{
        const notif = await weeklyNotification('2ca24dc2-7f1d-48be-a855-485041cf0e95');
        res.json(notif)
        
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})



module.exports = router