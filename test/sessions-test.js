let supertest = require('supertest')
let app = require('../app')
let sessionConstants = require('../constants/session')
let sessionStore = require('../session-store')

describe('Session Route', () => {
  
  it('should not create new session when session already in progress', (done) => {

    sessionStore.id = 'XyZ'

    supertest(app)
      .post('/sessions/')
      .expect('Content-Type', /json/)
      .expect(500)
      .expect((res) => res.body === { message: "There is already a session running" })
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
      .expect((res) => res.body.id.length === 8)
      .expect((res) => res.body.state === sessionConstants.STATES.WAITING_FOR_USERS)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        
        done()
      })
  })

  it('should retrieve active session with matching session id', (done) => {

    sessionStore.id = 'XyZ'

    supertest(app)
      .get('/sessions/XyZ/')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => res.body === sessionStore.id)
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
      .expect((res) => res.body === { message: "Session Id does not match current session" })
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        
        done()
      })
  })
  
})
