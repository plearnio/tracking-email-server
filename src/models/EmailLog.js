const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const Schema = mongoose.Schema

const emailLogScheme = new Schema({
  toUser: Schema.Types.ObjectId,
  mailConfig: Schema.Types.ObjectId,
  counter: {
    click: Number,
    open: Number,
  },
  success: Number,
})
emailLogScheme.index({ toUser : 'text' })

const EmailLog = mongoose.model('EmailLog', emailLogScheme)

module.exports = EmailLog
