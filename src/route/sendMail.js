import EmailLogs from '../models/EmailLog'

const express = require('express')
const nodemailer = require('nodemailer')

const tracking = express.Router()

tracking.use((req, res, next) => {
  console.log(req.body)
  next()
})

tracking.route('/')
  .post((req, res) => {
    const { data: { name, userEmail, _id }, fromPassword, fromMail, emailConfig } = req.body
    console.log(emailConfig)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: fromMail,
        pass: fromPassword
      },
      debug: true
    }, {
      from: `${emailConfig.name} Demo <${fromMail}>`
    })
    console.log('SMTP Configured')
    const message = {
      to: `${name} <${userEmail}>`,
      subject: `Check ${emailConfig.name} Mail Demo ✔`, //
      html: `<center style="padding: 20px; border: 2px dashed #ddd"><h1 style="color:#b1a6ef">${emailConfig.name}</h1><a class="call-to-action" href="http://localhost:3000/demo/${emailConfig.name}">click</a></center>`,
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
      const newEmailLogs = EmailLogs({
        toUser: _id,
        mailConfig: emailConfig._id,
        counter: {
          click: 0,
          open: 0
        },
        success: 0
      })
      newEmailLogs.save().then(() => {
        console.log('Add log to database !');
        res.send('correct !')
      }).catch((err) => {
        console.log(err)
      })
      transporter.close();
    });
  })

module.exports = tracking
