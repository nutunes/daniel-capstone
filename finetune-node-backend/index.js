require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000
const loginRoutes = require('./routes/loginRoutes')

app.use(express.json());
app.use(cors());

app.use('/login', loginRoutes)

app.get('/', (req, res)=>{
    res.send("welcome to finetune");
})


app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})