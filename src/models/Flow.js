const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')

const Schema = mongoose.Schema

const flowScheme = new Schema({
  name: { type: String, text: true },
  actions: [{
    name: String,
  }],
  url: String,
  actionslen: Number,
  successAction: String,
  description: { type: String, text: true },
})
flowScheme.index({ name: 'text', description: 'text' })

const Flow = mongoose.model('Flow', flowScheme)

module.exports = Flow
