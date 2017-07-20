const Mongoose = require('mongoose')
const bluebird = require('bluebird')

const EmailConfigs = require('./models/EmailConfig')
const FlowConfigs = require('./models/Flow')
const EmailLogs = require('./models/EmailLog')
const UserLists = require('./models/User')
const UserLogs = require('./models/UserLog')

const { mongo } = require('../config')

Mongoose.Promise = bluebird

Mongoose.connect(`mongodb://${mongo.host}:${mongo.port}/${mongo.database}`)

module.exports = { EmailConfigs, FlowConfigs, EmailLogs, UserLists, UserLogs }
