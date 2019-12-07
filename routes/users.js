// Users routes
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Company = mongoose.model('Company')
const bcrypt = require('bcryptjs')
const User = mongoose.model('User')
const { userRegisterValidation, loginValidation, phoneValidate } = require('../validation')
const verify = require('../middleware/verifyToken')
const isCompany = require('../middleware/permissions').company
const nodemailer = require('nodemailer')
const possibleRoles = ['basic', 'moderate', 'advanced', 'owner'] // company cannot assign a user to be a Company or an Admin

const carriers_json = require('../data_sources/mobile_carriers.json')
const carriers = []
const carrier_gateways = []

function appendGateways (carriers_json) {
  const us_carriers = carriers_json.sms_carriers.us 
  for (i in us_carriers) {
    carrier_gateways.push(us_carriers[i][1])
    // console.log('appending to carriers_gateways array in Users model ', us_carriers[i][0])
  }
  console.log('running the Gateways function')
  carrier_gateways.push('N/A')
  console.log(carrier_gateways[0])
  return carrier_gateways
}

function appendCarriers (carriers_json) {
  const us_carriers = carriers_json.sms_carriers.us 
  for (i in us_carriers) {
    carriers.push(us_carriers[i][0])
    // console.log('appending to carriers array in Users model ', us_carriers[i][0])
  }
  console.log('running the appendCarriers function')
  carriers.push('N/A')
  console.log(carriers[0])
  return carriers
}

function addNumberToGateway (userCarrier, userNumber, carriers, carrier_gateways) {
  appendCarriers(carriers_json)
  appendGateways(carriers_json)
  if (carriers.length == carrier_gateways.length) {
    for (i in carriers) {
      if (userCarrier == carriers[i]) {
        const this_gateway = carrier_gateways[i]
        if (this_gateway !== "N/A"){
          console.log('this_gateway !== "N/A"')
          const users_gateway = this_gateway.replace("{number}", userNumber)
          console.log("users_gateway from addNumberToGateway function", users_gateway)
          return users_gateway
        }
      }
    }
  }
}



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
router.route('/invite') // only a company can invite an employee
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
    const url = "http://localhost:8080/user/registeration?token="+token

    // send this url via email to user. When the user submits the form on that page it will POST to api/users/confirm?token

    res.send({ url : url, token : token })
  })

router.route('/confirm') // user will be emailed the link (which expires in 1 day)
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
          return res.status(400).json({'error': 'email address already exists'})
        } else if (req.body.email !== req.user.email) {
          console.log('email address supplied does not match email address of invited user')
          return res.status(400).json({ 'error': 'emails mis-match', invitedEmail: req.user.email, suppliedEmail: req.body.email })
        }
      } catch(err) {
        console.log('error on email check ',err)
      }

      try{
        const userPhoneExists = await User.findOne({'phone.number': req.body.phone.number })
        const companyPhoneExists = await Company.findOne({'phone': req.body.phone.number })
        if (userPhoneExists || companyPhoneExists) {
          console.log('phone number exists')
          return res.status(400).json({'error': 'phone number already exists'})
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
        role: req.user.role,
        status: "active"
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

/**
 *  UPDATE USER INFO
 */
// update user role
router.route('/:id/role')
  .patch(async (req, res) => {
    if (!possibleRoles.includes(req.body.role)) {
      res.status(400).send({error: 'The role submitted does not match any of the predefined roles'})
    } else {
      try{
        const filter = { _id: req.params.id }
        const update = { role: req.body.role }
        let thisUser = await User.findOneAndUpdate(filter, update, {
          new: true
        })
        if (thisUser){ res.send({ this_user: thisUser })} else { res.status(400).send({error: "update on user failed"})}
      } catch(err) {
        console.log(err)
        res.status(400).send(err)
      }
    }
  })

// update phone-number
  router.route('/:id/phone-number')
  .patch(async (req, res) => {
    const { error } = phoneValidate(req.body)
    if (error) {
      return res.status(400).send(error.details[0].message) // bad request
    } else {
      try {
          console.log('---------- inside the TRY of PATCH /:id/phone-number')
          // replace {number} with this.phone.number on the gateway value and set phone.carrier_gateway to this new string
          // create a function for it
          const userCarrier = req.body.carrier
          const userNumber = req.body.phone
          const carrier_gateway = addNumberToGateway(userCarrier, userNumber, carriers, carrier_gateways)
          console.log('TRY GATEWAY = ', carrier_gateway)

          const filter = { _id: req.params.id }
          const update = { 'phone.number': req.body.phone, 'phone.carrier': req.body.carrier, 'phone.carrier_gateway': carrier_gateway } // create a way for the user to receive a text message and remove the '_Pending'
          let thisUser = await User.findOneAndUpdate(filter, update, {
            new: true,
            useFindAndModify: false
          })
          if (thisUser){ res.send({ 
            this_user: thisUser._id, 
            number: thisUser.phone.number, 
            carrier: thisUser.phone.carrier, 
            gateway: thisUser.phone.carrier_gateway 
          })
        } else { res.status(400).send({error: "update on user failed"})}
      } catch(err) {
        console.log(err)
        res.status(400).send(err)
      }
    }
  })

// update password
  router.route('/:id/password')
  .patch(async (req, res) => {
    if (req.body.password !== req.body.confirm) {
      res.status(400).send({error: 'The passwords submitted do not match. Please try again.'})
    } else {
      try{

        // check to see if the new password is already in use... if so, ask the user to supply a different password
        const checkUser = await User.findById(req.params.id, 'password')

        // hash the password from the request body
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        // use bcrypt to compare the two and see if they match
        const matched = await bcrypt.compare(req.body.password, checkUser.password)
        if (matched) {
          res.status(400).send({error: 'The new password matches a previously used password. For security, we suggest updating to a brand new password.'})
        } else {
          const filter = { _id: req.params.id }
          const update = { password: hashedPassword }
          let thisUser = await User.findOneAndUpdate(filter, update, {
            new: true // {new: true}  option returns the updated user upon successful update.
          })
          if (thisUser){ res.send({ message: "Password Update Successful!", this_user: thisUser._id })} else { res.status(400).send({error: "update on user failed"})}
        }
      } catch(err) {
        console.log(err)
        res.status(400).send(err)
      }
    }
  })

module.exports = router