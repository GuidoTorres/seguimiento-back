const { Sequelize } = require("sequelize");
const EstadosModel = require("./estados");
const CentroCostoModel = require("./centro_costo");
const OrdenCompraModel = require("./orden_compra");
const UsuarioCentroCostoModel = require("./usuario_centro_costo");
const UsuarioModel = require("./usuarios");
const RolModel = require("./roles");
const PermisoModel = require("./permisos");
const RolPermisoModel = require("./rol_permiso");
const UsuarioRolModel = require("./usuario_rol");
const CotizacionModel = require("./cotizaciones")

function initModels(sequelize) {
  const Estados = EstadosModel(sequelize, Sequelize);
  const CentroCosto = CentroCostoModel(sequelize, Sequelize);
  const OrdenCompra = OrdenCompraModel(sequelize, Sequelize);
  const Usuario = UsuarioModel(sequelize, Sequelize);
  const UsuarioCentroCosto = UsuarioCentroCostoModel(sequelize, Sequelize);
  const Roles = RolModel(sequelize, Sequelize);
  const Permisos = PermisoModel(sequelize, Sequelize);
  const RolPermiso = RolPermisoModel(sequelize, Sequelize);
  const UsuarioRol = UsuarioRolModel(sequelize, Sequelize);
  const Cotizaciones = CotizacionModel(sequelize, Sequelize);


  Usuario.hasMany(UsuarioCentroCosto, { foreignKey: "usuario_id" });
  CentroCosto.hasMany(UsuarioCentroCosto, { foreignKey: "centro_costo_id" });
  UsuarioCentroCosto.belongsTo(Usuario, { foreignKey: "usuario_id" });
  UsuarioCentroCosto.belongsTo(CentroCosto, { foreignKey: "centro_costo_id" });
  OrdenCompra.hasMany(Estados, { foreignKey: "orden_compra_id" });
  Estados.belongsTo(OrdenCompra, { foreignKey: "orden_compra_id" });
  Usuario.hasMany(Estados, { foreignKey: "usuario_id" });
  Estados.belongsTo(Usuario, { foreignKey: "usuario_id" });
  Roles.hasMany(RolPermiso, { foreignKey: "rol_id" });
  RolPermiso.belongsTo(Roles, { foreignKey: "rol_id" });
  Permisos.hasMany(RolPermiso, { foreignKey: "permiso_id" });
  RolPermiso.belongsTo(Permisos, { foreignKey: "permiso_id" });

  Roles.belongsToMany(Permisos, {
    through: RolPermiso,
    foreignKey: "rol_id",
  });
  Permisos.belongsToMany(Roles, {
    through: RolPermiso,
    foreignKey: "permiso_id",
  });

  Usuario.belongsToMany(Roles, {
    through: UsuarioRol,
    foreignKey: "usuario_id",
  });
  Roles.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: "rol_id" });

  return {
    Estados,
    CentroCosto,
    OrdenCompra,
    Usuario,
    UsuarioCentroCosto,
    Cotizaciones
  };
}

module.exports = initModels;
