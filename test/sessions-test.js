let supertest = require('supertest')
var assert = require("assert");

let app = require('../app')
let sessionConstants = require('../constants/session')
let sessionStore = require('../session-store')

describe('Session Route', () => {

  describe('Create', () => {
    it('should not create new session when session already in progress', (done) => {

      sessionStore.id = 'XyZ'

      supertest(app)
        .post('/sessions/')
        .expect('Content-Type', /json/)
        .expect(500)
        .expect((res) => assert.equal(res.body.message, "There is already a session running"))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })

    })

    it('should create new session when no session is active', (done) => {

      sessionStore.id = ''

      supertest(app)
        .post('/sessions/')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => assert.equal(res.body.id.length, 8))
        .expect((res) => assert.equal(res.body.state, sessionConstants.STATES.WAITING_FOR_USERS))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })
  })

  describe('Read', () => {
    it('should retrieve active session with matching session id', (done) => {

      sessionStore.id = 'XyZ'

      supertest(app)
        .get('/sessions/XyZ/')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => assert.equal(res.body.id, sessionStore.id))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('should return 500 when session does not match active session id', (done) => {

      sessionStore.id = 'AbC'

      supertest(app)
        .get('/sessions/XyZ/')
        .expect('Content-Type', /json/)
        .expect(500)
        .expect((res) => assert.equal(res.body.message, "Session Id does not match current session"))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })
  })

  describe('Update', () => {

    it('should update active session when session id matches active session id', (done) => {

      sessionStore.id = 'XyZ'
      sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS

      var newSessionState = { sessionId: 'XyZ', state: sessionConstants.STATES.ACTIVE }

      supertest(app)
        .put('/sessions/')
        .send(newSessionState)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => assert.equal(res.body.id, newSessionState.sessionId))
        .expect((res) => assert.equal(res.body.state, newSessionState.state))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('should not update active session when session id is not present', (done) => {

      var newSessionState = { state: sessionConstants.STATES.ACTIVE }

      supertest(app)
        .put('/sessions/')
        .send(newSessionState)
        .expect('Content-Type', /json/)
        .expect(500)
        .expect((res) => assert.equal(res.body.message, "No session id received"))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('should not update active session state when state is invalid', (done) => {

      sessionStore.id = 'XyZ'

      var newSessionState = { sessionId: 'XyZ', state: 'INVALID STATE HERE' }

      supertest(app)
        .put('/sessions/')
        .send(newSessionState)
        .expect('Content-Type', /json/)
        .expect(500)
        .expect((res) => assert.equal(res.body.message, 'State is not valid'))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('should update active session when session id matches active session id', (done) => {

      sessionStore.id = 'XyZ'
      sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS

      var newSessionState = { sessionId: 'AbC', state: sessionConstants.STATES.ACTIVE }

      supertest(app)
        .put('/sessions/')
        .send(newSessionState)
        .expect('Content-Type', /json/)
        .expect(500)
        .expect((res) => assert.equal(res.body.message, 'Session Id does not match current session'))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })
  })

})
