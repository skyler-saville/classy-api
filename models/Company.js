const mongoose = require('mongoose')
const moment = require('moment')

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
    default: moment() // moment(new Date())
  }, // adding to user schema to create User authorization
  role: {
    type: String,
    default: 'company'
  },
  status: {
    type: String, 
    enum: ['pending', 'active', 'disabled', 'deleted'],
    default: 'pending' // will change to active when email is confirmed
  },
  status_date: {
    type: Date // this date will be used to determine how long a user has been disabled, deleted, etc. 
    // only change the status date when the status gets updated
  },
  last_login: {
    type: Date
  },
  default_tasks: [{
    type: String,
    max: 50 // need to setup joi to prevent more than 50 chars in a default task string also
  }]
})

module.exports = mongoose.model('Company', companySchema)