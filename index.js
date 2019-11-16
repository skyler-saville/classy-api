const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
dotenv.config()

//Import Routes
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
const textRoute = require('./routes/messages')
const unprotectedRoute = require('./routes/unprotected')



// DB connection
mongoose.connect(process.env.DB_CONNECTION, 
  { useNewUrlParser: true , useUnifiedTopology: true }, 
  () => console.log('Connected to MongoDB Atlas')
)

// Middleware
app.use(express.json())
app.use(cookieParser())


//Route Middleware
app.use('/api/user', authRoute) // '/api/user/register'
app.use('/api/posts', postRoute)
app.use('/api/messages', textRoute)
app.use('/api/open', unprotectedRoute)


app.listen(3001, () => console.log('Server Up and Running on Port 3001'))