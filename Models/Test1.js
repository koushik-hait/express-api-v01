const { DataTypes, Model } = require('sequelize');
// const {sequelize} = require('../db')
const db = require('../models/index')
const sequelize = db.sequelize
const Sequelize = db.Sequelize


// test1_status
// test1_text
// test1_title
// test1_name
// test1_id
// test1_key

class Test1 extends Model {

}
Test1.init({

}, {
    sequelize,
    modelName: 'Test1',
    tableName: 'tbl_test1',
    // createdAt: 'date_created',
    // updatedAt: 'date_updated',
    underscore: true,
    timestamps: false,

});

module.exports = Test1;