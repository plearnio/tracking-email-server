
const express = require('express')
const {
  graphqlExpress,
  graphiqlExpress,
} = require('graphql-server-express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { schema } = require('./src/schema')

const { tracking } = require('./src/route/tracking')
const sendMail = require('./src/route/sendMail')
const Query = require('./src/methods/Query')

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
// server.use('/login', login)
server.use('/sendmail', sendMail)

server.listen(PORT, () =>
  console.log(`Server is now running on http://localhost:${PORT}`)
)

module.exports = server