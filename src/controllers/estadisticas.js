const dayjs = require("dayjs");
const sequelize = require("../../config/database");
const { models } = require("./../../config/database1");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

const Estadisticas = async (req, res, next) => {
  try {

    const result = await models.estados.findAll({
        include:[{model: models.orden_compra}]
    })

   

    return res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).json();
    console.log(error);
  }
};