const { QueryTypes } = require("sequelize");
const dayjs = require("dayjs");
const sequelize = require("../../config/database");
const { models: db } = require("../../config/database1");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
// Variables para control de sincronización
let lastSyncTime = 0;
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
dayjs.extend(customParseFormat);
const obtenerDatosAPI = async (tipo) => {
  const datosApi = await sequelize.query(
    `
      SELECT        P.NRO_PEDIDO, P.MOTIVO_PEDIDO, CC.NOMBRE_DEPEND, P.TIPO_BIEN
      FROM            SIG_PEDIDOS AS P
                      INNER JOIN SIG_CENTRO_COSTO AS CC ON (CC.ANO_EJE = P.ANO_EJE AND CC.SEC_EJEC=P.SEC_EJEC AND CC.CENTRO_COSTO = P.CENTRO_COSTO)
      WHERE        (P.ANO_EJE = '2025') AND (P.TIPO_BIEN =:tipo)      `,
    {
      replacements: { tipo },
      type: QueryTypes.SELECT,
    }
  );
  return datosApi || [];
};

const sincronizarCotizaciones = async () => {
  try {
    // Sincronizar bienes y servicios
    const datosBienes = await obtenerDatosAPI("B");
    const datosServicios = await obtenerDatosAPI("S");

    console.log("Datos Bienes:", datosBienes.length);
    console.log("Datos Servicios:", datosServicios.length);

    // Combinar los datos
    const todosLosDatos = [
      ...(Array.isArray(datosBienes) ? datosBienes : []).map((item) => ({
        nro_pedido: item.NRO_PEDIDO,
        motivo_pedido: item.MOTIVO_PEDIDO,
        nombre_depend: item.NOMBRE_DEPEND,
        tipo: "B",
        anio: dayjs().format("YYYY"),
      })),
      ...(Array.isArray(datosServicios) ? datosServicios : []).map((item) => ({
        nro_pedido: item.NRO_PEDIDO,
        motivo_pedido: item.MOTIVO_PEDIDO,
        nombre_depend: item.NOMBRE_DEPEND,
        tipo: "S",
        anio: dayjs().format("YYYY"),
      })),
    ];

    // Obtener datos locales
    const datosLocales = await db.cotizaciones.findAll({
      where: { anio: dayjs().format("YYYY") },
      attributes: ["sec_sol_mod", "tipo", "anio"],
      raw: true,
    });

    // Crear un Set para evitar duplicados
    const datosLocalesSet = new Set(
      datosLocales.map(
        (item) => `${item.sec_sol_mod}-${item.tipo}-${item.anio}`
      )
    );

    // Preparar nuevos registros
    const nuevosRegistros = todosLosDatos
      .filter(
        (item) =>
          !datosLocalesSet.has(`${item.nro_pedido}-${item.tipo}-${item.anio}`)
      )
      .map((item) => ({
        sec_sol_mod: item.nro_pedido,
        sbn: null, // Establecer SBN como null o eliminarlo de la tabla
        tipo: item.tipo,
        estado: "pendiente",
        anio: dayjs().format("YYYY"),
        plazo: 2,
      }));

    // Insertar nuevos registros
    if (nuevosRegistros.length > 0) {
      try {
        await db.cotizaciones.bulkCreate(nuevosRegistros, {
          ignoreDuplicates: true,
        });
        console.log(`Sincronizados ${nuevosRegistros.length} nuevos registros`);
      } catch (error) {
        console.error("Error en bulkCreate:", error);
        // Insertar uno por uno en caso de error
        for (const registro of nuevosRegistros) {
          try {
            await db.cotizaciones.create(registro);
          } catch (e) {
            if (!e.name === "SequelizeUniqueConstraintError") {
              console.error(
                `Error insertando registro ${registro.sec_sol_mod}-${registro.tipo}:`,
                e.message
              );
            }
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error en sincronización:", error);
    throw error;
  }
};

const getCotizaciones = async (req, res) => {
  try {
    const { tipo } = req.query;

    // Validar el parámetro `tipo`
    if (!tipo || !["B", "S"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo inválido. Debe ser "B" para bienes o "S" para servicios',
      });
    }

    // Obtener datos desde la API
    const datosAPI = await obtenerDatosAPI(tipo);

    // Obtener datos locales desde la tabla `cotizaciones`
    const datosLocales = await db.cotizaciones.findAll({
      where: { tipo },
      raw: true,
      order: [["sec_sol_mod", "DESC"]],
    });

    // Crear un mapa para acceder rápidamente a los datos locales por `nro_pedido`
    const localesMap = new Map(
      datosLocales.map((item) => [item.sec_sol_mod, item])
    );

    // Combinar los datos
    const datosCombinados = datosAPI.map((item) => {
      const local = localesMap.get(item.NRO_PEDIDO) || {
        id: null,
        estado: "pendiente",
        pdf: null,
        tipo: item.TIPO_BIEN,
        anio: new Date().getFullYear().toString(),
        correlativo: null,
        sbn: null,
        plazo:null
      };

      return {
        secSolMod: item.NRO_PEDIDO,
        glosa: item.MOTIVO_PEDIDO,
        nombreDependencia: item.NOMBRE_DEPEND,
        tipo: local.tipo || item.TIPO_BIEN,
        estado: local.estado,
        pdf: local.pdf,
        id: local.id,
        anio: local.anio,
        correlativo: local.correlativo,
        sbn: local.sbn,
        plazo: local.plazo
      };
    });

    datosCombinados.sort((a, b) => {
      const numA = parseInt(a.secSolMod, 10); // Convertir a número
      const numB = parseInt(b.secSolMod, 10); // Convertir a número
      return numB - numA; // Orden descendente
    });

    res.status(200).json(datosCombinados);
  } catch (error) {
    console.error("Error en getCotizaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las cotizaciones",
    });
  }
};



const updatePdf = async (req, res) => {
  try {
    const file = req.file;
    const { id } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        msg: "No se ha subido ningún archivo PDF.",
      });
    }

    // Buscar la publicación en la base de datos
    const publicacionActual = await db.cotizaciones.findOne({
      where: { id },
    });

    if (!publicacionActual) {
      return res.status(404).json({
        success: false,
        msg: "Cotización no encontrada.",
      });
    }

    // Generar un nombre de archivo único
    const timestamp = Date.now();
    const newFileName = `cotizacion_${id}_${timestamp}.pdf`;
    const newPath = path.join("uploads", "cotizaciones", newFileName);

    // Crear el directorio de subida si no existe
    const uploadDir = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "cotizaciones"
    );
    if (!fsSync.existsSync(uploadDir)) {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Mover el archivo desde la carpeta temporal a la carpeta de destino
    await fs.rename(file.path, path.join(uploadDir, newFileName));

    // Intentar eliminar el PDF anterior si existe
    if (publicacionActual.pdf) {
      const oldPath = path.join(__dirname, "..", "..", publicacionActual.pdf);
      if (fsSync.existsSync(oldPath)) {
        try {
          await fs.unlink(oldPath);
        } catch (deleteError) {
          console.error("Error al eliminar PDF anterior:", deleteError);
        }
      }
    }

    // Actualizar el registro en la base de datos con la nueva ruta del PDF
    await publicacionActual.update({
      pdf: newPath,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      msg: "PDF actualizado con éxito!",
      data: {
        id,
        path: newPath, // Corregir el acceso a newPath
      },
    });
  } catch (error) {
    console.error("Error en updatePdf:", error);

    // Eliminar el archivo temporal en caso de error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error("Error al limpiar archivo:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      msg: "Error al actualizar el PDF.",
      error: error.message,
    });
  }
};

