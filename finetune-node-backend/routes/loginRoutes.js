const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const {isAuthenticated} = require('../middleware/auth')



//Check if a username is available
router.get('/usernameAvailable', async (req, res)=>{
    const { username } = req.query;
    if (!username){
        return res.status(404).json({error: "must query for a username"})
    }
    const user = await prisma.User.findUnique({where: {username}})
    const available = !user;
    res.json({available})
})

//Create an account
router.post('/register', async(req, res)=>{
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({error: "must have both username and password"})
        }

        //Ensure username is not taken
        const existingUser = await prisma.user.findUnique({where: {username}});
        if (existingUser){
            return res.status(400).json({error: 'username taken'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.User.create({
            data: {username, hashedPassword}
        })
        req.session.userId = newUser.id;
        res.status(201).json({id: newUser.id});
    } catch (error){
        console.error(error);
        res.status(500).json({error: 'signup failed'})
    }
})


//Login to an account
router.post('/', async(req, res)=>{
    try {
        const {username, password} = req.body;
        if (!username || !password){
            return res.status(400).json({error: "must include both a username and password"});
        }
        const user = await prisma.user.findUnique({where: {username}});
        if (!user){
            return res.status(400).json({error: 'invalid username or password'});
        }
        const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
        if (!isValidPassword){
            return res.status(400).json({error: 'invalid username or password'});
        }
        req.session.userId = user.id;
        res.json({id: user.id})
    } catch (error){
        console.error(error);
        res.status(500).json({error: 'login failed'})
    }
})

//Check if user is logged in
router.get('/session-status', async (req, res)=>{
    try {
        if (!req.session){
            return res.status(401).json({message: 'no session exists'})
        }
        if (!req.session.userId){
            return res.status(401).json({message: 'not logged in'});
        }
        const user = await prisma.user.findUnique({
            where: {id: req.session.userId},
            select: {username: true}
        })
        if (!user){
            return res.status(400).json({error: 'user no longer exists'})
        }
        res.json({id: req.session.userId})
    } catch (error){
        console.error(error);
        res.status(500).json({error: 'session retrieval failed'})
    }
})


//Logout of an account
router.post('/logout', isAuthenticated, async(req, res)=>{
    req.session.destroy((err)=>{
        if (err) {
            return res.status(500).json({error: 'logout failed'})
        }
        res.clearCookie("connect.sid");
        res.json({message: "logged out successfully"})
    })
})

module.exports = router;