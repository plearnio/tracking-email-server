const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')

const UserLog = require('../models/UserLog')
const EmailLog = require('../models/EmailLog')
const Flow = require('../models/Flow')

const tracking = express.Router()
tracking.use(cookieParser())

const setCookies = (cookie, res) => {
  const userId = '5938f00a762ddb3642ac7399'
  res.cookie('userIdJitta', userId, { maxAge: 900000, httpOnly: true })
  res.send()
  console.log(`cookie created successfully, ${userId}`)
  return userId
}

class TrackData {
  constructor(reqUrl) {
    this.userLog = {
      userId: reqUrl.cookies.userIdJitta,
      flow: reqUrl.params.flow || '',
      action: reqUrl.params.activity || '',
      timestamp: new Date()
    }
  }
}

tracking.use((req, res, next) => {
  const cookieUserIdJitta = req.cookies.userIdJitta;
  console.log(req.cookies)
  if (!cookieUserIdJitta) {
    req.cookies.userIdJitta = setCookies(cookieUserIdJitta, res)
  }
  // res.cookie('userIdJitta', 'test', { maxAge: 900000, httpOnly: true })
  next()
})

tracking.route('/:activity/:flow')
  .get((req) => {
    console.log(req)
    trackActivity(req)
  })

const trackActivity = (reqUrl) => {
  const trackData = new TrackData(reqUrl)
  findFlow(trackData)
}

const findFlow = (trackData) => {
  Flow.findOne({ name: trackData.userLog.flow }).lean().exec()
    .then((docs) => {
      if (docs) {
        trackData.flowData = {
          allProcess: docs.actionsLen,
          flowId: docs._id,
          successAction: docs.successAction
        }
      }
      saveLog(trackData)
    })
    .catch((err) => {
      console.log(err)
    })
}

const saveLog = (trackData) => {
  console.log(trackData)
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

const findAction = (trackData) => {
  const userIdFromLog = trackData.userLog.userId
  UserLog.find({ userId: userIdFromLog }).distinct('action', (err, docs) => {
    if (err) console.log(err)
    else {
      trackData.activeProcess = docs.length
      trackData.percentSuccess = (trackData.activeProcess / trackData.flowData.allProcess) * 100
      findEmailLog(trackData)
    }
  })
}

const findEmailLog = (trackData) => {
  console.log(`percent : ${trackData.percentSuccess}%`)
  EmailLog.find({ toUser: trackData.userLog.userId }, (err, docs) => {
    docs.forEach((entry, index) => {
      // check expected flow in Emaillog and compare with flowid from Flow
      if (JSON.stringify(entry.expectedFlow.flow) === JSON.stringify(trackData.flowData.flowId)) {
        const userAction = trackData.userLog.action
        const flowsuccessAction = trackData.flowData.successAction.name
        const expectedSuccess = entry.expectedFlow.success
        const percentAllSuccess = trackData.percentSuccess
        if (userAction === flowsuccessAction) {
          docs[index].expectedFlow.success = 100.0
        } else if (expectedSuccess < percentAllSuccess) {
          // Compare succes before add action and after add action
          docs[index].expectedFlow.success = trackData.percentSuccess
          saveEmailLog(docs[index])
        }
      }
    })
  })
}

const saveEmailLog = (emailLog) => {
  emailLog.save((err) => {
    if (err) console.log(err)
    console.log('Update email log')
  })
}

module.exports = tracking
