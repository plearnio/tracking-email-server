const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

const UserLog = require('../models/UserLog')
const EmailLog = require('../models/EmailLog')
const Flow = require('../models/Flow')

const tracking = express.Router()
tracking.use(cookieParser())

class TrackData {
  constructor(reqUrl) {
    this.userLog = {
      userId: reqUrl.body.user || '',
      flow: reqUrl.body.flowName || '',
      action: reqUrl.body.actionName || '',
      timestamp: new Date()
    }
  }
}

tracking.use((req, res, next) => {
  if (req.body.secretToken !== 'secret@123') res.status(500).send('Invalid secret token !')
  else {
    next()
  }
})

const saveEmailLog = (emailLog) => {
  EmailLog.findOneAndUpdate({ _id: emailLog._id }, { success: emailLog.success }, (err) => {
    if (err) console.log(err)
    console.log('Update email log')
  })
}

const findEmailLog = (trackData) => {
  console.log(`percent : ${trackData.percentSuccess}%`)
  EmailLog.aggregate([
    {
      $match: { toUser: mongoose.Types.ObjectId(trackData.userLog.userId) }
    }, {
      $lookup:
      {
        from: 'emailconfigs',
        localField: 'mailConfig',
        foreignField: '_id',
        as: 'mailConfig'
      }
    }
  ], (err, docs) => {
    docs.forEach((entry, index) => {
      entry.mailConfig[0].expectedFlow.forEach((expectedFlow) => {
        if (JSON.stringify(expectedFlow) === JSON.stringify(trackData.flowData._id)) {
          const userAction = trackData.userLog.action
          const flowsuccessAction = trackData.flowData.successAction.name
          const expectedSuccess = entry.success
          const percentAllSuccess = trackData.percentSuccess
          if (userAction === flowsuccessAction) {
            docs[index].success = 100.0
            saveEmailLog(docs[index])
          } else if (expectedSuccess < percentAllSuccess) {
            docs[index].success = trackData.percentSuccess
            saveEmailLog(docs[index])
          }
        }
      })
    })
  })
}

const findAction = (trackData) => {
  const userIdFromLog = trackData.userLog.userId
  const flowFromLog = mongoose.Types.ObjectId(trackData.flowData._id)
  UserLog.find({ userId: userIdFromLog, flow: flowFromLog }).distinct('action', (err, docs) => {
    if (err) console.log(err)
    else {
      trackData.activeProcess = docs.length
      trackData.percentSuccess = (trackData.activeProcess / trackData.flowData.actionsLen) * 100
      findEmailLog(trackData)
    }
  })
}

const saveLog = (trackData) => {
  if (trackData.flowData) {
    const meta = UserLog(trackData.userLog)
    meta.save().then(() => {
      console.log(`add log user : ${trackData.userLog.userId} -> ${trackData.userLog.action}`)
      findAction(trackData)
    }).catch((err) => {
      if (err) console.log(err)
    })
  }
}

const findFlow = (reqUrl) => {
  const trackData = new TrackData(reqUrl)
  Flow.find({
    name: { $regex: new RegExp(`^${trackData.userLog.flow.toLowerCase()}`, 'i') },
    actions: { $elemMatch: { name: { $regex: new RegExp(`^${trackData.userLog.action.toLowerCase()}`, 'i') } } }
  }).lean().exec()
    .then((docs) => {
      if (docs[0]) {
        const flowData = docs[0]
        trackData.userLog.flow = flowData._id.toString()
        trackData.flowData = flowData
        console.log(trackData.flowData)
        saveLog(trackData)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

tracking.route('/')
  .post((req) => {
    findFlow(req)
  })

module.exports = tracking
