const { QueryTypes } = require("sequelize");
const dayjs = require("dayjs");
const sequelize = require("../../config/database");
const { models: db } = require("../../config/database1");
// Variables para control de sincronización
let lastSyncTime = 0;
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos

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

    // Combinar datos
    const datosCombinados = datosAPI.map((item) => {
      const local = localesMap.get(item.SEC_SOL_MOD) || {
        estado: "pendiente",
        pdf: null,
      };

      return {
        id: local.id, // Incluir el ID autoincrementable
        secSolMod: item.SEC_SOL_MOD,
        sbn: item.SBN,
        glosa: item.GLOSA,
        nombreItem: item.NOMBRE_ITEM,
        nombreDependencia: item.NOMBRE_DEPEND,
        estado: local.estado,
        pdf: local.pdf,
        tipo: local.tipo,
      };
    });

    return res.json(datosCombinados);
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
    const file = req.file; // Multer guarda el archivo en `req.file`
    const id = req.body.id;

    if (!file) {
      return res.status(400).json({ msg: "No se ha subido ningún archivo PDF." });
    }
    console.log(file);
    
    // Guarda la ruta del archivo en la base de datos
    await db.cotizaciones.update(
      { pdf: file.path }, // Guarda la ruta completa
      {
        where: { id: id },
      }
    );

    return res.status(200).json({ msg: "Pdf guardado con éxito!" });
  } catch (error) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
    return res.status(500).json({ msg: "No se pudo guardar el pdf." });
  }
};

const updatePublicacion = async (req, res) => {
  try {
    const id = req.query.id;

    // Guarda la ruta del archivo en la base de datos
    await db.cotizaciones.update(
      { estado: "completado" }, // Guarda la ruta completa
      {
        where: { id: id },
      }
    );

    return res.status(200).json({ msg: "Publicado con éxito!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "No se pudo publicar." });
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
      where: { tipo, estado: "completado" },
      raw: true,
      order: [["sec_sol_mod", "DESC"]],
    });

    // Crear map de datos locales
    const localesMap = new Map(
      datosLocales.map((item) => [item.sec_sol_mod, item])
    );

    // Combinar datos
    const datosCombinados = datosAPI.map((item) => {
      const local = localesMap.get(item.SEC_SOL_MOD) || {
        estado: "pendiente",
        pdf: null,
      };

      return {
        id: local.id, // Incluir el ID autoincrementable
        secSolMod: item.SEC_SOL_MOD,
        sbn: item.SBN,
        glosa: item.GLOSA,
        nombreItem: item.NOMBRE_ITEM,
        nombreDependencia: item.NOMBRE_DEPEND,
        estado: local.estado,
        pdf: local.pdf ? `http://localhost:3001/${local.pdf.replace(/\\/g, '/')}` : null, // Convertir solo si existe `pdf`
        tipo: local.tipo,
      };
    }).filter(item => item.estado === "completado");;

    return res.json(datosCombinados);
  } catch (error) {
    console.error("Error en getCotizaciones:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener cotizaciones",
      error: error.message,
    });
  }

};




module.exports = {
  getCotizaciones,
  updatePdf,
  updatePublicacion,
  getCotizacionCompleta
};
