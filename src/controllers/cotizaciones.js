const dayjs = require("dayjs");
const sequelize = require("../../config/database");
const { models } = require("./../../config/database1");
const { Op } = require("sequelize");

const getCotizacionBienes = async (req, res, next) => {
  try {
    const [resultados, metadata] = await sequelize.query(`
    SELECT SM.SEC_SOL_MOD, SM.GLOSA, CONCAT(CBS.GRUPO_BIEN, CBS.CLASE_BIEN, CBS.FAMILIA_BIEN,CBS.ITEM_BIEN) AS SBN, CBS.NOMBRE_ITEM, UM.NOMBRE, CMD.TIPO_BIEN, CC.NOMBRE_DEPEND 
    FROM
        SIG_SOLICITUD_MODIFICACION AS SM
        INNER JOIN SIG_SOLICITUD_MODIFICACION_DET AS SMD ON (SM.ANNO_EJEC=SMD.ANNO_EJEC AND SM.SEC_EJEC =SMD.SEC_EJEC AND SM.SEC_SOL_MOD=SMD.SEC_SOL_MOD)
        INNER JOIN SIG_CUADRO_MODIFICADO_DET AS CMD ON (CMD.SEC_EJEC= SMD.SEC_EJEC AND CMD.ANNO_EJEC=SMD.ANNO_EJEC AND CMD.CENTRO_COSTO=SMD.CENTRO_COSTO AND CMD.SEC_CUADRO=SMD.SEC_CUADRO AND CMD.SEC_ITEM=SMD.SEC_ITEM AND CMD.ANNO_PROG=SMD.ANNO_PROG)
        INNER JOIN CATALOGO_BIEN_SERV AS CBS ON (CBS.SEC_EJEC=CMD.SEC_EJEC AND CBS.TIPO_BIEN = CMD.TIPO_BIEN AND CBS.GRUPO_BIEN=CMD.GRUPO_BIEN AND CBS.CLASE_BIEN = CMD.CLASE_BIEN AND CBS.FAMILIA_BIEN = CMD.FAMILIA_BIEN AND CBS.ITEM_BIEN = CMD.ITEM_BIEN)
        INNER JOIN SIG_CENTRO_COSTO AS CC ON (CC.ANO_EJE = CMD.ANNO_EJEC AND CC.SEC_EJEC=CMD.SEC_EJEC AND CC.CENTRO_COSTO = CMD. CENTRO_COSTO)
        INNER JOIN unidad_medida AS UM ON (UM.UNIDAD_MEDIDA= CMD.UNIDAD_MEDIDA)
    WHERE
        SM.SEC_EJEC=1137 AND SM.ANNO_EJEC=2024 AND SMD.ANNO_PROG=2024 AND SM.ESTADO IN ('2') AND CMD.TIPO_BIEN='B'
    ORDER BY SM.SEC_SOL_MOD
    `);

    // Crear un array con las claves únicas (nro_orden, tipo_bien, ano_eje)
    // const clavesUnicas = resultados.map(item => ({
    //   nro_orden: item.NRO_ORDEN,
    //   tipo_bien: item.TIPO_BIEN,
    //   ano_eje: item.ANO_EJE,
    //   secuencia: item.SECUENCIA,
    // }));

    // // Hacer una única consulta para obtener todas las órdenes que ya existen en la base de datos
    // const existingOrders = await models.orden_compra.findAll({
    //   where: {
    //     [Op.or]: clavesUnicas.map((clave) => ({
    //       nro_orden: clave.nro_orden,
    //       tipo_bien: clave.tipo_bien,
    //       ano_eje: clave.ano_eje,
    //       secuencia: clave.secuencia,
    //     })),
    //   },
    // });

    // Crear un array de nuevos registros
    const newOrders = [];
    const ordersToUpdate = [];

    // resultados.forEach((item) => {
    //   const existingOrder = existingOrders.find(
    //     (order) =>
    //       order.nro_orden === item.NRO_ORDEN &&
    //       order.tipo_bien === item.TIPO_BIEN &&
    //       order.secuencia === item.SECUENCIA &&
    //       order.ano_eje === item.ANO_EJE
    //   );

    //   const orderData = {
    //     nro_orden: item.NRO_ORDEN,
    //     secuencia: item.SECUENCIA,
    //     tipo_bien: item.TIPO_BIEN,
    //     ano_eje: item.ANO_EJE,
    //     fecha_orden: item.FECHA_ORDEN,
    //     exp_siaf: item.EXP_SIAF,
    //     concepto: item.CONCEPTO,
    //     clasificador: item.CLASIFICADOR,
    //     nombre_clasif: item.NOMBRE_CLASIF,
    //     nro_ruc: item.NRO_RUC,
    //     nombre_prov: item.NOMBRE_PROV,
    //     nombre_depend: item.NOMBRE_DEPEND,
    //     nombre: item.NOMBRE_ITEM,
    //     precio_total_orden: item.TOTAL_FACT_SOLES,
    //     nro_certifica: item.NRO_CERTIFICA,
    //     cuser_id: item.CUSER_ID,
    //     precio_bien: item.PREC_TOT_SOLES,
    //     centro_costo: item.CENTRO_COSTO,
    //   };

    //   if (existingOrder) {
    //     // Añadir al array de actualización
    //     ordersToUpdate.push({ ...orderData, id: existingOrder.id });
    //   } else {
    //     // Añadir al array de nuevos registros
    //     newOrders.push(orderData);
    //   }
    // });

    // // Crear nuevos registros
    // if (newOrders.length > 0) {
    //   await models.orden_compra.bulkCreate(newOrders);
    // }

    // // Actualizar los registros existentes
    // for (const order of ordersToUpdate) {
    //   await models.orden_compra.update(order, { where: { id: order.id } });
    // }

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ message: "Error al registrar los bienes." });
    console.error(error);
  }
};

