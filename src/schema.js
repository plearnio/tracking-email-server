import {
  makeExecutableSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers';

const typeDefs = `
type Channel {
  id: ID!                # "!" denotes a required field
  name: String
  messages: [Message]!
}

type Message {
  id: ID!
  text: String
}

type EmailConfigs {
  _id: ID!
  name: String
  description: String
}

type Counter {
  click: Int
  open: Int
}

type FlowConfigs {
  _id: ID!
  name: String
  description: String
  actions: [Actions]
  url: String
  actionsLen: Int
  successAction: Actions
}

type ExpectedFlow {
  flow: FlowConfigs
  success: Float
}

type EmailLogs {
  _id: ID!
  toUser: String!
  mailConfig: EmailConfigs
  counter: Counter
  expectedFlow: [ExpectedFlow]
}

type Actions {
  name: String
}

input MessageInput{
  channelId: ID!
  text: String
}

# This type specifies the entry points into our API
type Query {
  channels: [Channel]    # "[]" means this is a list of channels
  channelById(id: ID!): Channel
  channelname(name: String!): [Channel]
  emailConfigs: [EmailConfigs]
  flowConfigs: [FlowConfigs]
  flowConfigById(id: ID!): FlowConfigs
  emailLogs: [EmailLogs]
  emailLogById(id: ID!): EmailLogs
  emailConfigById(id: ID!): EmailConfigs
}

# The mutation root type, used to define all mutations
type Mutation {
  addChannel(name: String!): Channel
  addMessage(message: MessageInput!): Message
  searchChannel(name: String!): [Channel]
}
`

export const schema = makeExecutableSchema({ typeDefs, resolvers })
