let supertest = require('supertest')
var assert = require('chai').assert;

let app = require('../app')
let sessionConstants = require('../constants/session')
let sessionStore = require('../session-store')


describe('Add user card choice to session', () => {

  it('Valid user adds card to valid session', (done) => {

    sessionStore.id = 'H1tSBr9F'
    sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS
    sessionStore.users = ['someone@domain.com']
    sessionStore.cards = []

    let userId = 'someone@domain.com'

    var cardValueToAdd = { cardValue: 3 }

    supertest(app)
      .put(`/sessions/${sessionStore.id}/user/${userId}`)
      .send(cardValueToAdd)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => assert.deepEqual(res.body.userId, 'someone@domain.com'))
      .expect((res) => assert.deepEqual(res.body.cardValue, 3))
      .expect((res) => assert.include(sessionStore.cards, { userId: 'someone@domain.com', cardValue: 3 }))
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        done()
      })
  })

  it('Card is value not accepted if user is not registered to session', (done) => {

    sessionStore.id = 'H1tSBr9F'
    sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS
    sessionStore.users = ['someone@domain.com']
    sessionStore.cards = []

    let userId = 'someoneelse@domain.com'

    var cardValueToAdd = { cardValue: 3 }

    supertest(app)
      .put(`/sessions/${sessionStore.id}/user/${userId}`)
      .send(cardValueToAdd)
      .expect(404)
      .expect('Content-Type', /json/)
      .expect((res) => assert.deepEqual(res.body, { message: 'User could not be found in session' }))
      .expect((res) => assert.notInclude(sessionStore.cards, { userId: 'someoneelse@domain.com', cardValue: 3 }))
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        done()
      })
  })

  it('Card is value not accepted when session id is not current session', (done) => {

    sessionStore.id = 'H1tSBr9F'
    sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS
    sessionStore.users = ['someone@domain.com']
    sessionStore.cards = []

    let userId = 'someone@domain.com'

    var cardValueToAdd = { cardValue: 3 }

    supertest(app)
      .put(`/sessions/PPBqWA9/user/${userId}`)
      .send(cardValueToAdd)
      .expect(500)
      .expect('Content-Type', /json/)
      .expect((res) => assert.deepEqual(res.body, { message: 'Session Id does not match current session' }))
      .expect((res) => assert.notInclude(sessionStore.cards, { userId: 'someone@domain.com', cardValue: 3 }))
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        done()
      })
  })

  it('When user submits new card value it will overwrite previous', (done) => {

    sessionStore.id = 'H1tSBr9F'
    sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS
    sessionStore.users = ['someone@domain.com']
    sessionStore.cards = [ { userId: 'someone@domain.com', cardValue: 3 } ]

    let userId = 'someone@domain.com'

    var updateCardValueTo = { cardValue: 5 }

    supertest(app)
      .put(`/sessions/${sessionStore.id}/user/${userId}`)
      .send(updateCardValueTo)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => assert.deepEqual(res.body.userId, 'someone@domain.com'))
      .expect((res) => assert.deepEqual(res.body.cardValue, 5))
      .expect((res) => assert.include(sessionStore.cards, { userId: 'someone@domain.com', cardValue: 5 }))
      .expect((res) => assert.lengthOf(sessionStore.cards, 1))
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        done()
      })
  })

})

