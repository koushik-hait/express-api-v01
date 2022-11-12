const { DataTypes, Model } = require('sequelize');
// const {sequelize} = require('../db')
const db = require('../models/index')
const sequelize = db.sequelize
const Sequelize = db.Sequelize
class Test extends Model {

}
Test.init({
  // ...
}, {
  modelName: 'Test',
  tableName: 'tbl_test',
  sequelize,
});

module.exports = Test;