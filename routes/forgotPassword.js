// Forgot Password Router for ALL users
const router = require('express').Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const randomString = require('random-string')
const User = mongoose.model('User')
const Company = mongoose.model('Company')


router.route('/forgot-password')
.post( async (req, res) => {  // remove Admin after this is working and change to isSelf only
  
  const randomTempPassword = randomString({ length: 12, numaric: true, letters: true, special: false })
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(randomTempPassword, salt)
  const filter = { email: req.body.email }
  const update = { password: hashedPassword }
  var checkUser
  var checkCompany
  var token
  try {
    // TRYING USER FIRST
    checkUser = await User.findOneAndUpdate( filter, update, { new: true, useFindAndModify: false } )
    if (checkUser) {
      token = JWT.sign({_id: checkUser._id, temp: hashedPassword, role: checkUser.role, message: `Welcome back, ${checkUser.name}!` }, process.env.TOKEN_SECRET)
      console.log(checkUser)
      res.send({
        type: 'user',
        user: req.body.email,
        token,
        temp: randomTempPassword
      })
    } else {
      console.log('no user')
    }
  } catch (err) {
    console.log('there was an error finding the user', err)
  } 
  if (!checkUser) {
    // TRYING COMPANY IF USER  == NULL
    try {
      console.log('checking for company profile')
      checkCompany = await Company.findOneAndUpdate( filter, update, { new: true, useFindAndModify: false } )
    } catch (err) {
      console.log('there was an error finding the company', err)
    } finally {
      if (checkCompany) {
        token = JWT.sign({_id: checkCompany._id, temp: hashedPassword, role: checkCompany.role, message: `Welcome back, ${checkCompany.name}!` }, process.env.TOKEN_SECRET)
        console.log(checkCompany)
        res.send({
          type: 'company',
          email: req.body.email,
          temp_password: checkCompany.password,
          token,
          temp: randomTempPassword
        })
      } else {
        console.log('no company')
      }
    }
  }
})

module.exports = router