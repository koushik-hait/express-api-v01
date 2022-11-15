const { QueryTypes } = require('sequelize');
// const {sequelize} = require('../db')
const db = require('../models/index')
const Test = require('../Models/Test')
const Test1 = require('../Models/Test1')
const BaseModel = require('../Models/Base')
const sequelize = db.sequelize

exports.api_about_list = async (req,res)=>{
    const test_data = await sequelize.query("SELECT * FROM `tbl_test`", { type: QueryTypes.SELECT });
    console.log("All data:", JSON.stringify(test_data, null, 2));
    res.status(200).send({"data":test_data});
}

exports.api_about_create = async (req,res)=>{
    // Create a new user
    await Test1.create({ test1_key: `${BaseModel.auto_key}`,test1_name: "Test 123", test1_text: "test text 123" });
    res.status(200).send('Test Created');
}