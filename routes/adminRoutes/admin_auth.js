const router = require('express').Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const { userRegisterValidation, loginValidation } = require('../../validation')

/**
 * /register will be replaced by the user/invite method. But will leave for now, for testing purposes
 */
// Create New User (This may become the ADMIN register path later on)
router.post('/register', async (req, res) => {
  if (!req.query.code) {
    res.status(401).json({
      code: 'failure',
      message: 'admin code not present in request'
    })
  } else if ( req.query.code === '123' || req.query.code === process.env.ADMIN_CODE ) {
    console.log('ADMIN registration . . . . . . . . . . .')
    // Validate incoming data before saving new user
    const { error } = userRegisterValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message) // bad request
  
    // Check if user already is in the database
    const emailExits = await User.findOne({ 'email': req.body.email })
    if (emailExits) return res.status(400).json({'error': 'email address already exists'})
  
    const phoneExists = await User.findOne({'phone.number': req.body.phone.number })
    if (phoneExists) return res.status(400).json({'error': 'phone number already exists'})
  
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
  
    // Create a new admin user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: {
        carrier: req.body.phone.carrier,
        number: req.body.phone.number
      },
      role: 'admin'
    })
    try{
      const savedUser = await user.save()
      res.status(201).send({ user })
      console.log('new admin user created')
    } catch(err) {
      res.status(400).json({
        code: 'failure',
        message: 'unable to create a new admin user',
        error: err
      })
    }
  } else {
    res.status(401).json({
      code: 'failure',
      message: 'admin code incorrect',
      submitted_code: req.query.code
    })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message) // bad request

  // Check if email does not exists
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).json({'error':'Email not found', user})

  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password)
  if (!validPass) return res.status(400).json({'error': 'Invalid Password'})

  // Add JWT
  const token = JWT.sign({_id: user._id, role: user.role, message: `Welcome back, ${user.name}!` }, process.env.TOKEN_SECRET)
  // const token = JWT.sign({ user }, process.env.TOKEN_SECRET)
  res.cookie('authorizarion', token, { httpOnly: true })
  res.header('auth-token', token).json({
    code: 'success',
    message: 'admin login successful. Welcome back!',
    jwt: token
  })
  // res.send("Logged in!")
})

module.exports = router