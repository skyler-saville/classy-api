const mongoose = require('mongoose')
const moment = require('moment')
const Employee = mongoose.model('Employee')
const Calendar = mongoose.model('Calendar')
const Task = mongoose.model('Task')

const jobSectionSchema = new mongoose.Schema({
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: Task
  }],
  section_name: {
    type: String,
    max: 50
  },
  install_date: {
    type: Date
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId, // id of installer
    ref: Employee
  },
  calendar_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Calendar
  }
})

module.exports = mongoose.model('Job', jobSectionSchema)