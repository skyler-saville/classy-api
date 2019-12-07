
const jwt = require('jsonwebtoken')

const cookie_check = async function (req, res, next){
  try {
    const auth_cookie = req.cookies['authorizarion']
    if (auth_cookie) { console.log('CookieCheck line:7 ----> auth_cookie', auth_cookie) }
    if (!auth_cookie) return res.status(401).send('Access Denied. No Cookie Found in cookieCheck')
    const decoded = jwt.decode(auth_cookie);
    if (decoded) { 
      console.log('decoded value=',decoded.payload) 
    } else {
      console.log('unable to decode cookie')
    } 
  } catch (err) {
    console.log(err)
  }
  next()
}

module.exports = cookie_check