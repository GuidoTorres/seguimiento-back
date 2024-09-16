const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "usuario_centro_costo",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      centro_costo_id: {
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
      tableName: "usuario_centro_costo", // Nombre explícito de la tabla
      timestamps: true, // Para habilitar createdAt y updatedAt
    }
  );
};
