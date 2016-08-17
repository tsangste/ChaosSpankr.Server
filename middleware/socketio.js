let socketMiddleware = (io) => (req, res, next) => {
  res.io = io;
  next();
}

module.exports = socketMiddleware
