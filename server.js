
import express from 'express'
import {
  graphqlExpress,
  graphiqlExpress,
} from 'graphql-server-express'
import bodyParser from 'body-parser'
import cors from 'cors'

import { schema } from './src/schema'

import tracking from './src/route/tracking'

const PORT = 4000
const server = express()

server.use('*', cors({ origin: 'http://localhost:3000' }))

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use('/graphql', bodyParser.json(), graphqlExpress({
  schema
}))

server.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql'
}))

server.use('/tracking', tracking)

server.listen(PORT, () =>
  console.log(`Server is now running on http://localhost:${PORT}`)
)
