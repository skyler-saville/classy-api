const router = require('express').Router()
const Company = require('../../models/company')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const { companyRegisterValidation, loginValidation } = require('../../validation')

// Company Sign-Up
router.post('/register', async (req, res) => {
  // Validate incoming data before saving new company
  const { error } = companyRegisterValidation(req.body)
  if (error) return res.status(400).json({'code': `User:${req.user}` , 'error': error.details[0].message }) // bad request

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
  const company = new Company({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    phone: req.body.phone
  })
  try{
    const savedCompany = await company.save()
    res.status(201).send({ message: "company created!", code: "success", company })
    console.log("Company User Profile Created on ", Date.now())
  } catch(err) {
    res.status(400).send(err)
  }
})

// Company Login
router.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message) // bad request

  // Check if email does not exists
  const company = await Company.findOne({ email: req.body.email })
  if (!company) return res.status(400).json({'error':'Email not found'})

  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, company.password)
  if (!validPass) return res.status(400).json({'error': 'Invalid Password'})

  // Add JWT
  const token = JWT.sign({_id: company._id, role: company.role, message: `Logged in as ${company.name}` }, process.env.TOKEN_SECRET)
  // Set Cookie Authorization=JWT httpOnly
  res.cookie('authorizarion', token, { httpOnly: true })
  res.header('auth-token', token)
    .send({
      code: 'success',
      message: `Hello ${company.name}`,
      auth_cookie: token
    })
  /**
   * Eventually will redirect to the correct place. Currently though, /posts displays the current JWT info
   */
  // res.redirect('/api/posts') 
})

module.exports = router