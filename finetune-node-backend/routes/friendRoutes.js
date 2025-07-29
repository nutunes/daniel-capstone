const express = require('express')
const router = express.Router()
const { PrismaClient, FriendRequestStatus } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const {isAuthenticated} = require('../middleware/auth')
const { createNotification } = require('../utils/notificationUtils')




//Create a friend request
router.post('/send_request', isAuthenticated, async(req, res)=>{
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
                status: FriendRequestStatus.PENDING,
            }
        })
        //Once the request is created, send a notification to the reciever that they have a friend request
        const sender = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                username: true,
            }
        })

        const subject = 'Friend Request';
        const content = `You have an incoming friend request from ${sender.username}`;
        await createNotification(subject, content, friendId);

        res.json({request})

    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})


//Respond to a friend request
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


//Retrieve a user's friends. This is done by querying the friend requests for accepted requests with the user as either sender or receiver
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


//Retrieve all pending requests for a user to respond to
router.get('/received_requests', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;

        const userReceivedRequests = await prisma.friendRequest.findMany({
            where: {
                status: FriendRequestStatus.PENDING,
                receiverId: userId,
            },
            include: {
                sender: true,
            }
        })

        res.json(userReceivedRequests);
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})


router.get('/recommended_friends', isAuthenticated, async(req, res)=>{
    try{
        const userId = req.session.userId;
        //Placeholder - just gives all users
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: userId,
                },
                receivedRequests: {
                    none: {
                        senderId: userId,
                    },
                },
                sentRequests: {
                    none: {
                        receiverId: userId,
                    }
                }
            }
        })
        res.json(users)
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})


//Unadd a friend
router.patch('/remove_friend', isAuthenticated, async(req, res)=>{
    try {
        const userId = req.session.userId;

        const { friendId } = req.body;
        if (!friendId){
            return res.status(400).json({error: 'must specify a friend id to remove'})
        }
        
        const friend = await prisma.user.findUnique({
            where: {
                id: friendId
            }
        });
        if (!friend){
            return res.status(400).json({error: 'friend does not exist'})
        }

        const request = await prisma.friendRequest.findFirst({
            where: {
                status: FriendRequestStatus.ACCEPTED,
                OR: [
                    {
                        AND: [
                            {senderId: userId},
                            {receiverId: friendId}
                        ]
                    },
                    {
                        AND: [
                            {senderId: friendId},
                            {receiverId: userId}
                        ]
                    }
                ]
            }
        });
        if (!request){
            return res.status(400).json({error: 'no friendship exists between specified users'})
        }

        const deletedRequest = await prisma.friendRequest.delete({
            where: {id: request.id}
        })

        res.json(deletedRequest)
    } catch(error){
        res.status(500).json({error: 'server error'})
    }
})




module.exports = router;