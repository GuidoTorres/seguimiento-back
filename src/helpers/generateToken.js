const jwt = require("jsonwebtoken");

const tokenSign = async (user) => {
  const rolesNombres = user.roles.map((item) => item.nombre);

  const permisos = [
    ...new Set(
      user.roles
        .map((rol) => rol.permisos.map((permiso) => permiso.nombre))
        .flat()
    ),
  ];
  return jwt.sign(
    {
      id: user.id,
      usuario: user.usuario,
      centro_costo: user.centro_costo,
      flag_ccosto: user.flag_ccosto,
      estado: user.estado,
      roles: rolesNombres,
      permisos
    },
    process.env.JWT_SECRET,

  );
};
const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const error = new Error("Token inválido");
      error.status = 409;
      throw error;
    }
    return null;
  }
};

module.exports = { tokenSign, verifyToken };
