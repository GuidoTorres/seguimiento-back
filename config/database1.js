const { Sequelize } = require('sequelize');
const initModels = require('../models2/init_models');

const sequelize3 =  new Sequelize('seguimiento', 'usuario', 'root', {
    host: '10.30.1.43',
    dialect: 'mysql',
    timezone: "-05:00",
    });
  
  initModels(sequelize3)

  module.exports = sequelize3;
