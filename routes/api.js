const express = require('express')
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/home', (req, res) => {
  res.status(200).send('Home page')
})
// define the about route
router.get('/about', (req, res) => {
  res.status(200).send('About page')
})

module.exports = router