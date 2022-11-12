const { QueryTypes } = require('sequelize');
// const {sequelize} = require('../db')
const db = require('../models/index')
const Test = require('../Models/Test')
const sequelize = db.sequelize

exports.api_about_list = async (req,res)=>{
    const test_data = await sequelize.query("SELECT * FROM `tbl_test`", { type: QueryTypes.SELECT });
    console.log("All data:", JSON.stringify(test_data, null, 2));
    res.status(200).send({"data":test_data});
}

exports.api_about_create = (req,res)=>{
    console.log('about Page');
    res.status(200).send('About page');
}