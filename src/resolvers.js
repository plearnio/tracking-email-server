
import { EmailConfigs, FlowConfigs, EmailLogs } from './connectors'

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
    channels: () => {
      return channels
    },
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
