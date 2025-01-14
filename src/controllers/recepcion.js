const dayjs = require("dayjs");
const sequelize = require("../../config/database");
const SIG_CONTRATISTAS = require("../../models/SIG_CONTRATISTAS");
const { models1 } = require("./../../config/database");
const { models } = require("./../../config/database1");
const orden_compra = require("../../models2/orden_compra");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

const getBienes = async (req, res, next) => {
  try {
    const [resultados, metadata] = await sequelize.query(`
      SELECT        P.NRO_PEDIDO, P.MOTIVO_PEDIDO, CC.NOMBRE_DEPEND, P.TIPO_BIEN
      FROM            SIG_PEDIDOS AS P
                      INNER JOIN SIG_CENTRO_COSTO AS CC ON (CC.ANO_EJE = P.ANO_EJE AND CC.SEC_EJEC=P.SEC_EJEC AND CC.CENTRO_COSTO = P.CENTRO_COSTO)
      WHERE        (P.ANO_EJE = '2025') AND (P.TIPO_BIEN = 'S')      `);

    return res.status(200).json({ data: resultados });
  } catch (error) {
    res.status(500).json();
    console.log(error);
  }
};

module.exports = { getBienes };
