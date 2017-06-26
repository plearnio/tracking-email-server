const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const Schema = mongoose.Schema

const userScheme = new Schema({
  name: String,
  userEmail: String,
  age: Number
})

const User = mongoose.model('User', userScheme)

module.exports = User
