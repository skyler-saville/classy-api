const router = require('express').Router()
const {google} = require('googleapis')
const keys = require('../credentials')
const calendar = google.calendar('v3')

// scopes 
const scopes = "https://www.googleapis.com/auth/calendar"
const jwt = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key,
  scopes
)

// list events from calendarId
router.get('/:id/events', (req, res) => {
  // console.log('searching all calendars')
  jwt.authorize ((err, tokens) => {
    calendar.events.list({
      auth: jwt,
      calendarId: req.params.id

    },
    (err, response) => {
      console.log("length of response = ", response.data.items.length)
      if (err) {
        // console.log(`There was an issue with the request ${err}`)
        res.status(400).send({status: 'failure', message: err})
      } else {
        // console.log(`Locating calendars`)
        res.status(200).send(response.data.items)
      }
    })
  })
})


module.exports = router