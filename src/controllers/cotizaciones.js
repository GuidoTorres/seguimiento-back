const { QueryTypes } = require("sequelize");
const dayjs = require("dayjs");
const sequelize = require("../../config/database");
const { models: db } = require("../../config/database1");
const customParseFormat = require('dayjs/plugin/customParseFormat');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
// Variables para control de sincronización
let lastSyncTime = 0;
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
dayjs.extend(customParseFormat);
const obtenerDatosAPI = async (tipo) => {
  const datosApi = await sequelize.query(
    `
        SELECT SM.SEC_SOL_MOD, SM.GLOSA, 
               CONCAT(CBS.GRUPO_BIEN, CBS.CLASE_BIEN, CBS.FAMILIA_BIEN,CBS.ITEM_BIEN) AS SBN, 
               CBS.NOMBRE_ITEM, UM.NOMBRE, CMD.TIPO_BIEN, CC.NOMBRE_DEPEND 
        FROM
            SIG_SOLICITUD_MODIFICACION AS SM
            INNER JOIN SIG_SOLICITUD_MODIFICACION_DET AS SMD ON (SM.ANNO_EJEC=SMD.ANNO_EJEC AND SM.SEC_EJEC =SMD.SEC_EJEC AND SM.SEC_SOL_MOD=SMD.SEC_SOL_MOD)
            INNER JOIN SIG_CUADRO_MODIFICADO_DET AS CMD ON (CMD.SEC_EJEC= SMD.SEC_EJEC AND CMD.ANNO_EJEC=SMD.ANNO_EJEC AND CMD.CENTRO_COSTO=SMD.CENTRO_COSTO AND CMD.SEC_CUADRO=SMD.SEC_CUADRO AND CMD.SEC_ITEM=SMD.SEC_ITEM AND CMD.ANNO_PROG=SMD.ANNO_PROG)
            INNER JOIN CATALOGO_BIEN_SERV AS CBS ON (CBS.SEC_EJEC=CMD.SEC_EJEC AND CBS.TIPO_BIEN = CMD.TIPO_BIEN AND CBS.GRUPO_BIEN=CMD.GRUPO_BIEN AND CBS.CLASE_BIEN = CMD.CLASE_BIEN AND CBS.FAMILIA_BIEN = CMD.FAMILIA_BIEN AND CBS.ITEM_BIEN = CMD.ITEM_BIEN)
            INNER JOIN SIG_CENTRO_COSTO AS CC ON (CC.ANO_EJE = CMD.ANNO_EJEC AND CC.SEC_EJEC=CMD.SEC_EJEC AND CC.CENTRO_COSTO = CMD. CENTRO_COSTO)
            INNER JOIN unidad_medida AS UM ON (UM.UNIDAD_MEDIDA= CMD.UNIDAD_MEDIDA)
        WHERE
            SM.SEC_EJEC=1137 AND SM.ANNO_EJEC=2024 AND SMD.ANNO_PROG=2024 
            AND SM.ESTADO IN ('2') AND CMD.TIPO_BIEN=:tipo
        ORDER BY SM.SEC_SOL_MOD DESC`,
    {
      replacements: { tipo },
      type: QueryTypes.SELECT,
    }

  );
  return datosApi || [];
};

