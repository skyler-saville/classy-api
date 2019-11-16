const router = require('express').Router()
const nodemailer = require('nodemailer')
const verify = require('./verifyToken')

router.get('/test', verify, (req, res) => {
  const request = req.user 
  if (!request) res.status(400).json({'error': 'no user sent with request'})

  const text_message = req.header('text_message')
  console.log("text_message value ", text_message)
  if (!text_message) {
    main(request, "There was no message header").catch(console.error);
  } else {
    main(request, text_message).catch(console.error);
  }
  res.send(request.user)
})


// async..await is not allowed in global scope, must use a wrapper
async function main(request, text_message) {
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.TRANSPORT_ACCOUNT, 
          pass: process.env.TRANSPORT_PASS 
      }
  });
  let info = await transporter.sendMail({
      from: '"Bit-n-Blade" <dev@bitnblade.com>', 
      to: request.user.phone.carrier_gateway, // list of receivers
      subject: 'GET api/messages/test', // Subject line
      text: text_message // plain text body
  });
  console.log('Message sent: %s', info.messageId);
}


module.exports = router