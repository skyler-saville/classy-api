const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

module.exports = function (req, res, next){
  const auth_cookie = req.cookies['authorizarion']
  if (auth_cookie) { console.log('Verify Token line:12 ---> auth_cookie', auth_cookie) }
  // check for logged in user
  if (auth_cookie == 'false') {
    console.log('Access Denied. No Cookie Found in Verify Token')
    return res.status(401).send({
      authorization: auth_cookie,
      reason: 'Logged Out',
      message: 'Please log in again, before you continue.'
    })
  }
  console.log('No auth_cookie found')
  // const token = req.header('auth-token')
  // if (!token) return res.status(401).send('Access Denied')

  try {
    const verified = jwt.verify(auth_cookie, process.env.TOKEN_SECRET)
    req.user = verified; // this is the decoded token value
    req.user.auth_cookie = auth_cookie
  } catch(err) {
    res.status(400).send(err)
  }
  next()
}