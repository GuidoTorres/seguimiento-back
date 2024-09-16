const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "rol_permiso",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
      rol_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      permiso_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "rol_permiso", // Nombre explícito de la tabla
      timestamps: true, // Para habilitar createdAt y updatedAt
    }
  );
};
