require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000
const loginRoutes = require('./routes/loginRoutes')
const spotifyRoutes = require('./routes/spotifyRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const session = require('express-session')
const { createNotification, dailyNotification } = require('./utils/notificationUtils')

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



app.get('/', (req, res)=>{
    res.send("welcome to finetune");
})


app.listen(PORT, '127.0.0.1', ()=>{
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
})