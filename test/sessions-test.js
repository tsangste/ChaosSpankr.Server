let supertest = require('supertest')
var assert = require('chai').assert;

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

  describe('Delete', () => {

    it('session should be removed when id matches', (done) => {

      sessionStore.id = 'H1tSBr9F'
      sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS
      sessionStore.users = ['Some Value']

      var sessionToDelete = { sessionId: 'H1tSBr9F' }

      supertest(app)
        .delete('/sessions/')
        .send(sessionToDelete)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => assert.deepEqual(res.body, {}))
        .expect((res) => assert.equal(sessionStore.id, ''))
        .expect((res) => assert.equal(sessionStore.state, null))
        .expect((res) => assert.deepEqual(sessionStore.users, []))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('session should not be removed when session id is not valid', (done) => {

      sessionStore.id = 'H1tSBr9F'
      sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS

      var sessionToDelete = { sessionId: 'INVALID SESSION ID' }

      supertest(app)
        .delete('/sessions/')
        .send(sessionToDelete)
        .expect('Content-Type', /json/)
        .expect(500)
        .expect((res) => assert.deepEqual(sessionStore.id, 'H1tSBr9F'))
        .expect((res) => assert.deepEqual(sessionStore.state, sessionConstants.STATES.WAITING_FOR_USERS))
        .expect((res) => assert.equal(res.body.message, 'Session Id is not valid'))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('session should not be removed when session id is not valid', (done) => {

      sessionStore.id = 'PPBqWA9'

      var sessionToDelete = { sessionId: 'H1tSBr9F' }

      supertest(app)
        .delete('/sessions/')
        .send(sessionToDelete)
        .expect('Content-Type', /json/)
        .expect(500)
        .expect((res) => assert.deepEqual(sessionStore.id, 'PPBqWA9'))
        .expect((res) => assert.deepEqual(sessionStore.state, sessionConstants.STATES.WAITING_FOR_USERS))
        .expect((res) => assert.equal(res.body.message, 'Session Id does not match current session'))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

  })

  describe('Add user to session', () => {

    it('valid user should be added to session when session matches active session', (done) => {

      sessionStore.id = 'H1tSBr9F'
      sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS
      sessionStore.users = []

      var userToAdd = { userId: 'someone@domain.com' }

      supertest(app)
        .put(`/sessions/${sessionStore.id}/user`)
        .send(userToAdd)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => assert.deepEqual(res.body, userToAdd))
        .expect((res) => assert.equal(sessionStore.id, 'H1tSBr9F'))
        .expect((res) => assert.include(sessionStore.users, userToAdd.userId))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('valid user should not be added to session when session does not match active session', (done) => {

      sessionStore.id = 'H1tSBr9F'
      sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS
      sessionStore.users = []

      var userToAdd = { userId: 'someone@test.com' }

      supertest(app)
        .put(`/sessions/PPBqWA9/user`)
        .send(userToAdd)
        .expect('Content-Type', /json/)
        .expect(500)
        .expect((res) => assert.equal(res.body.message, 'Session Id does not match current session'))
        .expect((res) => assert.equal(sessionStore.id, 'H1tSBr9F'))
        .expect((res) => assert.notInclude(sessionStore.users, userToAdd.userId))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('invalid user should not be added to session', (done) => {

      sessionStore.id = 'H1tSBr9F'
      sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS
      sessionStore.users = []

      var userToAdd = { userId: 'invalidnotatemail' }

      supertest(app)
        .put(`/sessions/${sessionStore.id}/user`)
        .send(userToAdd)
        .expect('Content-Type', /json/)
        .expect(422)
        .expect((res) => assert.equal(res.body.message, `Email address '${userToAdd.userId}' is not valid`))
        .expect((res) => assert.equal(sessionStore.id, 'H1tSBr9F'))
        .expect((res) => assert.notInclude(sessionStore.users, userToAdd.userId))
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

    it('User should not be duplicated if already enrolled in session', (done) => {

      sessionStore.id = 'H1tSBr9F'
      sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS
      sessionStore.users = ['someone@domain.com']

      var userToAdd = { userId: 'someone@domain.com' }

      supertest(app)
        .put(`/sessions/${sessionStore.id}/user`)
        .send(userToAdd)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => assert.deepEqual(res.body, userToAdd))        
        .expect((res) => assert.equal(sessionStore.id, 'H1tSBr9F'))
        .expect((res) => assert.include(sessionStore.users, userToAdd.userId))
        .expect((res) => assert.equal(sessionStore.users.length, 1))        
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          done()
        })
    })

  })

})
