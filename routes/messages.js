const router = require('express').Router()
const nodemailer = require('nodemailer')
const verify = require('../middleware/verifyToken')
const emailConfig = require('../email.config')

router.get('/test', verify, (req, res) => {
  const request = req.user 
  if (!request) res.status(400).json({'error': 'no user sent with request'})

  const text_message = req.header('text_message')
  console.log("text_message value ", text_message)
  if (!text_message) {
    test(request, "There was no message header").catch(console.error);
  } else {
    test(request, text_message).catch(console.error);
  }
  res.send(request.user)
})


// async..await is not allowed in global scope, must use a wrapper
async function test(request, text_message) {
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: emailConfig.auth
  });
  let info = await transporter.sendMail({
      from: '"Bit-n-Blade" <dev@bitnblade.com>', 
      // to: request.user.phone.carrier_gateway, // list of receivers
      to: '4353593742@vtext.com',
      subject: 'GET api/messages/test', // Subject line
      text: text_message // plain text body
  });
  console.log('Message sent: %s', info.messageId);
}

module.exports = router