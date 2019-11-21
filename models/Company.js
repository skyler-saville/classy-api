const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    require: true, 
    max: 255,
    min: 6
  },
  email: { // this needs to be unique... but Joi may be able to handle that.
    type: String,
    require: true,
    max: 255,
    min: 6
  },
  password: { // password hashed before saving
    type: String,
    require: true,
    max: 1024,
    min: 6
  },
  phone: {
    number: {
      type: String,
      min: 10 // number only, no other chars allowed
    }
  },
  date: { // sign up date
    type: Date,
    default: Date.now
  }, // adding to user schema to create User authorization
  role: {
    type: String,
    default: 'company'
  },
  company: { // this will help to grant the company owner(s) similar administrative abilities as being logged in as the company profile (in case of multiple owners)
    type: String // change this to ObjectId after the Company model is created
  }, 
  status: {
    type: String, 
    enum: ['pending', 'active', 'disabled'],
    default: 'pending' // will change to active when email is confirmed
  }
})

module.exports = mongoose.model('Company', companySchema)