const dayjs = require("dayjs");
const sequelize = require("../../config/database");
const { models } = require("./../../config/database1");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");

const registrarBienesEnBd = async (req, res, next) => {
  try {
    const [resultados, metadata] = await sequelize.query(`
      SELECT OA.ANO_EJE, D.TIPO_BIEN, OA.NRO_ORDEN, OA.FECHA_ORDEN, OA.EXP_SIAF, OA.CONCEPTO, OIP.CLASIFICADOR, CCBS.NOMBRE_CLASIF, D.SECUENCIA, C.NRO_RUC, C.NOMBRE_PROV, 
      CBS.NOMBRE_ITEM, CC.CENTRO_COSTO, CC.NOMBRE_DEPEND, T.nombre, OI.PREC_TOT_SOLES, OA.TOTAL_FACT_SOLES, OA.NRO_CERTIFICA, OI.CUSER_ID
      FROM SIG_ORDEN_ADQUISICION AS OA 
      INNER JOIN SIG_DEPEN_META_CUADRO AS D ON (OA.SEC_CUADRO=D.SEC_CUADRO AND OA.ANO_EJE=D.ANO_EJE AND OA.SEC_EJEC=D.SEC_EJEC AND OA.TIPO_BIEN = D.TIPO_BIEN)
      INNER JOIN SIG_DETALLE_BSERV_CUADRO AS DBC ON (DBC.ANO_EJE=D.ANO_EJE AND DBC.SEC_EJEC=D.SEC_EJEC AND DBC.TIPO_BIEN = D.TIPO_BIEN AND DBC.SEC_CUADRO=D.SEC_CUADRO AND DBC.SECUENCIA = D.SECUENCIA)
      INNER JOIN SIG_ORDEN_ITEM AS OI ON (OI.ANO_EJE=DBC.ANO_EJE AND OI.SEC_EJEC=DBC.SEC_EJEC AND OI.TIPO_BIEN = DBC.TIPO_BIEN AND OI.NRO_ORDEN = OA.NRO_ORDEN AND DBC.SECUENCIA = D.SECUENCIA)
      INNER JOIN SIG_ORDEN_ITEM_PPTO AS OIP ON (OIP.ANO_EJE=OI.ANO_EJE AND OIP.SEC_EJEC=OI.SEC_EJEC AND OIP.TIPO_BIEN = OI.TIPO_BIEN AND OIP.NRO_ORDEN=OI.NRO_ORDEN AND OIP.SEC_ITEM=OI.SEC_ITEM AND OI.GRUPO_BIEN=DBC.GRUPO_BIEN AND OI.CLASE_BIEN = DBC.CLASE_BIEN AND OI.FAMILIA_BIEN = DBC.FAMILIA_BIEN AND OI.ITEM_BIEN = DBC.ITEM_BIEN)
      INNER JOIN SIG_CONTRATISTAS AS C ON (C.PROVEEDOR=OA.PROVEEDOR)
      INNER JOIN META AS M ON (OIP.ANO_EJE= M.ANO_EJE AND OIP.SEC_EJEC = M.SEC_EJEC AND OIP.SEC_FUNC = M.sec_func)
      INNER JOIN CATALOGO_BIEN_SERV AS CBS ON (CBS.SEC_EJEC=OI.SEC_EJEC AND CBS.TIPO_BIEN = OI.TIPO_BIEN AND CBS.GRUPO_BIEN=DBC.GRUPO_BIEN AND CBS.CLASE_BIEN = DBC.CLASE_BIEN AND CBS.FAMILIA_BIEN = DBC.FAMILIA_BIEN AND CBS.ITEM_BIEN = DBC.ITEM_BIEN)
      INNER JOIN SIG_TAREA AS T ON (T.ANO_EJE= D.ANO_EJE AND T.SEC_EJEC = D.SEC_EJEC AND T.tipo_tarea=D.TIPO_TAREA AND T.nivel_tarea =D.NIVEL_TAREA AND T.tarea_general=D.CODIGO_TAREA)
      INNER JOIN SIG_CENTRO_COSTO AS CC ON (CC.ANO_EJE = D.ANO_EJE AND CC.SEC_EJEC=D.SEC_EJEC AND CC.CENTRO_COSTO = D.CENTRO_COSTO)
      INNER JOIN SIG_CLASIFICADOR_GASTO AS CCBS ON (CCBS.ANO_EJE=OIP.ANO_EJE AND CCBS.CLASIFICADOR=OIP.CLASIFICADOR)
      WHERE OA.ANO_EJE='2024' AND OA.TIPO_BIEN='B'
      GROUP BY OA.ANO_EJE, D.TIPO_BIEN, OA.NRO_ORDEN, OA.FECHA_ORDEN, OA.EXP_SIAF, OA.CONCEPTO, OIP.CLASIFICADOR, CCBS.NOMBRE_CLASIF, D.SECUENCIA, C.NRO_RUC, C.NOMBRE_PROV, 
      CBS.NOMBRE_ITEM, CC.CENTRO_COSTO, CC.NOMBRE_DEPEND, T.nombre, OI.PREC_TOT_SOLES, OA.TOTAL_FACT_SOLES, OA.NRO_CERTIFICA, OI.CUSER_ID
      ORDER BY OA.NRO_ORDEN DESC
        `);

    const existingOrders = await models.orden_compra.findAll({
      where: {
        nro_orden: resultados.map((item) => item.NRO_ORDEN),
        tipo_bien: resultados.map((item) => item.TIPO_BIEN),
        secuencia: resultados.map((item) => item.SECUENCIA),
        ano_eje: resultados.map((item) => item.ANO_EJE),
      },
    });

    const newOrders = [];
    const ordersToUpdate = [];

    resultados.forEach((item) => {
      const existingOrder = existingOrders.find(
        (order) =>
          order.nro_orden === item.NRO_ORDEN &&
          order.tipo_bien === item.TIPO_BIEN &&
          order.secuencia === item.SECUENCIA &&
          order.ano_eje === item.ANO_EJE
      );

      const orderData = {
        nro_orden: item.NRO_ORDEN,
        secuencia: item.SECUENCIA,
        tipo_bien: item.TIPO_BIEN,
        ano_eje: item.ANO_EJE,
        fecha_orden: item.FECHA_ORDEN,
        exp_siaf: item.EXP_SIAF,
        concepto: item.CONCEPTO,
        clasificador: item.CLASIFICADOR,
        nombre_clasif: item.NOMBRE_CLASIF,
        nro_ruc: item.NRO_RUC,
        nombre_prov: item.NOMBRE_PROV,
        nombre_depend: item.NOMBRE_DEPEND,
        nombre: item.NOMBRE_ITEM,
        precio_total_orden: item.TOTAL_FACT_SOLES,
        nro_certifica: item.NRO_CERTIFICA,
        cuser_id: item.CUSER_ID,
        precio_bien: item.PREC_TOT_SOLES,
        centro_costo: item.CENTRO_COSTO,
      };

      if (existingOrder) {
        // Añadir al array de actualización
        ordersToUpdate.push({ ...orderData, id: existingOrder.id });
      } else {
        // Añadir al array de nuevos registros
        newOrders.push(orderData);
      }
    });

    // Crear nuevos registros
    if (newOrders.length > 0) {
      await models.orden_compra.bulkCreate(newOrders);
    }

    // Actualizar los registros existentes
    for (const order of ordersToUpdate) {
      await models.orden_compra.update(
        {
          fecha_orden: order.fecha_orden,
          exp_siaf: order.exp_siaf,
          concepto: order.concepto,
          clasificador: order.clasificador,
          nombre_clasif: order.nombre_clasif,
          nro_ruc: order.nro_ruc,
          nombre_prov: order.nombre_prov,
          nombre_depend: order.nombre_depend,
          nombre: order.nombre_item,
          precio_total_orden: order.precio_total_orden,
          nro_certifica: order.nro_certifica,
          cuser_id: order.cuser_id,
          precio_bien: order.precio_bien,
          centro_costo: order.centro_costo,
          ano_eje: order.ano_eje,
        },
        { where: { id: order.id } }
      );
    }

    res.status(200).json({ message: "Datos actualizados correctamente" });
  } catch (error) {
    res.status(500).json();
    console.log(error);
  }
};
// Obtener todos los bienes que no tienen estado
const getBienes = async (req, res, next) => {
  try {
    const token = req.cookies.tokenSession;
    if (!token) {
      return res.status(403).json({ msg: "No autorizado, token faltante" });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { centro_costo, flag_ccosto } = decoded; // Extraer centro_costo y flag_ccosto del token
    let resultados;
    if (flag_ccosto === "S") {
      resultados = await models.orden_compra.findAll({
        where: {
          tipo_bien: "B",
          ano_eje: dayjs().year(),
          // Excluir las órdenes que tienen un estado relacionado
          [Op.not]: [
            sequelize.literal(`
              EXISTS (
                SELECT 1 FROM estados 
                WHERE estados.orden_compra_id = orden_compra.id
              )
            `),
          ],
        },
        // order: ["nro_orden", "DESC"]
      });
    } else {
      resultados = await models.orden_compra.findAll({
        where: {
          tipo_bien: "B",
          ano_eje: dayjs().year(),
          centro_costo: {
            [Op.in]: JSON.parse(centro_costo), // Usar Op.in para buscar centros de costo en el array
          },
          // Excluir las órdenes que tienen un estado relacionado
          [Op.not]: [
            sequelize.literal(`
              EXISTS (
                SELECT 1 FROM estados 
                WHERE estados.orden_compra_id = orden_compra.id
              )
            `),
          ],
        },
        // order: ["nro_orden", "DESC"]
      });
    }

    const agrupadoPorCentroCosto = resultados.reduce((acc, item) => {
      const nombreDepend = item.nombre_depend;
      const nroOrden = item.nro_orden;

      // Si no existe el centro_costo en el objeto acumulador, crear uno
      if (!acc[nombreDepend]) {
        acc[nombreDepend] = {};
      }

      // Si no existe el nro_orden en el centro_costo, crear uno
      if (!acc[nombreDepend][nroOrden]) {
        acc[nombreDepend][nroOrden] = {
          fecha_orden: item.fecha_orden,
          concepto: item.concepto,
          nombre_prov: item.nombre_prov,
          id: item.id,
          nro_orden: item.nro_orden,
          nombre_depend: item.nombre_depend,
          centro_costo: item.centro_costo,
          ITEMS: [], // Agregar una propiedad para almacenar los bienes
        };
      }

      // Agregar el item a la lista de ITEMS dentro del nro_orden
      acc[nombreDepend][nroOrden].ITEMS.push({
        secuencia: item.secuencia,
        nombre: item.nombre,
        precio_bien: item.precio_bien,
      });

      return acc;
    }, {});
    const totalOrdenesAgrupadas = Object.values(agrupadoPorCentroCosto).reduce(
      (total, centro) => total + Object.keys(centro).length,
      0
    ); // Convertir el objeto agrupado en un formato adecuado para la respuesta
    const resultado = Object.entries(agrupadoPorCentroCosto).map(
      ([centro_costo, ordenes]) => ({
        centro_costo,
        cantidadOrdenes: totalOrdenesAgrupadas,
        ordenes: Object.values(ordenes).sort(
          (a, b) => b.nro_orden - a.nro_orden
        ),
      })
    );
    return res.status(200).json({ data: resultado });
  } catch (error) {
    res.status(500).json();
    console.log(error);
  }
};
// Obtener los bienes que cambio estado a recepcionaod
const getBienesRecepcionados = async (req, res) => {
  try {
    const token = req.cookies.tokenSession;
    if (!token) {
      return res.status(403).json({ msg: "No autorizado, token faltante" });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { centro_costo, flag_ccosto } = decoded; // Extraer centro_costo y flag_ccosto del token

    let resultados;
    if (flag_ccosto === "S") {
      resultados = await models.orden_compra.findAll({
        where: {
          tipo_bien: "B",
          ano_eje: dayjs().year(),
          id: {
            [Op.in]: sequelize.literal(`
              (SELECT orden_compra_id
              FROM estados
              WHERE nombre = 'Recepcionado'
              AND NOT EXISTS (
                SELECT 1 FROM estados e
                WHERE e.orden_compra_id = estados.orden_compra_id
                AND e.nombre = 'Conformidad'
              )) 
            `),
          },
        },

      });
    } else {
      resultados = await models.orden_compra.findAll({
        where: {
          tipo_bien: "B",
          ano_eje: dayjs().year(),
          centro_costo: {
            [Op.in]: JSON.parse(centro_costo), // Usar Op.in para buscar centros de costo en el array
          },
          id: {
            [Op.in]: sequelize.literal(`
              SELECT orden_compra_id
              FROM estados
              WHERE nombre = 'Recepcionado'
              AND orden_compra_id NOT IN (
                SELECT orden_compra_id 
                FROM estados 
                WHERE nombre = 'Conformidad'
              )
            `),
          },
        },

        // order: [["nro_orden", "DESC"]]
      });
    }
    console.log(resultados);
    // Agrupar primero por centro_costo, luego por nro_orden
    const agrupadoPorCentroCosto = resultados.reduce((acc, item) => {
      const nombreDepend = item.nombre_depend;
      const nroOrden = item.nro_orden;

      // Si no existe el centro_costo en el objeto acumulador, crear uno
      if (!acc[nombreDepend]) {
        acc[nombreDepend] = {};
      }

      // Si no existe el nro_orden en el centro_costo, crear uno
      if (!acc[nombreDepend][nroOrden]) {
        acc[nombreDepend][nroOrden] = {
          fecha_orden: item.fecha_orden,
          concepto: item.concepto,
          nombre_prov: item.nombre_prov,
          id: item.id,
          nro_orden: item.nro_orden,
          centro_costo: item.centro_costo,
          ITEMS: [], // Agregar una propiedad para almacenar los bienes
        };
      }

      // Agregar el item a la lista de ITEMS dentro del nro_orden
      acc[nombreDepend][nroOrden].ITEMS.push({
        secuencia: item.secuencia,
        nombre: item.nombre,
        precio_bien: item.precio_bien,
      });

      return acc;
    }, {});

    const totalOrdenesAgrupadas = Object.values(agrupadoPorCentroCosto).reduce(
      (total, centro) => total + Object.keys(centro).length,
      0
    );

    // Convertir el objeto agrupado en un formato adecuado para la respuesta
    const resultado = Object.entries(agrupadoPorCentroCosto).map(
      ([centro_costo, ordenes]) => ({
        centro_costo,
        cantidadOrdenes: totalOrdenesAgrupadas,
        ordenes: Object.values(ordenes).sort(
          (a, b) => b.nro_orden - a.nro_orden
        ),
      })
    );

    return res.status(200).json({ data: resultado });
  } catch (error) {
    res.status(500).json();
    console.log(error);
  }
};

// Obtener los bienes que ya fueron recepcionados y ademas se les dio conformidad
const getBienesConConformidad = async (req, res) => {
  try {
    const token = req.cookies.tokenSession;
    if (!token) {
      return res.status(403).json({ msg: "No autorizado, token faltante" });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { centro_costo, flag_ccosto } = decoded; // Extraer centro_costo y flag_ccosto del token

    let resultados;
    if (flag_ccosto === "S") {
      resultados = await models.orden_compra.findAll({
        where: {
          tipo_bien: "B", // Filtrar solo los registros donde 'tipo_bien' es igual a 'B'
          ano_eje: dayjs().year(), // Filtrar solo los registros donde 'ano_eje' es igual al año actual

          // Incluir solo las órdenes que tienen ambos estados 'Recepcionado' y 'Conformidad'
          id: {
            [Op.in]: sequelize.literal(`
              (SELECT orden_compra_id
              FROM estados
              WHERE nombre = 'Recepcionado'
              AND EXISTS (
                SELECT 1 FROM estados e
                WHERE e.orden_compra_id = estados.orden_compra_id
                AND e.nombre = 'Conformidad'
              )) 
            `),
          },
        },
      });
    } else {
      resultados = await models.orden_compra.findAll({
        where: {
          tipo_bien: "B", // Filtrar solo los registros donde 'tipo_bien' es igual a 'B'
          ano_eje: dayjs().year(), // Filtrar solo los registros donde 'ano_eje' es igual al año actual
          centro_costo: {
            [Op.in]: JSON.parse(centro_costo), // Usar Op.in para buscar centros de costo en el array
          },

          // Incluir solo las órdenes que tienen ambos estados 'Recepcionado' y 'Conformidad'
          id: {
            [Op.in]: sequelize.literal(`
              (SELECT orden_compra_id
              FROM estados
              WHERE nombre = 'Recepcionado'
              AND EXISTS (
                SELECT 1 FROM estados e
                WHERE e.orden_compra_id = estados.orden_compra_id
                AND e.nombre = 'Conformidad'
              ))  -- Aquí aseguramos que la subconsulta esté dentro de paréntesis
            `),
          },
        },
      });
    }

    // Agrupar primero por centro_costo, luego por nro_orden
    const agrupadoPorCentroCosto = resultados.reduce((acc, item) => {
      const nombreDepend = item.nombre_depend;
      const nroOrden = item.nro_orden;

      // Si no existe el centro_costo en el objeto acumulador, crear uno
      if (!acc[nombreDepend]) {
        acc[nombreDepend] = {};
      }

      // Si no existe el nro_orden en el centro_costo, crear uno
      if (!acc[nombreDepend][nroOrden]) {
        acc[nombreDepend][nroOrden] = {
          fecha_orden: item.fecha_orden,
          concepto: item.concepto,
          nombre_prov: item.nombre_prov,
          id: item.id,
          nro_orden: item.nro_orden,
          centro_costo: item.centro_costo,
          ITEMS: [], // Agregar una propiedad para almacenar los bienes
        };
      }

      // Agregar el item a la lista de ITEMS dentro del nro_orden
      acc[nombreDepend][nroOrden].ITEMS.push({
        secuencia: item.secuencia,
        nombre: item.nombre,
        precio_bien: item.precio_bien,
      });

      return acc;
    }, {});

    // Obtener el total de órdenes agrupadas
    const totalOrdenesAgrupadas = Object.values(agrupadoPorCentroCosto).reduce(
      (total, centro) => total + Object.keys(centro).length,
      0
    );

    // Convertir el objeto agrupado en un formato adecuado para la respuesta
    const resultado = Object.entries(agrupadoPorCentroCosto).map(
      ([centro_costo, ordenes]) => ({
        centro_costo,
        cantidadOrdenes: totalOrdenesAgrupadas,
        ordenes: Object.values(ordenes).sort(
          (a, b) => b.nro_orden - a.nro_orden
        ),
      })
    );

    return res.status(200).json({ data: resultado });
  } catch (error) {
    res.status(500).json();
    console.log(error);
  }
};
//Obtener los bienes recepcionados y con conformidad para hacer el seguimiento en linea de tiempo
const getBienesCompletado = async (req, res) => {
  try {
    const token = req.cookies.tokenSession;
    if (!token) {
      return res.status(403).json({ msg: "No autorizado, token faltante" });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { centro_costo, flag_ccosto } = decoded; // Extraer centro_costo y flag_ccosto del token

    let resultados;
    if (flag_ccosto === "S") {
      resultados = await models.orden_compra.findAll({
        where: {
          tipo_bien: "B", // Filtrar solo los registros donde 'tipo_bien' es igual a 'B'
          ano_eje: dayjs().year(), // Filtrar solo los registros donde 'ano_eje' es igual al año actual

          // Incluir solo las órdenes que tienen ambos estados 'Recepcionado' y 'Conformidad'
          id: {
            [Op.in]: sequelize.literal(`
              (SELECT orden_compra_id
              FROM estados
              WHERE nombre = 'Recepcionado'
              AND EXISTS (
                SELECT 1 FROM estados e
                WHERE e.orden_compra_id = estados.orden_compra_id
                AND e.nombre = 'Conformidad'
              ))  -- Aquí aseguramos que la subconsulta esté dentro de paréntesis
            `),
          },
        },
      });
    } else {
      resultados = await models.orden_compra.findAll({
        where: {
          tipo_bien: "B", // Filtrar solo los registros donde 'tipo_bien' es igual a 'B'
          ano_eje: dayjs().year(), // Filtrar solo los registros donde 'ano_eje' es igual al año actual
          centro_costo: {
            [Op.in]: JSON.parse(centro_costo), // Usar Op.in para buscar centros de costo en el array
          },

          // Incluir solo las órdenes que tienen ambos estados 'Recepcionado' y 'Conformidad'
          id: {
            [Op.in]: sequelize.literal(`
              (SELECT orden_compra_id
              FROM estados
              WHERE nombre = 'Recepcionado'
              AND EXISTS (
                SELECT 1 FROM estados e
                WHERE e.orden_compra_id = estados.orden_compra_id
                AND e.nombre = 'Conformidad'
              ))  -- Aquí aseguramos que la subconsulta esté dentro de paréntesis
            `),
          },
        },
      });
    }

    // Agrupar primero por centro_costo, luego por nro_orden
    const agrupadoPorCentroCosto = resultados.reduce((acc, item) => {
      const nombreDepend = item.nombre_depend;
      const nroOrden = item.nro_orden;

      // Si no existe el centro_costo en el objeto acumulador, crear uno
      if (!acc[nombreDepend]) {
        acc[nombreDepend] = {};
      }

      // Si no existe el nro_orden en el centro_costo, crear uno
      if (!acc[nombreDepend][nroOrden]) {
        acc[nombreDepend][nroOrden] = {
          fecha_orden: item.fecha_orden,
          concepto: item.concepto,
          nombre_prov: item.nombre_prov,
          id: item.id,
          nro_orden: item.nro_orden,
          centro_costo: item.centro_costo,
          ITEMS: [], // Agregar una propiedad para almacenar los bienes
        };
      }

      // Agregar el item a la lista de ITEMS dentro del nro_orden
      acc[nombreDepend][nroOrden].ITEMS.push({
        secuencia: item.secuencia,
        nombre: item.nombre,
        precio_bien: item.precio_bien,
      });

      return acc;
    }, {});

    // Obtener el total de órdenes agrupadas
    const totalOrdenesAgrupadas = Object.values(agrupadoPorCentroCosto).reduce(
      (total, centro) => total + Object.keys(centro).length,
      0
    );

    // Convertir el objeto agrupado en un formato adecuado para la respuesta
    const resultado = Object.entries(agrupadoPorCentroCosto).map(
      ([centro_costo, ordenes]) => ({
        centro_costo,
        cantidadOrdenes: totalOrdenesAgrupadas,
        ordenes: Object.values(ordenes).sort(
          (a, b) => b.nro_orden - a.nro_orden
        ),
      })
    );

    return res.status(200).json({ data: resultado });
  } catch (error) {
    res.status(500).json();
    console.log(error);
  }
};

module.exports = {
  getBienes,
  registrarBienesEnBd,
  getBienesRecepcionados,
  getBienesConConformidad,
};