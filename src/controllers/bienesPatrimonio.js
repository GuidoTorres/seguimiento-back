const dayjs = require("dayjs");
const sequelize = require("../../config/database");
const { models1 } = require("./../../config/database");
const { models } = require("./../../config/database1");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const estados = require("../../models2/estados");

const getBienesPatrimonio = async (req, res, next) => {
  try {
    const resultados = await models.orden_compra.findAll({
      attributes: [
        "fecha_orden",
        "concepto",
        "nombre_prov",
        "nombre_depend",
        "nombre",
        "tipo_bien",
        "nro_orden",
        "secuencia",
      ],
      where: {
        tipo_bien: "B",
        ano_eje: dayjs().year(),
        id: {
          [Op.notIn]: sequelize.literal(`
            (SELECT orden_compra_id
            FROM estados
            WHERE nombre = 'Patrimonio')
          `),
        },
      },
    });

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
const getBienesPatrimonalizado = async (req, res) => {
  try {
    const resultados = await models.orden_compra.findAll({
      attributes: [
        "fecha_orden",
        "concepto",
        "nombre_prov",
        "nombre_depend",
        "nombre",
        "tipo_bien",
        "nro_orden",
        "secuencia",
      ],
      where: {
        tipo_bien: "B", // Filtrar solo los registros donde 'tipo_bien' es igual a 'B'
        ano_eje: dayjs().year(), // Filtrar solo los registros donde 'ano_eje' es igual al año actual

        // Incluir solo las órdenes que tienen ambos estados 'Recepcionado' y 'Conformidad'
        id: {
          [Op.in]: sequelize.literal(`
            (SELECT orden_compra_id
            FROM estados
            WHERE nombre = 'Patrimonio')
          `),
        },
      },
    });

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
          estados: item.estados,
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

const actualizarEstadoPatrimonio = async (req, res) => {
  try {
    const token = req.cookies.tokenSession;
    if (!token) {
      return res.status(403).json({ msg: "No autorizado, token faltante" });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded; // Extraer centro_costo y flag_ccosto del token

    const nro_orden = req.params.id;

    const ordenesCompra = await models.orden_compra.findAll({
      where: { nro_orden: nro_orden, ano_eje: dayjs().year() },
    });

    const format = ordenesCompra.map((item) => {
      return {
        orden_compra_id: item.id,
        usuario_id: id,
        ...req.body,
      };
    });

    await models.estados.bulkCreate(format);

    return res.status(200).json({
      msg: `Se patrimonalizó correctamente la orden Nro ${nro_orden}.`,
    });
  } catch (error) {
    res.status(500).json({ msg: "No se pudo actualizar." });
    console.log(error);
  }
};

module.exports = {
  getBienesPatrimonio,
  actualizarEstadoPatrimonio,
  getBienesPatrimonalizado,
};
