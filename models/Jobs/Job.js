const mongoose = require('mongoose')
const moment = require('moment')
const Company = mongoose.model('Company')

const jobSchema = new mongoose.Schema({
  created_on: {
    type: Date,
    default: moment() // now
  },
  invoice: {
    type: String,
    max: 50
  },
  name: {
    type: String,
    max: 100
  },
  address: {
    street_1: { type: String },
    street_2: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String }
  },
  phone: {
    type: String
  },
  company_id: { // this will help to grant the company owner(s) similar administrative abilities as being logged in as the company profile (in case of multiple owners)
    type: mongoose.Schema.Types.ObjectId,
    ref: Company
  },
  sections_qty: {
    type: Number
  },
  // sections [{
  //   array of section ids
  // }]
})

module.exports = mongoose.model('Job', jobSchema)