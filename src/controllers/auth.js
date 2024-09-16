const sequelize = require("../../config/database");
const { models } = require("./../../config/database1");
const { tokenSign } = require("../helpers/generateToken");
const { compare } = require("../helpers/handleBcrypt");

const authLogin = async (req, res, next) => {
  try {
    const { usuario, contrasenia } = req.body;

    

    // Buscar el usuario en la base de datos
    const get = await models.usuarios.findOne({
      where: { usuario: usuario },
      attributes: [
        "id",
        "usuario",
        "nombre",
        "contrasenia",
        "centro_costo",
        "flag_ccosto",
        "estado",
      ],
      include: [
        {
          model: models.roles,
          attributes: ["id", "nombre"],
          through: { attributes: [] }, // Excluye la tabla intermedia
          include: [
            {
              model: models.permisos,
              through: { attributes: [] }, // Excluye la tabla intermedia
            },
          ],
        },
      ],
    });

    const rolesNombres = get.roles.map((item) => item.nombre);

    const permisos = [
      ...new Set(
        get.roles
          .map((rol) => rol.permisos.map((permiso) => permiso.nombre))
          .flat()
      ),
    ];

    if (!get) {
      return res
        .status(404)
        .send({ msg: "Usuario no encontrado!", status: 404 });
    }

    // Comparar la contraseña proporcionada con la almacenada en la base de datos
    const checkPassword = await compare(
      contrasenia,
      get.dataValues.contrasenia
    );

    // Verificar si el usuario está inactivo
    if (get.dataValues.estado === "I") {
      return res.status(500).send({ msg: "Usuario inactivo!", status: 500 });
    }

    console.log({
      id: get.id,
      usuario: get.usuario,
      nombre: get.nombre,
      centro_costo: get.centro_costo,
      flag_ccosto: get.flag_ccosto,

    });
    // Si la contraseña es correcta
    if (checkPassword) {
      // Generar el token de sesión (JWT o similar)
      const tokenSession = await tokenSign(get.dataValues);

      // Enviar el token en una cookie HTTP-only
      res.cookie("tokenSession", tokenSession, {
        httpOnly: true, // No accesible desde JavaScript
        secure: false, // Solo se envía en HTTPS si está en producción
        sameSite: "Strict", // Prevenir CSRF
        maxAge: 24 * 60 * 60 * 1000, // 1 día de duración
      });

      // Enviar la respuesta sin el token (solo datos necesarios)
      return res.status(200).send({
        data: {
          id: get.id,
          usuario: get.usuario,
          nombre: get.nombre,
          centro_costo: get.centro_costo,
          flag_ccosto: get.flag_ccosto,
          rol: rolesNombres,
          permisos: permisos,
        },
        msg: `Bienvenido!`,
        status: 200,
      });
    }

    // Si la contraseña es incorrecta
    return res.status(409).send({ msg: "Contraseña incorrecta!", status: 409 });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "Hubo un error.", status: 500 });
  }
};

module.exports = {
  authLogin,
};
