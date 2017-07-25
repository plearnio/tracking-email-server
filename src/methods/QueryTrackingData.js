const mongoose = require('mongoose')
const { EmailConfigs, FlowConfigs, EmailLogs, UserLists, UserLogs } = require('../connectors')

const QueryTrackingData = {
  // list all emailConfigs
  emailConfigs: () => EmailConfigs.find({}).lean().exec().then(emailConfig => emailConfig),
  // list all flows
  flowConfigs: () => FlowConfigs.find({}).lean().exec().then(flowconfig => flowconfig),
  // list all emaillogs
  emailLogs: () => EmailLogs.find({}).lean().exec().then(emailLogs => emailLogs),
  // list all users
  userLists: () => UserLists.find({}).lean().exec().then(userLists => userLists),
  // show user's data and statistic by id
  userListById: ({ id, pageValue, limit }) => {
    const limitData = limit || 5
    // pagination
    return UserLists.findById({ _id: id }).lean().exec()
      .then(userList => UserLogs.paginate(
          { userId: userList._id }, {
            page: pageValue,
            limit: limitData,
            sort: { timestamp: 1 }
          }
        ).then((userLogs) => {
          if (userLogs.page <= userLogs.pages) {
            userList.logs = userLogs.docs
            userList.pageNow = userLogs.page
            userList.pageAll = userLogs.pages
            return userList
          }
          return UserLogs.paginate(
              { userId: userList._id }, {
                page: 1,
                limit: 5,
                sort: { timestamp: 1 }
              }
            ).then((newUserLogs) => {
              userList.logs = newUserLogs.docs
              userList.pageNow = newUserLogs.page
              userList.pageAll = newUserLogs.pages
              return userList
            })
        })
      )
      // aggregate with emailconfigs and this user
      .then(userList => EmailLogs.aggregate([
        {
          $match: {
            toUser: mongoose.Types.ObjectId(id)
          }
        }, {
          $group: {
            _id: '$mailConfig',
            count: { $sum: 1 },
            success: { $avg: '$success' },
            clickAvg: { $avg: '$counter.click' },
            openAvg: { $avg: '$counter.click' }
          }
        }, {
          $lookup: {
            from: 'emailconfigs',
            localField: '_id',
            foreignField: '_id',
            as: 'mailConfig'
          }
        }
      ]).then((statData) => {
        userList.emailConfigListStat = statData
        return userList
      }))
      // aggregate with all emaillogs that matched this user
    .then(userList => EmailLogs.aggregate([
      {
        $match: {
          toUser: mongoose.Types.ObjectId(id)
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          successAvg: { $avg: '$success' },
          clickAvg: { $avg: '$counter.click' },
          openAvg: { $avg: '$counter.click' }
        }
      }
    ]).then((statData) => {
      userList.allStat = statData[0]
      return userList
    }))
  },
  // show emaillogs by id with emailconfigs data
  emailLogById: ({ id }) => EmailLogs.findById({ _id: id }).lean().exec()
      .then(emailLog => EmailConfigs.findById({
        _id: emailLog.mailConfig
      }).lean().exec()
          .then((mailConfig) => {
            emailLog.mailConfig = mailConfig
            return emailLog
          })
      ),
  // show emailconfig by id with statistic value
  emailConfigById: ({ id }) => EmailConfigs.findById({ _id: id }).lean().exec()
      .then((mailConfig) => {
        // success of each emailconfig
        mailConfig.statistic = EmailLogs.aggregate([
          {
            $group: {
              _id: '$mailConfig',
              total: { $sum: 1 },
              successAvg: { $avg: '$success' }
            }
          },
          {
            $match: {
              _id: mongoose.Types.ObjectId(id)
            }
          }
        ]).then(statData => statData[0])
        // success of all emailconfigs
        mailConfig.allSuccess = EmailLogs.aggregate([
          {
            $match:
            {
              mailConfig: mongoose.Types.ObjectId(id)
            }
          }, {
            $group: {
              _id: '$success',
              count: { $sum: 1 }
            }
          }
        ]).then(successData => successData)
        return mailConfig
      }),
  // show flow by id with statistic value
  flowConfigById: ({ id }) => FlowConfigs.findById({ _id: id }).lean().exec()
      .then(FlowConfig => EmailConfigs.find({
        expectedFlow: {
          $in: [mongoose.Types.ObjectId(id)]
        }
      }).lean().exec()
          .then(() => {
            // seperate expected flow in emailconfig and
            // calculate success per emailconfigs
            // that contains expected flow
            FlowConfig.statistic = EmailLogs.aggregate([
              {
                $lookup: {
                  from: 'emailconfigs',
                  localField: 'mailConfig',
                  foreignField: '_id',
                  as: 'mailConfig'
                }
              }, {
                $unwind: '$mailConfig'
              }, {
                $unwind: '$mailConfig.expectedFlow'
              }, {
                $group: {
                  _id: '$mailConfig.expectedFlow',
                  total: { $sum: 1 },
                  successAvg: { $avg: '$success' }
                }
              }
            ]).then(statData => statData[0])
            // count total by success value
            // ex { 50 : 1, 80 : 2 }
            console.log(id)
            FlowConfig.allSuccess = EmailLogs.aggregate([
              {
                $lookup: {
                  from: 'emailconfigs',
                  localField: 'mailConfig',
                  foreignField: '_id',
                  as: 'mailConfig'
                }
              }, {
                $unwind: '$mailConfig'
              }, {
                $unwind: '$mailConfig.expectedFlow'
              }, {
                $match: {
                  'mailConfig.expectedFlow': mongoose.Types.ObjectId(id)
                }
              }, {
                $group: {
                  _id: '$success',
                  count: { $sum: 1 }
                }
              }
            ]).then(successData => successData)
            return FlowConfig
          })
      )
}

module.exports = QueryTrackingData
