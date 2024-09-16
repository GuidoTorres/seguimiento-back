const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "usuarios",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      centro_costo: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      usuario: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      contrasenia: {
        type: DataTypes.STRING(80),
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
      flag_ccosto: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },

    },
    {
      tableName: "usuarios", // Nombre explícito de la tabla
      timestamps: true, // Para habilitar createdAt y updatedAt
    }
  );
};
