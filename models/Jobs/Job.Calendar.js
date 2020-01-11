const mongoose = require('mongoose')

const jobCalendarSchema = new mongoose.Schema({
  google_calendar_id: { type: String },
})

module.exports = mongoose.model('Calendar', jobCalendarSchema)