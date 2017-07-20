const server = require('../server')
const { findFlow } = require('../src/route/tracking')
const EmailLogs = require('../src/models/EmailLog')
const UserLogs = require('../src/models/UserLog')


if (!process.env.PASSWORD || !process.env.EMAIL) {
  console.log('pls set env for PASSWORD and EMAIL (env PASSWORD=<password> EMAIL=<email>)')
}
const password = process.env.PASSWORD
const email = process.env.EMAIL
const dummyMail = {
  fromPassword: password,
  fromMail: email,
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
const dummyReq = {
  actionName: 'action3',
  flowName: 'Register',
  user: '5938f00a762ddb3642ac7399'
}

describe('Sending Email', () => {
  it('it should send mail success with correct data', (done) => {
    EmailLogs.remove({}).then(() => {
      UserLogs.remove({}).then(() => {
        chai.request(server)
          .post('/sendmail')
          .send(dummyMail)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.text.should.equal('correct !')
            EmailLogs.find({}).then((emailLog) => {
              dummyLog = emailLog[0]
              done()
            })
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
    findFlow(dummyBody).then((result) => {
      result.should.equal(true)
      done()
    })
  }).timeout(0)
  it('it should not update same action', (done) => {
    findFlow(dummyBody).then((result) => {
      result.should.equal(false)
      done()
    })
  }).timeout(0)
  it('it should show response with status 200', (done) => {
    EmailLogs.update({}, { success: 0 }, { multi: true }).then(() => {
      chai.request(server)
      .post('/tracking/')
      .send(dummyReq)
      .end((err, res) => {
        res.should.have.status(200)
        res.text.should.equal('update success')
        done()
      })
    })
  }).timeout(0)
})
