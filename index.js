const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

//Import Routes
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')



// DB connection
mongoose.connect(process.env.DB_CONNECTION, 
  { useNewUrlParser: true , useUnifiedTopology: true }, 
  () => console.log('Connected to MongoDB Atlas')
)

// Middleware
app.use(express.json())


//Route Middleware
app.use('/api/user', authRoute) // '/api/user/register'
app.use('/api/posts', postRoute)


app.listen(3001, () => console.log('Server Up and Running on Port 3001'))