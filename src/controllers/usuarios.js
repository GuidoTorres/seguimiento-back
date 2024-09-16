const dayjs = require("dayjs");
const sequelize = require("../../config/database");
const { encrypt } = require("../helpers/handleBcrypt");
const { models } = require("./../../config/database");
const { models: db } = require("./../../config/database1");

//Para registrar a los usuarios en la bd en base a las tablas del siga
const getUsuarioEjecutora = async (req, res, next) => {
  try {
    // Obtener los tres conjuntos de datos
    const ejecutora = await models.sig_usuario_ejecutora.findAll({});
    const costo = await models.SIG_USUARIO_CCOSTO.findAll({
      where: { ANO_EJE: dayjs().year() },
      attributes: { exclude: ["id"] },
    });
    const users = await models.users.findAll({
      attributes: { exclude: ["id"] },
    });

    // Crear un objeto combinado basado en cuser_id
    const combinedResults = {};

    // Procesar los datos de `ejecutora`
    for (const item of ejecutora) {
      const contrasenia = await encrypt(item.cuser_id); // Encriptar la contraseña

      // Si el usuario no existe en el objeto, inicializar su registro
      if (!combinedResults[item.cuser_id]) {
        combinedResults[item.cuser_id] = {
          usuario: item.cuser_id,
          contrasenia: contrasenia, // Asignar la contraseña encriptada
          flag_ccosto: item.flag_ccosto,
          estado: item.estado,
          centro_costo: [], // Array para almacenar los centros de costo
          nombre: null, // Campo donde almacenaremos el nombre completo
        };
      }
    }

    // Procesar los datos de `costo` y agregar los centros de costo al array del usuario correspondiente
    costo.forEach((item) => {
      if (combinedResults[item.CUSER_ID]) {
        combinedResults[item.CUSER_ID].centro_costo.push(item.CENTRO_COSTO); // Agregar centro de costo
      }
    });

    // Procesar los datos de `users` para obtener los nombres completos
    users.forEach((item) => {
      const nombre_completo = `${item.APELLIDO_PATERNO || ""} ${
        item.APELLIDO_MATERNO || ""
      } ${item.NOMBRE || ""} ${item.NOMBRE_2 || ""}`.trim();

      if (combinedResults[item.cuser_id]) {
        combinedResults[item.cuser_id].nombre = nombre_completo; // Asignar el nombre completo
      }
    });

    // Convertir el objeto combinado en un array y manejar los centros de costo vacíos
    const data = Object.values(combinedResults).map((usuario) => ({
      ...usuario,
      centro_costo:
        usuario.centro_costo.length === 0
          ? null // Si el array está vacío, poner null
          : JSON.stringify(usuario.centro_costo), // Convertir el array de centros de costo a un string JSON
    }));

    // Guardar los datos en la base de datos (ejemplo con bulkCreate)
    await db.usuarios.bulkCreate(data);
    // Enviar la respuesta al cliente
    return res.status(200).json({ data });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ msg: "No se pudieron crear los usuarios." });
    console.log(error);
  }
};




const getUsuarioCosto = async (req, res, next) => {
  try {
    const get = await models.users.findAll({
      // where: {ANO_EJE: dayjs().year()},
      // attributes: { exclude: ["id"],  },
    });

    // where: {estado:"A"},
    // attributes: ["CENTRO_COSTO", "NOMBRE_DEPEND", "ESTADO", "SEC_EJEC"],

    return res.status(200).json({ data: { costo: get } });
  } catch (error) {
    res.status(500).json();
    console.log(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const get = await models.users.findAll({
      attributes: { exclude: ["id"] },
    });

    return res.status(200).json({ data: { costo: get } });
  } catch (error) {
    res.status(500).json();
    console.log(error);
  }
};

module.exports = {
  getUsuarioEjecutora,
  getUsuarioCosto,
  getUsers,
};
