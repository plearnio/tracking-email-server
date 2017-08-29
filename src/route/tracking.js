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

const updateEmailLog = (emailLog, userId) => {
  // this method will update the emaillog to new success in percentage

  const emailLogId = emailLog._id[0]._id
  const emailLogSuccess = emailLog.success

  // this update will affect all emaillog that contain emailconfig that we expected
  return EmailLog.update({ mailConfig: emailLogId, toUser: userId },
  { success: emailLogSuccess },
  { multi: true })
  .then((err) => {
    if (err) {
      console.log(err)
    }
    // console.log('Update email log')
    return true
  })
}

const findEmailLog = (trackData) => {
  // console.log(`percent : ${trackData.percentSuccess}%`)
  // use new promise because mongoose.aggregate not support promise

  return new Promise((resolve) => {

    // find all emaillog that user get and group by type of mailConfig with sucess
    // in basic process, each emaillog will has similar success in percentage.
    // But for ensure this method will use avg,
    // morever this method join emaillog data from emaillogs collection

    EmailLog.aggregate([
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
      // data from aggregate will be array
      // each sub data will be a emaillog and each emaillog will contains expected flow
      // so we need to check flow from log that matched with the expected flow
      docs.forEach((entry, index) => {
        entry._id[0].expectedFlow.forEach((expectedFlow) => {
          if (JSON.stringify(expectedFlow) === JSON.stringify(trackData.flowData._id)) {
            const userAction = trackData.userLog.action
            const flowsuccessAction = trackData.flowData.successAction.name
            const expectedSuccess = entry.success
            const percentAllSuccess = trackData.percentSuccess
            if (userAction === flowsuccessAction) {
              // the first case if the action is the successful's action
              // the percentage that will update is 100,
              // then pass emaillog that want to update to updateEmailLog()
              docs[index].success = 100.0
              resolve(updateEmailLog(docs[index], trackData.userLog.userId))
            } else if (expectedSuccess < percentAllSuccess) {
              // the second if the old success in percentage lower than new success
              // it will use new success, then pass emaillog that want to update to updateEmailLog()
              docs[index].success = trackData.percentSuccess
              resolve(updateEmailLog(docs[index], trackData.userLog.userId))
            } else {
              // another case return false
              resolve(false)
            }
          }
        })
      })
    })
  })
}

const findUserAction = (trackData) => {
// this method will find user's actions in database

  const userIdFromLog = trackData.userLog.userId
  const flowFromLog = mongoose.Types.ObjectId(trackData.flowData._id)

  // use new promise because a distinct modthod in mongoose support only callback

  return new Promise((resolve) => {
    UserLog.find({ userId: userIdFromLog, flow: flowFromLog }).distinct('action', (err, docs) => {
      if (err) {
        resolve(false)
      }
      if (docs.length === 0) {
        resolve(false)
      }

      // get all user's active actions and calculate active successful in percantage
      const activeActions = docs.length
      const allActions = trackData.flowData.actionsLen
      trackData.percentSuccess = (activeActions / allActions) * 100
      return findEmailLog(trackData).then((result) => {
        resolve(result)
      })
    })
  })
}

const saveLog = (trackData) => {
// this method will find user in database.
// if founded, user's log in trackData will be added to userlog collections.
// After add log success, data will passed to findUserAction() for start calculate.

  return User.findById({ _id: trackData.userLog.userId }).then((user) => {
    if (user) {
      const meta = UserLog(trackData.userLog)
      return meta.save()
        .then(() => findUserAction(trackData))
        .catch(err => err)
    }
    return false
  })
}

const findFlow = (reqUrl) => {
  // this method will create trackData that contains userdata action and flow data ,

  const trackData = new TrackData(reqUrl)
  const flowInLowercase = new RegExp(`^${trackData.userLog.flow.toLowerCase()}`, 'i')

  // find flow with action in the database.
  // If founded, add flow's data to trackData and pass to saveLog()

  return Flow.find({
    name: { $regex: flowInLowercase },
    actions: { $elemMatch: { name: { $regex: new RegExp(`^${trackData.userLog.action.toLowerCase()}`, 'i') } } }
  }).lean().exec()
    .then((docs) => {
      if (docs[0]) {
        const flowData = docs[0]
        if (!flowData) return false
        trackData.userLog.flow = flowData._id.toString()
        trackData.flowData = flowData
        return saveLog(trackData)
      }
      return false
    })
    .catch((err) => {
      console.log(err)
      return err
    })
}

tracking.route('/')

// START HERE
// main of tracking route
// this route will get post request from client and pass to findFlow()

  .post((req, res) => {
    findFlow(req).then((result) => {
      // result will be a promise data (err, true ,false)

      if (result) res.send('update success')
      else res.send('nothing change')
    }).catch((err) => {
      console.log('get error')
      console.log(err)
    })
  })

tracking.route('/mail/:mailId/:redirectUrl/')

// track clicking mail
// track user when they click link that we expected by cover link with
// this route and save status to database, then redirect user to real path

  .get((req, res) => {
    const { mailId, redirectUrl } = req.params
    EmailLog.findByIdAndUpdate(mongoose.Types.ObjectId(mailId), { $inc: { 'counter.click': 1 } })
    .then(() => {
      console.log('http://localhost:3000/demo/register')
      res.redirect(302, redirectUrl)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
  })


tracking.route('/pic/:mailId')

  // track opening mail
  // track user when they open expected mail by check hidden picture in mail
  // , the picture will request to this route and resolve request to
  // 1px picture and update user's opening status

  .get((req, res) => {
    res.sendFile(path.resolve('public/images/1px.JPG'))
    const { mailId } = req.params
    EmailLog.findByIdAndUpdate(mongoose.Types.ObjectId(mailId), { $inc: { 'counter.open': 1 } })
    .then(() => {
      res.sendFile(path.resolve('public/images/1px.JPG'))
    })
  })

module.exports = {
  tracking,
  findFlow,
  saveLog,
  findUserAction,
  findEmailLog,
  updateEmailLog
}
