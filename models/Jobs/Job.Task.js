const mongoose = require('mongoose')
const moment = require('moment')
const Employee = mongoose.model('Employee')

const jobTaskSchema = new mongoose.Schema({
  task_type: {
    type: String
  },
  status: {
    type: String,
    enum: ['incomplete', 'in progress', 'complete', 'cancelled']
  },
  updated_on: {
    type: Date
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId, // id of installer
    ref: Employee
  }
})

module.exports = mongoose.model('Task', jobTaskSchema)