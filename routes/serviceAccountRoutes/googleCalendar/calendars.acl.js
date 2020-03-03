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

// list all access conrols for a specific calendar
router.get('/:id/acl', (req, res) => {
  console.log(`Calendar id = ${req.params.id}`)
  jwt.authorize( (err, tokens) => {
    calendar.acl.list({
      auth: jwt,
      calendarId: req.params.id
    },
    (err, response) => {
      if (err) {
        console.log(`There was an issue with the request ${err}`)
        res.status(400).send({error: err})
      } else {
        console.log(`Getting the ACL data for ${req.params.id}! \nID: ${response.data.id} \nSUMMARY: ${response.data.summary}`)
        res.status(201).send(response.data)
      }
    }
    )
  })
})
// insert access control rule for a specific calendar
.post('/:id/acl', (req, res) => {
  console.log(`Calendar id = ${req.params.id}`)
  jwt.authorize( (err, tokens) => {
    calendar.acl.list({
      auth: jwt,
      calendarId: req.params.id,
      // set the role and type from query params 'aclrole' and acltype'
      role: 'owner',
      scope: {
        type: 'user',
        value: req.body.email
      }
    },
    (err, response) => {
      if (err) {
        console.log(`There was an issue with the request ${err}`)
        res.status(400).send({error: err})
      } else {
        console.log(`New access control created for ${req.params.id}, giving ownership to ${req.body.email}`)
        res.status(201).send(response)
      }
    }
    )
  })
})

module.exports = router