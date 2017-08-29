const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const Schema = mongoose.Schema

const emailConfigScheme = new Schema({
  name: String,
  description: String,
  expectedFlow: Schema.Types.ObjectId,
})

const EmailConfig = mongoose.model('EmailConfig', emailConfigScheme)

module.exports = EmailConfig
