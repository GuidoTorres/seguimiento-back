const { Sequelize } = require('sequelize');
const initModels = require('../models2/init_models');

const sequelize3 =  new Sequelize('seguimiento', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    });
  
  initModels(sequelize3)

  module.exports = sequelize3;
