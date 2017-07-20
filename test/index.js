const server = require('../server')
const { findFlow } = require('../src/route/tracking')
const EmailConfigs = require('../src/models/EmailConfig')
const FlowConfigs = require('../src/models/Flow')
const EmailLogs = require('../src/models/EmailLog')
const UserLists = require('../src/models/User')
const UserLogs = require('../src/models/UserLog')

const password = new Buffer('QEJsYWNrZDBn', 'base64').toString('ascii')
const dummyMail = {
  fromPassword: password,
  fromMail: 'p.plearn.io@gmail.com',
  data:
  {
    _id: '5938f00a762ddb3642ac7399',
    name: 'Pruek',
    userEmail: 'p.plearn.io@gmail.com',
  },
  emailConfig:
  {
    _id: '5938f18e5d13e136df0e6936',
    name: 'register',
    description: 'Suggest user to register Jitta'
  }
}
let dummyLog = {}
const dummyBody = {
  body: {
    actionName: 'Enter register page',
    flowName: 'Register',
    user: '5938f00a762ddb3642ac7399'
  }
}

describe('Sending Email', () => {
  it('it should send mail success with correct data', (done) => {
    EmailLogs.remove({}).then(() => {
      chai.request(server)
        .post('/sendmail')
        .send(dummyMail)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.text.should.equal('correct !')
          EmailLogs.find({}).then((emailLog) => {
            console.log(emailLog)
            dummyLog = emailLog[0]
            done()
          })
        })
    })
  }).timeout(0)
  it('it should fail to send mail with incorrect data', (done) => {
    dummyMail.fromPassword = 'test'
    chai.request(server)
      .post('/sendmail')
      .send(dummyMail)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.text.should.not.equal('correct !')
        done()
      })
  }).timeout(0)
})

describe('Tracking Email', () => {
  it('it should track when user click link (by request)', (done) => {
    console.log(dummyLog)
    console.log(`/tracking/mail/${dummyLog._id}/${encodeURIComponent(`http://localhost:3000/demo/${dummyMail.emailConfig.name}`)}`)
    chai.request(server)
      .get(`/tracking/mail/${dummyLog._id}/${encodeURIComponent(`http://localhost:3000/demo/${dummyMail.emailConfig.name}`)}`)
      .end((err, res) => {
        res.should.have.status(401)
        done()
      })
  }).timeout(0)
  it('it should response image for track open mail', (done) => {
    chai.request(server)
      .get(`/tracking/pic/${dummyLog._id}`)
      .end((err, res) => {
        res.should.have.status(200)
        done()
      })
  }).timeout(0)
})

describe('Tracking Email', () => {
  it('it should track when user click link (by request)', (done) => {
    console.log(dummyLog)
    console.log(`/tracking/mail/${dummyLog._id}/${encodeURIComponent(`http://localhost:3000/demo/${dummyMail.emailConfig.name}`)}`)
    chai.request(server)
      .get(`/tracking/mail/${dummyLog._id}/${encodeURIComponent(`http://localhost:3000/demo/${dummyMail.emailConfig.name}`)}`)
      .end((err, res) => {
        res.should.have.status(401)
        done()
      })
  }).timeout(0)
  it('it should response image for track open mail', (done) => {
    chai.request(server)
      .get(`/tracking/pic/${dummyLog._id}`)
      .end((err, res) => {
        res.should.have.status(200)
        done()
      })
  }).timeout(0)
})


describe('Tracking Flow', () => {
  it('it should track all action correctly', (done) => {
    findFlow(dummyBody)
    console.log('test')
  }).timeout(0)
})