const sincronizarCotizaciones = async () => {
  try {
    // Sincronizar tanto bienes como servicios
    const datosBienes = await obtenerDatosAPI("B");
    const datosServicios = await obtenerDatosAPI("S");

    console.log("Datos Bienes:", datosBienes.length);
    console.log("Datos Servicios:", datosServicios.length);

    // Combinar los datos
    const todosLosDatos = [
      ...(Array.isArray(datosBienes) ? datosBienes : []).map((item) => ({
        ...item,
        tipo: "B",
      })),
      ...(Array.isArray(datosServicios) ? datosServicios : []).map((item) => ({
        ...item,
        tipo: "S",
      })),
    ];

    // Obtener datos existentes
    const datosLocales = await db.cotizaciones.findAll({
      attributes: ["sec_sol_mod", "tipo"],
      raw: true,
    });

    // Crear un Set para búsqueda rápida
    const datosLocalesSet = new Set(
      datosLocales.map((item) => `${item.sec_sol_mod}-${item.tipo}`)
    );

    // Preparar registros nuevos
    const nuevosRegistros = todosLosDatos
      .filter(
        (item) => !datosLocalesSet.has(`${item.SEC_SOL_MOD}-${item.tipo}`)
      )
      .map((item) => ({
        sec_sol_mod: item.SEC_SOL_MOD,
        sbn: item.SBN,
        tipo: item.tipo,
        estado: "pendiente",
        anio: dayjs().format("YYYY"),
        plazo: 2
      }));

    // Insertar nuevos registros en lote
    if (nuevosRegistros.length > 0) {
      try {
        await db.cotizaciones.bulkCreate(nuevosRegistros, {
          ignoreDuplicates: true, // Ignorar registros duplicados en lugar de fallar
        });
        console.log(`Sincronizados ${nuevosRegistros.length} nuevos registros`);
      } catch (error) {
        console.error("Error en bulkCreate:", error);
        // Intentar insertar uno por uno si falla el bulk
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
      where: { tipo },
      raw: true,
      order: [["sec_sol_mod", "DESC"]],
    });

    // Crear map de datos locales
    const localesMap = new Map(
      datosLocales.map((item) => [item.sec_sol_mod, item])
    );

    // Primero combinamos y luego agrupamos
    const datosCombinados = datosAPI.reduce((acc, item) => {
      const local = localesMap.get(item.SEC_SOL_MOD) || {
        estado: "pendiente",
        pdf: null,
      };

      // Obtener el grupo actual o crear uno nuevo
      const grupo = acc.find(g => g.secSolMod === item.SEC_SOL_MOD);

      if (grupo) {
        // Si el grupo existe, agregamos el item
        grupo.items.push({
          sbn: item.SBN,
          nombreItem: item.NOMBRE_ITEM,
          unidadMedida: item.NOMBRE || 'UNIDAD',
          cantidad: item.CANTIDAD || 1,
          precioUnitario: item.PRECIO_UNITARIO || 0,
          valorTotal: item.VALOR_TOTAL || 0
        });
      } else {
        // Si el grupo no existe, creamos uno nuevo
        acc.push({
          id: local.id,
          secSolMod: item.SEC_SOL_MOD,
          glosa: local.glosa ? local.glosa : item.GLOSA,
          nombreDependencia: item.NOMBRE_DEPEND,
          estado: local.estado,
          pdf: local.pdf,
          tipo: local.tipo,
          fechaRegistro: item.FECHA_REG,
          plazo: local.plazo,
          items: [{
            sbn: item.SBN,
            nombreItem: item.NOMBRE_ITEM,
            unidadMedida: item.NOMBRE || 'UNIDAD',
            cantidad: item.CANTIDAD || 1,
            precioUnitario: item.PRECIO_UNITARIO || 0,
            valorTotal: item.VALOR_TOTAL || 0
          }]
        });
      }

      return acc;
    }, []);

    // Calculamos totales para cada grupo
    const datosFinales = datosCombinados.map(grupo => ({
      ...grupo,
      totalItems: grupo.items.length,
      valorTotal: grupo.items.reduce((sum, item) => sum + (item.valorTotal || 0), 0),
    }));

    return res.json(datosFinales);

  } catch (error) {
    console.error("Error en getCotizaciones:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener cotizaciones",
      error: error.message,
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
        msg: "No se ha subido ningún archivo PDF."
      });
    }

    // Buscar la publicación en la base de datos
    const publicacionActual = await db.cotizaciones.findOne({
      where: { id },
    });

    if (!publicacionActual) {
      return res.status(404).json({
        success: false,
        msg: "Cotización no encontrada."
      });
    }

    // Generar un nombre de archivo único
    const timestamp = Date.now();
    const newFileName = `cotizacion_${id}_${timestamp}.pdf`;
    const newPath = path.join('uploads', 'cotizaciones', newFileName);

    // Crear el directorio de subida si no existe
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'cotizaciones');
    if (!fsSync.existsSync(uploadDir)) {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Mover el archivo desde la carpeta temporal a la carpeta de destino
    await fs.rename(file.path, path.join(uploadDir, newFileName));

    // Intentar eliminar el PDF anterior si existe
    if (publicacionActual.pdf) {
      const oldPath = path.join(__dirname, '..', '..', publicacionActual.pdf);
      if (fsSync.existsSync(oldPath)) {
        try {
          await fs.unlink(oldPath);
        } catch (deleteError) {
          console.error('Error al eliminar PDF anterior:', deleteError);
        }
      }
    }

    // Actualizar el registro en la base de datos con la nueva ruta del PDF
    await publicacionActual.update({
      pdf: newPath,
      updated_at: new Date()
    });

    return res.status(200).json({
      success: true,
      msg: "PDF actualizado con éxito!",
      data: {
        id,
        path: newPath // Corregir el acceso a newPath
      }
    });

  } catch (error) {
    console.error("Error en updatePdf:", error);

    // Eliminar el archivo temporal en caso de error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error al limpiar archivo:', cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      msg: "Error al actualizar el PDF.",
      error: error.message
    });
  }
};

