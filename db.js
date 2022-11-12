const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
  	// we will be saving our db as a file on this path
    storage: 'database.sqlite', // or ':memory:'
});

module.exports = { 
    sequelize 
}