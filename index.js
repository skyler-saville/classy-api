const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
dotenv.config()


//Import Routes

// AUTHENTICATE ROUTES
const companyAuthRoute = require('./routes/companyRoutes/company_auth') // Company and User models registered in this file
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
// LOGOUT ROUTE
const logoutRoute = require('./routes/logout')
// FORGOT PASSWORD ROUTE
const forgotRoute = require('./routes/forgotPassword')
// ADMIN ONLY ROUTES
const companiesRoutes = require('./routes/adminRoutes/admin.companies')
const usersRoutes = require('./routes/adminRoutes/admin.users')
// GOOGLE ROUTES
const googleCalendar = require('./routes/serviceAccountRoutes/google.calendar')

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
app.use('/api/companies', companiesRoutes) // for all users
app.use('/api/users', usersRoutes) // for all users
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
// FORGOT PASSWORD ROUTER
app.use('/api', forgotRoute)            //  '/api/forgot-password'
// GOOGLE ROUTERS
app.use('/api/google', googleCalendar)  //  '/api/google/calendar'


app.listen(3001, () => console.log(`.  \n. .  \n. . . . \nServer Up and Running on Port 3001 \nAccount Type: ${process.env.G_TYPE}\nCLient ID: ${process.env.G_CLIENT_ID} \nProject Id: ${process.env.G_PROJECT_ID}`))