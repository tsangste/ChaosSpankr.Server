let express = require('express')
let http = require('http')
let logger = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let cors = require('cors')

let socketIoMiddleware = require('./middleware/socketio')
let routes = require('./routes/index')
let sessionRoutes = require('./routes/sessions')

let app = express()
let server = require('http').Server(app);
let io = require('socket.io')(server);

server.listen(3000, "0.0.0.0") // makes it available accross the network: http://stackoverflow.com/a/15493030/3104762

app.use(cors())

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(socketIoMiddleware(io));

app.use('/', routes)
app.use('/sessions', sessionRoutes)

// stop favicon error requests
app.get('/favicon.ico', (req, res) => res.send(200))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = { app: app, server: server }
