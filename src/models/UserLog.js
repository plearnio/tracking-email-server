import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'

mongoose.Promise = require('bluebird')


const Schema = mongoose.Schema

const userLogScheme = new Schema({
  userId: Schema.Types.ObjectId,
  action: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  flow: Schema.Types.ObjectId,
})

userLogScheme.plugin(mongoosePaginate)

const UserLog = mongoose.model('UserLog', userLogScheme)

module.exports = UserLog
