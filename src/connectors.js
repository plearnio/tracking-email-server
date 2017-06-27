import Mongoose from 'mongoose'
import bluebird from 'bluebird'

import EmailConfigs from './models/EmailConfig'
import FlowConfigs from './models/Flow'
import EmailLogs from './models/EmailLog'
import UserLists from './models/User'
import UserLogs from './models/UserLog'

import { mongo } from '../config'

Mongoose.Promise = bluebird

Mongoose.connect(`mongodb://${mongo.host}:${mongo.port}/${mongo.database}`)

module.exports = { EmailConfigs, FlowConfigs, EmailLogs, UserLists, UserLogs }
