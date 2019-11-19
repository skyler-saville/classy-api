// Users routes
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Company = mongoose.model('Company')
const bcrypt = require('bcryptjs')
const User = mongoose.model('User')
const { userRegisterValidation, loginValidation } = require('../validation')
const verify = require('../middleware/verifyToken')
const isCompany = require('../middleware/verifyCompany')


/**
 * Middleware.use
 */
router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening on Users router...');
  next(); // make sure we go to the next routes and don't stop here
});

/**
 * User Collection Routes
 */
router.route('/users/confirm')
  .post( async (req, res) => {
    if (req.query.token) {
      const verified = jwt.verify(req.query.token, process.env.TOKEN_SECRET)
      req.user = verified;
      console.log('company_id', req.user.company_id)
      const inviting_company = await Company.findById(req.user.company_id)
      console.log('inviting company', inviting_company)
      if (inviting_company) {
        console.log('located inviting company ', inviting_company.name)
      }

      const { error } = userRegisterValidation(req.body)
      if (error) return res.status(400).send(error.details[0].message) // bad request

      // Check if user already is in the database
      try{
      const userEmailExists = await User.findOne({ 'email': req.body.email })
      const companyEmailExists = await Company.findOne({ 'email': req.body.email })
      if (userEmailExists || companyEmailExists) {
        console.log('email exists')
        // return res.status(400).json({'error': 'email address already exists'})
      }
      } catch(err) {
        console.log('error on email check ',err)
      }

      try{
        const userPhoneExists = await User.findOne({'phone.number': req.body.phone.number })
        const companyPhoneExists = await Company.findOne({'phone': req.body.phone.number })
        if (userPhoneExists || companyPhoneExists) {
          console.log('phone number exists')
          // return res.status(400).json({'error': 'phone number already exists'})
        }
      } catch(err) {
        console.log('error on phone check ',err)
      }


      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt)

      // Create a new user
      const user = new User({
        name: req.body.name,
        email: req.user.email,
        password: hashedPassword,
        phone: {
          carrier: req.body.phone.carrier,
          number: req.body.phone.number
        },
        company_id: req.user.company_id,
        company_name: inviting_company.name,
        role: req.user.role
      })

      try{
        const savedUser = await user.save()
        res.send({ user })
      } catch(err) {
        res.status(400).send(err)
      }

  } else {
    res.status(400).json({
      error: 'Unauthorized'
    })
  }
})

router.route('/users/invite')
  .post( verify, isCompany, async (req, res) => {
    // get current company's id
    if (req.cookies) { console.log('req.cookies = ', req.cookies)}
    if (req.user) { console.log('req.user = ', req.user )}
    const payload = {
      company_id: req.user._id,
      email: req.body.email,
      role: req.body.role
    }
    const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1 day'})
    const url = "http://localhost:3001/api/users/confirm?token="+token

    // send this url to an unprotected route, but process the information as a POST to api/users/confirm?token

    res.send(url)
  })


module.exports = router