const mongoose = require('mongoose')
const { EmailConfigs, FlowConfigs, UserLists } = require('../connectors')

const setupDatabase = () => {
  const emailConfigs = [{
    _id: mongoose.Types.ObjectId('5938f18e5d13e136df0e6936'),
    name: 'register',
    description: 'Suggest user to register Jitta',
    expectedFlow: [
      mongoose.Types.ObjectId('5938f6cf394156336ded8d4c')
    ]
  }, {
    _id: mongoose.Types.ObjectId('5938f1f2394156336ded8d4b'),
    name: 'upgrade',
    description: 'Suggest user to upgrade account',
    expectedFlow: [
      mongoose.Types.ObjectId('595b52463a0945e1498d8402')
    ]
  }]
  EmailConfigs.collection.insert(emailConfigs, (err) => {
    if (err) console.log(err)
    console.log('set up emailConfigs success !')
  })

  const flows = [
    {
      _id: mongoose.Types.ObjectId('5938f6cf394156336ded8d4c'),
      name: 'Register',
      actions: [{
        name: 'Enter register page'
      }, {
        name: 'action1'
      }, {
        name: 'action2'
      }, {
        name: 'action3'
      }, {
        name: 'Submit'
      }],
      url: 'http://localhost:3000/demoregister',
      actionsLen: 5,
      successAction: {
        name: 'Submit'
      },
      description: 'Descript registeration\'s flow'
    }, {
      _id: mongoose.Types.ObjectId('595b52463a0945e1498d8402'),
      name: 'Upgrade',
      actions: [{
        name: 'Enter upgrade page'
      }, {
        name: 'action1'
      }, {
        name: 'Submit'
      }],
      url: 'http://localhost:3000/demoupgrade',
      actionsLen: 3,
      successAction: {
        name: 'Submit'
      },
      description: 'Descript upgrade\'s flow'
    }]
  FlowConfigs.collection.insert(flows, (err) => {
    if (err) console.log(err)
    console.log('set up flows success !')
  })

  const users = [{
    _id: mongoose.Types.ObjectId('5938f00a762ddb3642ac7399'),
    name: 'Pruek',
    userEmail: 'p.plearn.io@gmail.com',
    age: 22,
  }, {
    _id: mongoose.Types.ObjectId('5938f093394156336ded8d4a'),
    name: 'Ploy',
    userEmail: 'red_shoe13@hotmail.com',
    age: 21
  }]
  UserLists.collection.insert(users, (err) => {
    if (err) console.log(err)
    console.log('set up users success !')
  })
}

setupDatabase()

module.exports = setupDatabase
