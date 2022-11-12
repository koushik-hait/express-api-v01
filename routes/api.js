const express = require('express')
const router = express.Router();
const home = require('../Controllers/home')

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/home', home.home )
router.get('/home/create', home.home_create )
// define the about route
router.get('/about', (req, res) => {
  res.status(200).send('About page')
})

module.exports = router