const updateGlosa = async (req, res) => {
  try {
    const glosa = req.body.glosa; // Multer guarda el archivo en `req.file`
    const id = req.body.id;
    const plazo = req.body.plazo;

    await db.cotizaciones.update(
      { glosa: glosa, plazo: plazo }, // Guarda la ruta completa
      {
        where: { id: id },
      }
    );
    return res.status(200).json({ msg: "Glosa actualizada con éxito!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "No se pudo actualizar." });
  }
};

const updatePublicacion = async (req, res) => {
  try {
    const { id, tipo } = req.query;

    // Primero, obtener el estado actual de la publicación
    const publicacionActual = await db.cotizaciones.findOne({
      where: { id: id },
    });

    console.log(publicacionActual.sec_sol_mod);

    if (!publicacionActual) {
      return res.status(404).json({ msg: "Publicación no encontrada." });
    }

    // Determinar el nuevo estado basado en el estado actual
    const nuevoEstado =
      publicacionActual.estado === "pendiente" ? "completado" : "pendiente";

    // Preparar los datos para la actualización
    const datosActualizacion = {
      estado: nuevoEstado,
    };

    // Si el nuevo estado es "completado" y no tiene un correlativo asignado, asignar uno
    if (nuevoEstado === "completado") {
      if (!publicacionActual.correlativo) {
        // Solo si el correlativo es null o undefined
        const maxCorrelativo = await db.cotizaciones.max("correlativo", {
          where: { tipo: tipo },
        });
        const nuevoCorrelativo = maxCorrelativo ? maxCorrelativo + 1 : 1001;
        datosActualizacion.correlativo = nuevoCorrelativo;
      } else {
        datosActualizacion.correlativo = publicacionActual.correlativo;
      }
      datosActualizacion.fecha_publicacion = dayjs().format("DD/MM/YYYY");
    } else {
      datosActualizacion.fecha_publicacion = null;
    }

    await db.cotizaciones.update(datosActualizacion, {
      where: { id: id },
    });
    console.log(nuevoEstado);

    if (nuevoEstado === "completado") {
      return res.status(200).json({
        msg: `Se publicó con éxito la solicitud nro ${publicacionActual?.sec_sol_mod}.`,
        nuevoEstado: nuevoEstado,
      });
    } else {
      return res.status(200).json({
        msg: `Se retiró con éxito la publicación de la solicitud nro ${publicacionActual?.sec_sol_mod}.`,
        nuevoEstado: nuevoEstado,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error al actualizar el estado." });
  }
};

const getCotizacionCompleta = async (req, res) => {
  try {
    const { tipo } = req.query;

    if (!tipo || !["B", "S"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo inválido. Debe ser "B" para bienes o "S" para servicios',
      });
    }

    // Verificar si necesitamos sincronizar
    const shouldSync = Date.now() - lastSyncTime > SYNC_INTERVAL;

    if (shouldSync) {
      await sincronizarCotizaciones();
      lastSyncTime = Date.now();
    }

    // Obtener datos de la API del tipo solicitado
    const datosAPI = await obtenerDatosAPI(tipo);

    // Obtener datos locales del tipo solicitado
    const datosLocales = await db.cotizaciones.findAll({
      where: {
        tipo,
        estado: "completado",
        anio: dayjs().format("YYYY")
      },
      raw: true,
      order: [["correlativo", "DESC"]],
    });

    // Crear map de datos locales
    const localesMap = new Map(
      datosLocales.map((item) => [item.sec_sol_mod, item])
    );

    const datosCombinados = datosAPI.map((item) => {
      // Buscar el dato correspondiente en datosLocales usando el NRO_PEDIDO / sec_sol_mod
      const local = datosLocales.find((local) => local.sec_sol_mod === item.NRO_PEDIDO);
    
      if (local && local.estado === "completado") {
        // Calcular la fecha de vencimiento a partir de la fecha de publicación y el plazo
        const fechaPublicacion = dayjs(local.fecha_publicacion, "DD/MM/YYYY");
        const fechaVencimiento = fechaPublicacion.add(local.plazo || 2, "day"); // Plazo predeterminado de 2 días si no existe
    
        // Verificar si la fecha de vencimiento ha pasado
        const terminado = dayjs().startOf('day').isAfter(fechaVencimiento.endOf('day'));
    
        // Combinar los datos de datosAPI y datosLocales
        return {
          id: local.id,
          secSolMod: item.NRO_PEDIDO, // Usar el NRO_PEDIDO de datosAPI
          glosa: local.glosa || item.MOTIVO_PEDIDO, // Priorizar glosa local si existe
          nombreDependencia: item.NOMBRE_DEPEND,
          estado: local.estado,
          pdf: local.pdf
            ? `https://requerimientos.pems.pe/${local.pdf.replace(/\\/g, "/")}`
            : null,
          tipo: local.tipo,
          fechaRegistro: item.FECHA_REG, // Asegúrate de que FECHA_REG esté en datosAPI
          correlativo: local.correlativo,
          fecha: local.fecha_publicacion, // Fecha de publicación de datosLocales
          fecha_vencimiento: fechaVencimiento.format("DD/MM/YYYY"), // Fecha de vencimiento
          terminado: terminado, // Estado de vencimiento
        };
      }
    
      return null; // Excluir elementos que no estén completados o que no tengan datos locales
    }).filter((item) => item !== null).sort((a, b) => b.correlativo - a.correlativo);

    return res.json(datosCombinados);
  } catch (error) {
    console.error("Error en getCotizacionCompleta:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener cotizaciones completadas",
      error: error.message,
    });
  }
};

module.exports = {
  getCotizaciones,
  updatePdf,
  updatePublicacion,
  getCotizacionCompleta,
  updateGlosa,
};
