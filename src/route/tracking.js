const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const path = require('path')

const UserLog = require('../models/UserLog')
const EmailLog = require('../models/EmailLog')
const Flow = require('../models/Flow')
const User = require('../models/User')

const tracking = express.Router()
tracking.use(cookieParser())
tracking.use(express.static(path.join(__dirname, '../../public')))

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
  next()
})

const updateEmailLog = (emailLog) => {
  const emailLogId = emailLog._id[0]._id
  const emailLogSuccess = emailLog.success
  return EmailLog.update({ mailConfig: emailLogId },
  { success: emailLogSuccess },
  { multi: true })
  .then((err) => {
    if (err) console.log(err)
    // console.log('Update email log')
    return true
  })
}

const findEmailLog = async (trackData) => {
  // console.log(`percent : ${trackData.percentSuccess}%`)
  let result = false
  await EmailLog.aggregate([
    {
      $match: { toUser: mongoose.Types.ObjectId(trackData.userLog.userId) }
    }, {
      $group:
      {
        _id: '$mailConfig',
        success: { $avg: '$success' },
      }
    }, {
      $lookup:
      {
        from: 'emailconfigs',
        localField: '_id',
        foreignField: '_id',
        as: '_id'
      }
    }
  ]).exec((err, docs) => {
    docs.some((entry, index) => {
      entry._id[0].expectedFlow.some((expectedFlow) => {
        if (JSON.stringify(expectedFlow) === JSON.stringify(trackData.flowData._id)) {
          const userAction = trackData.userLog.action
          const flowsuccessAction = trackData.flowData.successAction.name
          const expectedSuccess = entry.success
          const percentAllSuccess = trackData.percentSuccess
          if (userAction === flowsuccessAction) {
            docs[index].success = 100.0
            result = true
            updateEmailLog(docs[index])
          } else if (expectedSuccess < percentAllSuccess) {
            docs[index].success = trackData.percentSuccess
            result = true
            updateEmailLog(docs[index])
          }
        }
      })
    })
  })
  return result
}

const findAction = async (trackData) => {
  const userIdFromLog = trackData.userLog.userId
  const flowFromLog = mongoose.Types.ObjectId(trackData.flowData._id)
  await UserLog.find({ userId: userIdFromLog, flow: flowFromLog }).distinct('action', (err, docs) => {
    if (err) {
      console.log(err)
      return false
    }
    if (docs.length === 0) return false
    trackData.activeProcess = docs.length
    trackData.percentSuccess = (trackData.activeProcess / trackData.flowData.actionsLen) * 100
  })
  return findEmailLog(trackData).then((result) => {
    return result
  })
}

const saveLog = (trackData) => {
  if (trackData.flowData) {
    return User.findById({ _id: trackData.userLog.userId }).then((user) => {
      if (user) {
        const meta = UserLog(trackData.userLog)
        return meta.save()
          .then(() => {
            // console.log(`add log user : ${trackData.userLog.userId} -> ${trackData.userLog.action}`)
            return findAction(trackData)
          })
          .catch((err) => {
            if (err) console.log(err)
            return false
          })
      }
      return false
    })
  }
  return false
}

const findFlow = (reqUrl) => {
  const trackData = new TrackData(reqUrl)
  return Flow.find({
    name: { $regex: new RegExp(`^${trackData.userLog.flow.toLowerCase()}`, 'i') },
    actions: { $elemMatch: { name: { $regex: new RegExp(`^${trackData.userLog.action.toLowerCase()}`, 'i') } } }
  }).lean().exec()
    .then((docs) => {
      if (docs[0]) {
        const flowData = docs[0]
        trackData.userLog.flow = flowData._id.toString()
        trackData.flowData = flowData
        return saveLog(trackData)
      }
      return false
    })
    .catch((err) => {
      console.log(err)
      return false
    })
}

tracking.route('/')
  .post((req, res) => {
    findFlow(req).then((result) => {
      if (result) res.send('update success')
      else res.send('nothing change')
    })
  })

tracking.route('/mail/:mailId/:flow/')
  .get((req, res) => {
    const { mailId, flow } = req.params
    EmailLog.findByIdAndUpdate(mongoose.Types.ObjectId(mailId), { $inc: { 'counter.click': 1 } })
    .then(() => {
      res.redirect(401, flow)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
  })

tracking.route('/pic/:mailId')
  .get((req, res) => {
    res.sendFile(path.resolve('public/images/1px.JPG'))
  })

module.exports = {
  tracking,
  findFlow,
  saveLog,
  findAction,
  findEmailLog,
  updateEmailLog
}
