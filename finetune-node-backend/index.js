require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000
const loginRoutes = require('./routes/loginRoutes')
const spotifyRoutes = require('./routes/spotifyRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const friendRoutes = require('./routes/friendRoutes')
const session = require('express-session')
const cron = require('node-cron')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const { createNotification, weeklyNotification } = require('./utils/notificationUtils')

allowedOrigins = [
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8000'
]


app.use(cors({
    origin: function(origin, callback){
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) === -1){
            const msg = 'Cors does not allow access to this site from this origin';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}))


app.use(express.json());
app.use(session({
    secret: 'finetune-music-recommendation',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000*60*60,
    }
}))


app.use('/login', loginRoutes)
app.use('/spotify', spotifyRoutes)
app.use('/notifications', notificationRoutes)
app.use('/friends', friendRoutes)



app.get('/', (req, res)=>{
    res.send("welcome to finetune");
})


// Schedule the weekly notification to be sent via a cron job to all users every Monday at 8am
cron.schedule('0 8 * * 1', async()=>{
    const users = await prisma.user.findMany();
    for (let user of users){
        try {
            await weeklyNotification(user.id);
            console.log('notif sent');
        } catch(error){
            console.error('error sending weekly notification')
        }
    }
})


app.listen(PORT, '127.0.0.1', ()=>{
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
})