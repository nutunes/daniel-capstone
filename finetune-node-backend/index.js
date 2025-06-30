require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000
const loginRoutes = require('./routes/loginRoutes')
const spotifyRoutes = require('./routes/spotifyRoutes')
const session = require('express-session')


app.use(cors({
    origin: 'http://127.0.0.1:5173',
    credentials: true
}));
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


app.get('/', (req, res)=>{
    res.send("welcome to finetune");
})


app.listen(PORT, '127.0.0.1', ()=>{
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
})