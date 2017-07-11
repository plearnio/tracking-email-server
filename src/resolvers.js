import mongoose from 'mongoose'
import { EmailConfigs, FlowConfigs, EmailLogs, UserLists, UserLogs } from './connectors'

const filterItems = (arr, query) => {
  const result = arr.filter((el) => {
    if (el.name.toLowerCase().indexOf(query.toLowerCase()) > -1) return el
    return false
  })
  return result
}

export const resolvers = {
  Query: {
    emailConfigs: () => {
      const result = EmailConfigs.find({}, emailConfig => emailConfig)
      return result
    },
    flowConfigs: () => {
      const result = FlowConfigs.find({}, flowconfig => flowconfig)
      return result
    },
    emailLogs: () => {
      const result = EmailLogs.find({}).lean().exec()
        .then(emailLogs => emailLogs)
      return result
    },
    userLists: () => {
      const result = UserLists.find({}).lean().exec()
        .then(userLists => userLists)
      return result
    },
    userListById: (root, { id, pageValue }) => {
      const result = UserLists.findById({ _id: id }).lean().exec()
        .then((userList) => {
          return UserLogs.paginate(
            { userId: userList._id }, {
              page: pageValue,
              limit: 5,
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
        })
        .then((userList) => {
          return EmailLogs.aggregate([
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
          })
        })
        .then((userList) => {
          return EmailLogs.aggregate([
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
          })
        })
      return result
    },
    emailLogById: (root, { id }) => {
      const result = EmailLogs.findById({ _id: id }).lean().exec()
        .then((emailLog) => {
          return EmailConfigs.findById({ _id: emailLog.mailConfig }).lean().exec()
            .then((mailConfig) => {
              emailLog.mailConfig = mailConfig
              return emailLog
            })
        })
      return result
    },
    emailConfigById: (root, { id }) => {
      const result = EmailConfigs.findById({ _id: id }).lean().exec()
        .then((mailConfig) => {
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
          ]).then((statData) => {
            return statData[0]
          })
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
        })
      return result
    },
    flowConfigById: (root, { id }) => {
      const result = FlowConfigs.findById({ _id: id }).lean().exec()
        .then((FlowConfig) => {
          return EmailConfigs.find({ expectedFlow: { $in: [mongoose.Types.ObjectId(id)] } }).lean().exec()
            .then((emailConfig) => {
              FlowConfig.statistic = EmailLogs.aggregate([
                {
                  $group: {
                    _id: '$mailConfig',
                    total: { $sum: 1 },
                    successAvg: { $avg: '$success' }
                  }
                },
                {
                  $match: {
                    _id: mongoose.Types.ObjectId(emailConfig[0]._id)
                  }
                }
              ]).then((statData) => {
                return statData[0]
              })
              FlowConfig.allSuccess = EmailLogs.aggregate([
                {
                  $match:
                  {
                    mailConfig: mongoose.Types.ObjectId(emailConfig[0]._id)
                  }
                }, {
                  $group: {
                    _id: '$success',
                    count: { $sum: 1 }
                  }
                }
              ]).then((successData) => {
                return successData
              })
              return FlowConfig
            })
        })
      return result
    }
  }
}
