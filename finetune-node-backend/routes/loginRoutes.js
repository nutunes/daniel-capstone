const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.get('/usernameAvailable', async (req, res)=>{
    const { username } = req.query;
    if (!username){
        return res.status(404).json({error: "must query for a username"})
    }
    const user = await prisma.User.findUnique({where: {username}})
    const available = !user;
    res.json({available})
})


module.exports = router;