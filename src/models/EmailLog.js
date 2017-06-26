const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const Schema = mongoose.Schema

const emailLogScheme = new Schema({
  toUser: Schema.Types.ObjectId,
  mailType: Schema.Types.ObjectId,
  counter: {
    click: Number,
    open: Number,
  },
  expectedFlow: {
    flow: Schema.Types.ObjectId,
    success: Number
  }
})

const EmailLog = mongoose.model('EmailLog', emailLogScheme)

module.exports = EmailLog
