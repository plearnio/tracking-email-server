const express = require('express')
const nodemailer = require('nodemailer')

const tracking = express.Router()

tracking.use((req, res, next) => {
  console.log(req.body)
  if (req.body.secret !== 'jitta101') res.send('wrong secret code')
  else {
    next()
  }
})

tracking.route('/')
  .post((req, res) => {
    console.log(req.body)
    const { fromMail, fromPassword, toMail } = req.body
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: fromMail,
        pass: fromPassword
      },
      debug: true
    }, {
      from: `Register Test ! <${fromMail}>`
    })
    console.log('SMTP Configured')
    const message = {
      to: `Andris Reinman <${toMail}>`,
      subject: 'Check Register Mail Demo ✔', //
      html: '<center style="padding: 20px; border: 2px dashed #ddd"><h1 style="color:#b1a6ef">Register</h1><a href="http://localhost:3000/demo">click</a></center>',
    };
    console.log('Sending Mail');
    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log('Error occurred');
        console.log(error.message);
        res.send('somethind wrong !')
        return;
      }
      console.log('Message sent successfully!');
      console.log('Server responded with "%s"', info.response);
      res.send('correct !')
      transporter.close();
    });
  })

module.exports = tracking
