const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
dotenv.config()


//Import Routes

// AUTHENTICATE ROUTES
const companyAuthRoute = require('./routes/companyRoutes/company_auth')
const userAuthRoute = require('./routes/userRoutes/user_auth')
const adminAuthRoute = require('./routes/adminRoutes/admin_auth')
// COMPANY ROUTES
const companyUsersRouter = require('./routes/companyRoutes/company.users')
// USERS ROUTES
const inviteUsersRouter = require('./routes/inviteUsers')
const updateUserRoutes = require('./routes/userRoutes/updateUser')
// TEST ROUTES (delete before final push)
const postRoute = require('./routes/posts')
const textRoute = require('./routes/messages')
//LOGOUT ROUTES
const logoutRoute = require('./routes/logout')



// DB connection
mongoose.connect(process.env.DB_CONNECTION, 
  { useNewUrlParser: true , useUnifiedTopology: true }, 
  () => console.log('Connected to MongoDB Atlas\n. . . .\n. .\n.')
)

// Middleware
app.use(express.json())
app.use(cookieParser())


//Route Middleware
// ADMINS ROUTERS
app.use('/api/admin', adminAuthRoute)     // check for Admin Invite Code
// USERS ROUTERS
app.use('/api/user', userAuthRoute)         //  '/api/user/register'
app.use('/api/user', updateUserRoutes)  //  '/api/user/:id/(role, password, or phone-number)
app.use('/api/users', inviteUsersRouter)
// COMPANIES ROUTERS
app.use('/api/company', companyAuthRoute)
app.use('/api/company/users', companyUsersRouter)
// MISC ROUTERS
app.use('/api/posts', postRoute)
app.use('/api/messages', textRoute)
// LOGOUT ROUTERS
app.use('/api', logoutRoute)            //  '/api/logout'


app.listen(3001, () => console.log('.  \n. .  \n. . . . \nServer Up and Running on Port 3001'))