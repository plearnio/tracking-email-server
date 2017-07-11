import {
    makeExecutableSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers';

const typeDefs = `
type Message {
  id: ID!
  text: String
}

type UserLogs {
  _id: ID!
  userId: String
  action: String
  timestamp: String
}

type Success {
  _id: String
  count: Int
}

type Statistic {
  total: Int
  successAvg: Float
}

type EmailConfigs {
  _id: ID!
  name: String
  description: String
  expectedFlow: [String]
  statistic: Statistic
  allSuccess: [Success]
}

type Counter {
  click: Int
  open: Int
}

type Actions {
  name: String
}

type FlowConfigs {
  _id: ID!
  name: String
  description: String
  actions: [Actions]
  url: String
  actionsLen: Int
  successAction: Actions
  statistic: Statistic
  allSuccess: [Success]
}

type AllStat {
  count: Int,
  successAvg: Float,
  clickAvg : Float,
  openAvg : Float
}

type UserLists {
  _id: ID!
  name: String
  userEmail: String
  age: Int
  pageNow: Int
  pageAll: Int
  logs: [UserLogs]
  emailConfigListStat: [EmailConfigListStat]
  allStat: AllStat
}

type EmailConfigListStat {
  _id: ID!
  mailConfig: [EmailConfigs]
  clickAvg: Float
  openAvg: Float
  success: Float
  count: Int 
}

type EmailLogs {
  _id: ID!
  toUser: String!
  mailConfig: EmailConfigs
  counter: Counter
  success: Float
}


input MessageInput{
  channelId: ID!
  text: String
}

# This type specifies the entry points into our API
type Query {
  emailConfigs: [EmailConfigs]
  emailConfigById(id: ID!): EmailConfigs
  flowConfigs: [FlowConfigs]
  flowConfigById(id: ID!): FlowConfigs
  emailLogs: [EmailLogs]
  emailLogById(id: ID!): EmailLogs
  userLists: [UserLists]
  userListById(id: ID!, pageValue: Int): UserLists
}
`

export const schema = makeExecutableSchema({ typeDefs, resolvers })

