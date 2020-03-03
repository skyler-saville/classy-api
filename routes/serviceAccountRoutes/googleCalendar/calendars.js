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

// list all calendars
router.get('/calendars', (req, res) => {
  // console.log('searching all calendars')
  jwt.authorize ((err, tokens) => {
    calendar.calendarList.list({
      auth: jwt,
      requestBody: {
        showHidden: true,
        showDeleted: true
      }
  },
  (err, response) => {
    
    if (err) {
      // console.log(`There was an issue with the request ${err}`)
      res.status(400).send({status: 'failure', message: err})
    } else {
      // console.log(`Locating calendars`)
      res.status(200).send(response.data.items)
    }
  }
  )
})
})
// insert new calendar
.post('/calendars', (req, res) => {
  console.log(`Client Email = ${keys.client_email}`)
  jwt.authorize( (err, tokens) => {
    calendar.calendars.insert({
      auth: jwt,
      requestBody: {
        summary: req.body.title, // required
        description: req.body.description // optional
      }
    },
    (err, response) => {
      if (err) {
        // console.log(`There was an issue with the request ${err}`)
        res.status(400).send({error: err})
      } else {
        // console.log(`New calendar created! \nID: ${response.data.id} \nSUMMARY: ${response.data.summary}`)
        res.status(201).send(response.data)
      }
    }
    )
  })
})

// find one calendar by id
router.get('/calendars/:id', (req, res) => {
  console.log(`Calendar id = ${req.params.id}`)
  jwt.authorize( (err, tokens) => {
    calendar.calendars.get({
      auth: jwt,
      calendarId: req.params.id
    },
    (err, response) => {
      if (err) {
        console.log(`There was an issue with the request ${err}`)
        res.status(400).send({error: err})
      } else {
        console.log(`ID: ${response.data.id} \nSUMMARY: ${response.data.summary}`)
        res.status(201).send(response.data)
      }
    }
    )
  })
})

.delete('/calendars/:id', (req, res) => {
  jwt.authorize( (err, tokens) => {
    calendar.calendars.delete({
      auth: jwt,
      calendarId: req.params.id
    },
    (err, response) => {
      if (err) {
        console.log(`There was an issue with the request ${err}`)
        res.status(400).send({error: err})
      } else {
        console.log(`Deleted calendar ${req.params.id}`)
        res.status(200).send({code: 'Success', message: `Deleted calendar ${req.params.id}`})
      }
    }
    )
  })
})

module.exports = router