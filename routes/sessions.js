let express = require('express')
let shortid = require('shortid')
let sessionConstants = require('../constants/session')
let sessionStore = require('../session-store')

let router = express.Router()

/*
 Start a new session
 exampleCall: curl -H "Content-Type: application/json" -X POST -d '{}' http://localhost:3000/sessions/
 */
router.post('/', (req, res) => {
  if (sessionStore.id !== '') {
    res.status(500)
    res.json({message: "There is already a session running"})

    return
  }

  sessionStore.id = shortid.generate()
  sessionStore.state = sessionConstants.STATES.WAITING_FOR_USERS

  res.json(sessionStore)
})

/*
 Retrieve a session
 exampleCall: curl -H "Content-Type: application/json" -X GET http://localhost:3000/sessions/H1tSBr9F
 */
router.get('/:sessionId', (req, res) => {
  let sessionId = req.params.sessionId

  if (sessionId !== sessionStore.id) {
    res.status(500)
    res.json({message: "Session Id does not match current session"})

    return
  }

  res.json(sessionStore)
})

/*
 Update a session
 exampleCall: curl -H "Content-Type: application/json" -X PUT -d '{"sessionId": "H1tSBr9F", "state": "Active"}' http://localhost:3000/sessions/H1tSBr9F
 */
router.put('/', (req, res) => {
  let sessionId = req.body.sessionId || ''
  let state = req.body.state || ''

  if (sessionId === '') {
    res.status(500)
    res.json({message: "No session id received"})

    return
  }

  let isValidState = sessionConstants.VALID_STATES.indexOf(state) > -1

  if (!isValidState) {
    res.status(500)
    res.json({message: "State is not valid"})

    return
  }

  if (sessionId !== sessionStore.id) {
    res.status(500)
    res.json({message: "Session Id does not match current session"})

    return
  }

  sessionStore.state = state

  res.json(sessionStore)
})

/*
 Delete a session
 exampleCall: curl -H "Content-Type: application/json" -X DELETE -d '{"sessionId": "H1tSBr9F"}' http://localhost:3000/sessions/
 */
router.delete('/', (req, res) => {
  let sessionId = req.body.sessionId

  if (sessionId === '') {
    res.status(500)
    res.json({message: "No session id received"})

    return
  }

  console.log(`Removing session: '${sessionId}'`)

  if (!shortid.isValid(sessionId)) {
    res.status(500)
    res.json({message: "Session Id is not valid"})

    return
  }

  if (sessionId !== sessionStore.id) {
    res.status(500)
    res.json({message: "Session Id does not match current session"})

    return
  }

  sessionStore.id = ""
  sessionStore.state = null
  sessionStore.users = []

  res.status(200)
  res.json({})
})

module.exports = router
