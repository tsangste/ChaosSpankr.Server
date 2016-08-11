let express = require('express')
let router = express.Router()

/* GET home page. */
router.get('/', (req, res) => res.json({message: 'Welcome to ChaosSpankr!!!'}))

module.exports = router
