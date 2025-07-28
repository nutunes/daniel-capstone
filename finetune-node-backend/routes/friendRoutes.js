const express = require('express')
const router = express.Router()
const { PrismaClient, FriendRequestStatus } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const {isAuthenticated} = require('../middleware/auth')




//Create a friend request
router.post('/create', isAuthenticated, async(requestAnimationFrame, res)=>{
    try {
        const userId = req.session.userId;
        const { friendId } = req.body;
        if (!friendId){
            return res.status(400).json({error: 'must specify a recipient id'})
        }

        const friend = await prisma.user.findUnique({
            where: {
                id: friendId
            }
        })
        if (!friend){
            return res.status(400).json({error: 'friend account does not exist'})
        }

        const request = await prisma.friendRequest.create({
            data: {
                sender: {
                    connect: {id: userId}
                },
                receiver: {
                    connect: {id: friendId}
                },
                status: FriendRequestStatus.PENDING
            }
        })
        res.json({request})

    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})


//Respond to  a friend request
router.post('/request_response', isAuthenticated, async(req, res)=>{
    try {
        const { requestId, accept } = req.body;
        if (!requestId || (accept !== false && accept !== true)){
            return res.status(400).json({error: 'must specify a request id and accept must either be true or false'})
        }

        const request = await prisma.friendRequest.findUnique({
            where: {
                id: requestId,
            }
        })
        if (!request){
            return res.status(400).json({error: 'the provided request id does not correspond to an actual friend request'})
        }
        const newStatus = accept ? FriendRequestStatus.ACCEPTED : FriendRequestStatus.REJECTED;
        const updatedRequest = await prisma.friendRequest.update({
            where: {
                id: requestId,
            },
            data: {
                status: newStatus
            }
        })
        res.json({updatedRequest})
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})


//Retrieve a user's friends
router.get('/all_friends', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;
        const userFriendRequests = await prisma.friendRequest.findMany({
            where: {
                status: FriendRequestStatus.ACCEPTED,
                OR: [
                    { senderId: userId },
                    { receiverId: userId}
                ]
            },
            include: {
                sender: true,
                receiver: true,
            }
        });
        const friends = userFriendRequests.map(freq => {
            freq.senderId === userId ? freq.sender : freq.receiver
        });
        res.json(friends)
    } catch(error){
        res.status(500).json({error: 'server error'})
    } 
})




module.exports = router;