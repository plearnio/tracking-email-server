const chai = require('chai')
const chaiHttp = require('chai-http')

process.env.NODE_ENmocV = 'test'
chai.use(chaiHttp)
global.chai = chai
global.expect = chai.expect
global.should = chai.should()
