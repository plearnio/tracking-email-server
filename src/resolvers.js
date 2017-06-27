
import { EmailConfigs, FlowConfigs, EmailLogs, UserLists, UserLogs } from './connectors'

const channels = [{
  id: '1',
  name: 'soccer',
  messages: [{
    id: '1',
    text: 'soccer is football',
  }, {
    id: '2',
    text: 'hello soccer world cup',
  }]
}, {
  id: '2',
  name: 'baseball',
  messages: [{
    id: '3',
    text: 'baseball is life',
  }, {
    id: '4',
    text: 'hello baseball world series',
  }]
}]

const filterItems = (arr, query) => {
  const result = arr.filter((el) => {
    if (el.name.toLowerCase().indexOf(query.toLowerCase()) > -1) return el
    return false
  })
  return result
}

export const resolvers = {
  Query: {
    channels: () => channels,
    channelById: (root, { id }) => {
      return channels.find(channel => channel.id === id)
    },
    channelname: (root, { name }) => {
      return filterItems(channels, name)
    },
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
        .then((userLists) => {
          // console.log(userLists)
          return userLists
        })
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
                console.log(userList)
                return userList
              })
          })
        })
      return result
    },
    emailLogById: (root, { id }) => {
      console.log('test')
      const result = EmailLogs.findById({ _id: id }).lean().exec()
        .then((emailLog) => {
          console.log(emailLog)
          return EmailConfigs.findById({ _id: emailLog.mailConfig }).lean().exec()
            .then((mailConfig) => {
              emailLog.mailConfig = mailConfig
              console.log(emailLog)
              return emailLog
            })
        })
        .then((emailLog) => {
          console.log(emailLog)
          return FlowConfigs.findById({ _id: emailLog.expectedFlow.flow }).lean().exec()
            .then((flow) => {
              emailLog.expectedFlow.flow = flow
              console.log(emailLog)
              return emailLog
            })
        })
      return result
    },
    emailConfigById: (root, { id }) => {
      const result = EmailConfigs.findById({ _id: id }).lean().exec()
        .then((mailConfig) => {
          console.log(mailConfig)
          return mailConfig
        })
      return result
    },
    flowConfigById: (root, { id }) => {
      const result = FlowConfigs.findById({ _id: id }).lean().exec()
        .then((FlowConfig) => {
          console.log(FlowConfig)
          return FlowConfig
        })
      return result
    }
  },
  Mutation: {
    addChannel: (root, args) => {
      const newChannel = { id: String(nextId += 1), messages: [], name: args.name }
      channels.push(newChannel)
      return newChannel
    },
    addMessage: (root, { message }) => {
      const channel = channels.find(el => el.id === message.el)
      if (!channel) throw new Error('Channel does not exist')
      const newMessage = { id: String(nextMessageId += 1), text: message.text }
      channel.messages.push(newMessage)
      return newMessage
    },
    searchChannel: (root, args) => {
      const newChannels = filterItems(channels, args.name)
      if (!newChannels) throw new Error('Channels does not exist')
      return newChannels
    }
  },
}
