const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const Schema = mongoose.Schema

const userLogScheme = new Schema({
  userId: Schema.Types.ObjectId,
  action: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const UserLog = mongoose.model('UserLog', userLogScheme)

module.exports = UserLog
