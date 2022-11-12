const { QueryTypes } = require('sequelize');
// const {sequelize} = require('../db')
const db = require('../models/index')
const Test = require('../Models/Test')
const sequelize = db.sequelize


exports.home = (req,res)=>{
    console.log('Home Page');
    res.status(200).send('About page')
}
exports.home_create = (req,res)=>{
    console.log('Home Page');
    res.status(200).send('About page')
}