const updateGlosa = async (req, res) => {
  try {
    const glosa = req.body.glosa; // Multer guarda el archivo en `req.file`
    const id = req.body.id;
    const plazo = req.body.plazo

    await db.cotizaciones.update(
      { glosa: glosa, plazo: plazo }, // Guarda la ruta completa
      {
        where: { id: id },
      }
    );
    return res.status(200).json(
      { msg: "Actualizado con éxito!" }

    );

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "No se pudo actualizar." });
  }
}

const updatePublicacion = async (req, res) => {
  try {
    const { id, tipo } = req.query;

    // Primero, obtener el estado actual de la publicación
    const publicacionActual = await db.cotizaciones.findOne({
      where: { id: id }
    });

    console.log(publicacionActual.sec_sol_mod);


    if (!publicacionActual) {
      return res.status(404).json({ msg: "Publicación no encontrada." });
    }

    // Determinar el nuevo estado basado en el estado actual
    const nuevoEstado = publicacionActual.estado === "pendiente" ? "completado" : "pendiente";

    // Preparar los datos para la actualización
    const datosActualizacion = {
      estado: nuevoEstado
    };

    // Si el nuevo estado es "completado" y no tiene un correlativo asignado, asignar uno
    if (nuevoEstado === "completado") {
      if (!publicacionActual.correlativo) { // Solo si el correlativo es null o undefined
        const maxCorrelativo = await db.cotizaciones.max('correlativo', {
          where: { tipo: tipo }
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

    await db.cotizaciones.update(
      datosActualizacion,
      {
        where: { id: id },
      }
    );
    console.log(nuevoEstado);

    if (nuevoEstado === 'completado') {
      return res.status(200).json({
        msg: `Se publicó con éxito la solicitud nro ${publicacionActual?.sec_sol_mod}.`,
        nuevoEstado: nuevoEstado
      });

    } else {
      return res.status(200).json({
        msg: `Se retiró con éxito la publicación de la solicitud nro ${publicacionActual?.sec_sol_mod}.`,
        nuevoEstado: nuevoEstado
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
        estado: "completado"
      },
      raw: true,
      order: [["correlativo", "DESC"]],
    });

    // Crear map de datos locales
    const localesMap = new Map(
      datosLocales.map((item) => [item.sec_sol_mod, item])
    );

    // Agrupar y combinar datos
    const grupos = {};

    datosAPI.forEach((item) => {
      const local = localesMap.get(item.SEC_SOL_MOD);

      // Verificar si la fecha de vencimiento ya ha pasado
      // Solo procesar si existe en locales y está completado
      if (local && local.estado === "completado") {
        if (!grupos[item.SEC_SOL_MOD]) {
          const fechaPublicacion = dayjs(local.fecha_publicacion, "DD/MM/YYYY");
          // Añade 2 días para calcular la fecha de vencimiento
          const fechaVencimiento = fechaPublicacion.add(local.plazo, 'day');

          // Compara la fecha de vencimiento con la fecha actual para determinar si ha vencido
          const terminado = fechaVencimiento.isBefore(dayjs(), "day");
          grupos[item.SEC_SOL_MOD] = {
            id: local.id,
            secSolMod: item.SEC_SOL_MOD,
            glosa: local.glosa ? local.glosa : item.GLOSA,
            nombreDependencia: item.NOMBRE_DEPEND,
            estado: local.estado,
            pdf: local.pdf ? `https://requerimientos.pems.pe/${local.pdf.replace(/\\/g, '/')}` : null,
            tipo: local.tipo,
            fechaRegistro: item.FECHA_REG,
            correlativo: local.correlativo,
            fecha: local.fecha_publicacion,
            fecha_vencimiento: fechaVencimiento.format("DD/MM/YYYY"), // Nueva fecha de vencimiento
            terminado: terminado, // Nuevo campo terminado
            items: []
          };
        }

        grupos[item.SEC_SOL_MOD].items.push({
          sbn: item.SBN,
          nombreItem: item.NOMBRE_ITEM,
          unidadMedida: item.NOMBRE || 'UNIDAD',
          cantidad: item.CANTIDAD || 1,
          precioUnitario: item.PRECIO_UNITARIO || 0,
          valorTotal: item.VALOR_TOTAL || 0
        });
      }
    });

    // Convertir el objeto grupos a array y agregar totales
    const datosCombinados = Object.values(grupos).map(grupo => ({
      ...grupo,
      totalItems: grupo.items.length,
      valorTotal: grupo.items.reduce((sum, item) => sum + (item.valorTotal || 0), 0),
    })).sort((a, b) => b.correlativo - a.correlativo).filter(item => !item.terminado);

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
  updateGlosa
};
