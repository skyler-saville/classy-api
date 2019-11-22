const router = require('express').Router()
const Company = require('../models/company')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const { companyRegisterValidation, loginValidation } = require('../validation')


router.post('/register', async (req, res) => {
  // Validate incoming data before saving new user
  const { error } = companyRegisterValidation(req.body)
  if (error) return res.status(400).json({'error': error.details[0].message }) // bad request

  // Check if user already is in the database
  const userEmailExists = await User.findOne({ 'email': req.body.email })
  const companyEmailExists = await Company.findOne({ 'email': req.body.email })
  if (companyEmailExists || userEmailExists) return res.status(400).json({'error': 'email address already exists'})

  const phoneExists = await Company.findOne({'phone': req.body.phone })
  if (phoneExists) return res.status(400).json({'error': 'phone number already exists', 'phone_Exist': phoneExists})

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  // Create a new user
  const user = new Company({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    phone: req.body.phone
  })
  try{
    const savedCompany = await user.save()
    res.send({ user })
  } catch(err) {
    res.status(400).send(err)
  }
})

// Login
router.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message) // bad request

  // Check if email does not exists
  const user = await Company.findOne({ email: req.body.email })
  if (!user) return res.status(400).json({'error':'Email not found'})

  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password)
  if (!validPass) return res.status(400).json({'error': 'Invalid Password'})

  // Add JWT
  const token = JWT.sign({_id: user._id, role: user.role, message: 'this user is a Company' }, process.env.TOKEN_SECRET)
  // const token = JWT.sign({ user }, process.env.TOKEN_SECRET)
  res.cookie('Authorizarion', token, { httpOnly: true })
  res.header('auth-token', token).send({ "company_token" : token })
  // res.send("Logged in!")
})

module.exports = router