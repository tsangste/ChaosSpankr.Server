let supertest = require('supertest')
let app = require('../app')

describe('Default Route', () => {

  it('should return Welcome to ChaosSpankr!!!', (done) => {

    supertest(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => res.body === { message: 'Welcome to ChaosSpankr!!!' })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        done();
      })
  })
  
})
