const express = require('express')
const router = express.Router();
const home = require('../Controllers/home')
const about = require('../Controllers/about')


// define the home page route
router.get('/home', home.home )
router.get('/home/create', home.home_create )
// define the about route
router.get('/about/list', about.api_about_list)
router.post('/about/create', about.api_about_create)

module.exports = router