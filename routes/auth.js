const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const { registerValidation, loginValidation } = require('../validation')

router.post('/register', async (req, res) => {
  // Validate incoming data before saving new user
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message) // bad request

  // Check if user already is in the database
  const emailExits = await User.findOne({ email: req.body.email })
  if (emailExits) return res.status(400).send('User email already exists')

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  // Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  })
  try{
    const savedUser = await user.save()
    res.send( {user_id : user._id} )
  } catch(err) {
    res.status(400).send(err)
  }
})

// Login
router.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message) // bad request

  // Check if email does not exists
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('Email not found')

  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password)
  if (!validPass) return res.status(400).send('Invalid Password')

  // Add JWT
  const token = JWT.sign({_id: user._id }, process.env.TOKEN_SECRET)
  res.header('auth-token', token).send(token)
  // res.send("Logged in!")
})

module.exports = router