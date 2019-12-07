const router = require('express').Router()
const verify = require('../middleware/verifyToken')
const very_low_auth = require('../middleware/permissions').VeryLow

router.get('/', verify, very_low_auth, (req, res) => {

  if (req.user) { 
    const user = req.user
    console.log( 'userObject', user)
    if (req.user.role === "basic") { 
      res.status(200).json({
        "message": "You are a basic user and only have access to low-level processes",
        "role": user.role,
        "iat": user.iat
      })
    } else {
      res.send(req.user)
    }
  } 
})

module.exports = router