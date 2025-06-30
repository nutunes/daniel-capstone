require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000
const loginRoutes = require('./routes/loginRoutes')
const session = require('express-session')

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]

app.use(cors({
    origin: (origin, callback)=>{
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)){
            callback(null, true);
        } else{
            callback(new Error('Not allowed by CORS'))
        }
    },
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

app.get('/', (req, res)=>{
    res.send("welcome to finetune");
})


app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})