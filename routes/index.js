var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => res.json({message: 'Welcome to ChaosSpankr!!!'}));

router.get('/test', (req, res) => res.json({message: 'test code'}));

module.exports = router;
