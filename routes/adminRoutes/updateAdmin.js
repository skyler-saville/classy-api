// Users routes
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const verify = require('../../middleware/verifyToken')
const { isSelf_orAdmin, isSelf } = require('../../middleware/permissions')
const { Low_Roles } = require('../../middleware/Roles')
const lowRoles = Object.values(Low_Roles)
const User = mongoose.model('User')
const { phoneValidate } = require('../../validation')

/**
 * Phone number functions
 */
const carriers_json = require('../../data_sources/mobile_carriers.json')
const carriers = []
const carrier_gateways = []

function appendGateways (carriers_json) {
  const us_carriers = carriers_json.sms_carriers.us 
  for (i in us_carriers) {
    carrier_gateways.push(us_carriers[i][1])
    // console.log('appending to carriers_gateways array in Users model ', us_carriers[i][0])
  }
  //console.log('running the Gateways function')
  carrier_gateways.push('N/A')
  //console.log(carrier_gateways[0])
  return carrier_gateways
}

function appendCarriers (carriers_json) {
  const us_carriers = carriers_json.sms_carriers.us 
  for (i in us_carriers) {
    carriers.push(us_carriers[i][0])
    // console.log('appending to carriers array in Users model ', us_carriers[i][0])
  }
  //console.log('running the appendCarriers function')
  carriers.push('N/A')
  //console.log(carriers[0])
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
 *  UPDATE USER INFO
 */
// updating a users role can only be done from Company, Owner or Admin user accounts

router.route('/:id/role')
  .patch( verify, isSelf_orAdmin, async (req, res) => {
    // console.log('Low Roles = ', Object.values(Low_Roles))
    // check role assignment against lowRoles and exclude Admin and Company from list of possible role assignments
    console.log(`Trying to assign ${req.body.role} to ${req.user._id}`)
    if (req.body.role === 'admin' || req.body.role === 'company') { 
      console.log('forbidden assignment')
      res.status(403).send({
        code: 'failure',
        message: 'Attempt to assign elevated role to unqualified user-type',
        role: req.body.role
      })
    } else if ((req.body.role !== 'admin' && req.body.role !== 'company') && lowRoles.includes(req.body.role)) {
      try{
        const filter = { _id: req.params.id }
        const update = { role: req.body.role }
        let thisUser = await User.findOneAndUpdate(filter, update, {
          new: true,
          useFindAndModify: false
        })
        if (thisUser){ res.send({ this_user: thisUser })} else { res.status(400).json({code: 'failure', message: "update on user failed"})}
      } catch(err) {
        console.log(err)
        res.status(400).json({
          code: 'failure',
          message: err
        })
      }
    } else {
      res.status(400).send({
        code: 'failure',
        message: `User cannot be assigned to ${req.body.role} role` 
      })
    }
  })

// update phone-number
  router.route('/:id/phone-number')
  .patch( verify, isSelf_orAdmin, async (req, res) => {
    const { error } = phoneValidate(req.body)
    if (error) {
      return res.status(400).json({
        code: 'failure',
        message: 'validation error',
        error: error.details[0].message
      }) // bad request
    } else {
      try {
          console.log('---------- inside the TRY of PATCH /:id/phone-number')
          // replace {number} with this.phone.number on the gateway value and set phone.carrier_gateway to this new string
          // create a function for it
          const userCarrier = req.body.phone.carrier
          const userNumber = req.body.phone.number
          const carrier_gateway = addNumberToGateway(userCarrier, userNumber, carriers, carrier_gateways)
          console.log('TRY GATEWAY = ', carrier_gateway)

          const filter = { _id: req.params.id }
          const update = { 'phone.number': req.body.phone.number, 'phone.carrier': req.body.phone.carrier, 'phone.carrier_gateway': carrier_gateway } // create a way for the user to receive a text message and remove the '_Pending'
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
        } else { res.status(400).json({
          code: 'failure',
          message: "update on user failed"})}
      } catch(err) {
        console.log(err)
        res.status(400).json({
          code: 'failure',
          message: err
        })
      }
    }
  })

// update password
  router.route('/:id/password')
  .patch( verify, isSelf, async (req, res) => {  // remove Admin after this is working and change to isSelf only
    if (req.body.password !== req.body.confirm) {
      res.status(400).json({
        code: 'failure',
        message: 'The passwords submitted do not match. Please try again.'})
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
          res.status(400).json({
            code: 'failure',
            message: 'The new password matches a previously used password. \nFor security, we suggest updating to a brand new password.'})
        } else {
          const filter = { _id: req.params.id }
          const update = { password: hashedPassword }
          let thisUser = await User.findOneAndUpdate(filter, update, {
            new: true // {new: true}  option returns the updated user upon successful update.
          })
          if (thisUser){ 
            res.status(200).send({ 
              code: 'success',
              message: "Password Update Successful!", 
              this_user: thisUser._id 
            })
          } else { 
            res.status(400).json({
              code: 'failure',
              message: "update on user failed"
            })
          }
        }
      } catch(err) {
        console.log(err)
        res.status(400).json({
          code: 'failure',
          message: 'unable to update password',
          error: err
        })
      }
    }
  })

module.exports = router