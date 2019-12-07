const router = require('express').Router()
const cookieCheck = require('../middleware/cookieCheck')

// logout function for ALL user types
// Company Logout
router.post('/logout', cookieCheck, async (req, res) => {
  try {
    if (req.user) {
      console.log(req.user)
    }
  } catch (err) {
    console.log('error', err)
  }
    console.log('The users cookie was destroyed')
    res.cookie('authorizarion', 'false', { httpOnly: true }) //  expires: new Date(0)
    res.redirect('/api/posts')  // use /posts to check status
})

module.exports = router
