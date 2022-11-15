const { DataTypes, Model } = require('sequelize');
// const {sequelize} = require('../db')
const db = require('../models/index')
const sequelize = db.sequelize
const Sequelize = db.Sequelize

// test_status
// test_text
// test_title
// test_name
// test_id
// test_key

class Test extends Model {

}
Test.init({
  // ...
}, {
  sequelize,
  modelName: 'Test',
  tableName: 'tbl_test',
  // createdAt: 'date_created',
  // updatedAt: 'date_updated',
  underscore: true,
  
});

module.exports = Test;