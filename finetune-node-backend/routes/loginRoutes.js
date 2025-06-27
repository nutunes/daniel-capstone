const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

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
        const existingUser = await prisma.User.findUnique({where: {username}});
        if (existingUser){
            return res.status(400).json({error: 'username taken'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.User.create({
            data: {username, hashedPassword}
        })
        res.status(201).json({message: 'User successfully created'});
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
        const user = await prisma.User.findUnique({where: {username}});
        if (!user){
            return res.status(400).json({error: 'invalid username or password'});
        }
        const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
        if (!isValidPassword){
            return res.status(400).json({error: 'invalid username or password'});
        }
        res.json({message: "login successful"});
    } catch (error){
        console.error(error);
        res.status(500).json({error: 'login failed'})
    }
})


module.exports = router;