const EmailLogs = require('../models/EmailLog')

const express = require('express')
const nodemailer = require('nodemailer')
const cheerio = require('cheerio')

const tracking = express.Router()

tracking.use((req, res, next) => {
  // console.log(req.body)
  next()
})

tracking.route('/')
  .post((req, res) => {
    const { data: { name, userEmail, _id }, fromPassword, fromMail, emailConfig } = req.body
    console.log(req.body)
    const newEmailLogs = EmailLogs({
      toUser: _id,
      mailConfig: emailConfig._id,
      counter: {
        click: 0,
        open: 0
      },
      success: 0
    })
    newEmailLogs.save().then((data) => {
      // dummy html
      const html = `
        <html>
          <body>
          <center style="padding: 20px border: 2px dashed #ddd">
            <h1 style="color:#b1a6ef">${emailConfig.name}</h1>
            <a class="call-to-action" href="http://localhost:3000/demo/${emailConfig.name}">click</a>
          </center>
          </body>
        </html>
          `

      const $ = cheerio.load(html)
      $('a.call-to-action').each((i, elem) => {
        $(elem).attr('href', `http://localhost:4000/tracking/mail/${data._id}/${encodeURIComponent($(elem).attr('href'))}`)
      })
      const overrideHtml = $.html()
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

      const message = {
        to: `${name} <${userEmail}>`,
        subject: `Check ${emailConfig.name} Mail Demo ✔`,
        html: overrideHtml,
      }

      transporter.sendMail(message, (error, info) => {
        if (error) {
          res.send('something wrong !')
          return
        }
        transporter.close()
        res.send('correct !')
      })
    }).catch((err) => {
      console.log(err)
    })
  })

module.exports = tracking
