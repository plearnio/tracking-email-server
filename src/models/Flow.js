const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const Schema = mongoose.Schema

const flowScheme = new Schema({
  name: String,
  actions: [{
    name: String,
  }],
  url: String,
  actionslen: Number,
  successAction: String,
  description: String,
})

const Flow = mongoose.model('Flow', flowScheme)

module.exports = Flow
