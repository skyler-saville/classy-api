const router = require('express').Router()
const verify = require('../middleware/verifyToken')

router.get('/cookie-test', (req, res) => {
  res.cookie('Authorization', 'un-authorized')
  res.status(200).json({'message': 'check if the cookie sent'})
})

router.get('/cookie-auth', verify, (req, res) => {
  const request = req.user
  res.cookie('user-role', request.user._id)
  res.status(200).json({'message': 'check if the cookie sent'})
})

module.exports = router