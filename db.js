const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('purplestone', 'rootuser', 'admin549344', {
    dialect: 'mysql',
    host: '127.0.0.1',
    define: {
      timestamps: false
  }
});

module.exports = { 
    sequelize 
}