const getCotizacionServicios = async (req, res, next) => {
    try {
      const [resultados, metadata] = await sequelize.query(`
      SELECT SM.SEC_SOL_MOD, SM.GLOSA, CONCAT(CBS.GRUPO_BIEN, CBS.CLASE_BIEN, CBS.FAMILIA_BIEN,CBS.ITEM_BIEN) AS SBN, CBS.NOMBRE_ITEM, UM.NOMBRE, CMD.TIPO_BIEN, CC.NOMBRE_DEPEND 
      FROM
          SIG_SOLICITUD_MODIFICACION AS SM
          INNER JOIN SIG_SOLICITUD_MODIFICACION_DET AS SMD ON (SM.ANNO_EJEC=SMD.ANNO_EJEC AND SM.SEC_EJEC =SMD.SEC_EJEC AND SM.SEC_SOL_MOD=SMD.SEC_SOL_MOD)
          INNER JOIN SIG_CUADRO_MODIFICADO_DET AS CMD ON (CMD.SEC_EJEC= SMD.SEC_EJEC AND CMD.ANNO_EJEC=SMD.ANNO_EJEC AND CMD.CENTRO_COSTO=SMD.CENTRO_COSTO AND CMD.SEC_CUADRO=SMD.SEC_CUADRO AND CMD.SEC_ITEM=SMD.SEC_ITEM AND CMD.ANNO_PROG=SMD.ANNO_PROG)
          INNER JOIN CATALOGO_BIEN_SERV AS CBS ON (CBS.SEC_EJEC=CMD.SEC_EJEC AND CBS.TIPO_BIEN = CMD.TIPO_BIEN AND CBS.GRUPO_BIEN=CMD.GRUPO_BIEN AND CBS.CLASE_BIEN = CMD.CLASE_BIEN AND CBS.FAMILIA_BIEN = CMD.FAMILIA_BIEN AND CBS.ITEM_BIEN = CMD.ITEM_BIEN)
          INNER JOIN SIG_CENTRO_COSTO AS CC ON (CC.ANO_EJE = CMD.ANNO_EJEC AND CC.SEC_EJEC=CMD.SEC_EJEC AND CC.CENTRO_COSTO = CMD. CENTRO_COSTO)
          INNER JOIN unidad_medida AS UM ON (UM.UNIDAD_MEDIDA= CMD.UNIDAD_MEDIDA)
      WHERE
          SM.SEC_EJEC=1137 AND SM.ANNO_EJEC=2024 AND SMD.ANNO_PROG=2024 AND SM.ESTADO IN ('2') AND CMD.TIPO_BIEN='S'
      ORDER BY SM.SEC_SOL_MOD
      `);
  
      // Crear un array con las claves únicas (nro_orden, tipo_bien, ano_eje)
      // const clavesUnicas = resultados.map(item => ({
      //   nro_orden: item.NRO_ORDEN,
      //   tipo_bien: item.TIPO_BIEN,
      //   ano_eje: item.ANO_EJE,
      //   secuencia: item.SECUENCIA,
      // }));
  
      // // Hacer una única consulta para obtener todas las órdenes que ya existen en la base de datos
      // const existingOrders = await models.orden_compra.findAll({
      //   where: {
      //     [Op.or]: clavesUnicas.map((clave) => ({
      //       nro_orden: clave.nro_orden,
      //       tipo_bien: clave.tipo_bien,
      //       ano_eje: clave.ano_eje,
      //       secuencia: clave.secuencia,
      //     })),
      //   },
      // });
  
      // Crear un array de nuevos registros
      const newOrders = [];
      const ordersToUpdate = [];
  
      // resultados.forEach((item) => {
      //   const existingOrder = existingOrders.find(
      //     (order) =>
      //       order.nro_orden === item.NRO_ORDEN &&
      //       order.tipo_bien === item.TIPO_BIEN &&
      //       order.secuencia === item.SECUENCIA &&
      //       order.ano_eje === item.ANO_EJE
      //   );
  
      //   const orderData = {
      //     nro_orden: item.NRO_ORDEN,
      //     secuencia: item.SECUENCIA,
      //     tipo_bien: item.TIPO_BIEN,
      //     ano_eje: item.ANO_EJE,
      //     fecha_orden: item.FECHA_ORDEN,
      //     exp_siaf: item.EXP_SIAF,
      //     concepto: item.CONCEPTO,
      //     clasificador: item.CLASIFICADOR,
      //     nombre_clasif: item.NOMBRE_CLASIF,
      //     nro_ruc: item.NRO_RUC,
      //     nombre_prov: item.NOMBRE_PROV,
      //     nombre_depend: item.NOMBRE_DEPEND,
      //     nombre: item.NOMBRE_ITEM,
      //     precio_total_orden: item.TOTAL_FACT_SOLES,
      //     nro_certifica: item.NRO_CERTIFICA,
      //     cuser_id: item.CUSER_ID,
      //     precio_bien: item.PREC_TOT_SOLES,
      //     centro_costo: item.CENTRO_COSTO,
      //   };
  
      //   if (existingOrder) {
      //     // Añadir al array de actualización
      //     ordersToUpdate.push({ ...orderData, id: existingOrder.id });
      //   } else {
      //     // Añadir al array de nuevos registros
      //     newOrders.push(orderData);
      //   }
      // });
  
      // // Crear nuevos registros
      // if (newOrders.length > 0) {
      //   await models.orden_compra.bulkCreate(newOrders);
      // }
  
      // // Actualizar los registros existentes
      // for (const order of ordersToUpdate) {
      //   await models.orden_compra.update(order, { where: { id: order.id } });
      // }
  
      res.status(200).json(resultados);
    } catch (error) {
      res.status(500).json({ message: "Error al registrar los bienes." });
      console.error(error);
    }
  };

module.exports={getCotizacionBienes, getCotizacionServicios}