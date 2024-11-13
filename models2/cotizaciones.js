const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "cotizaciones",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
      sec_sol_mod: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sbn: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pdf: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tipo: {
        type: DataTypes.STRING(20),
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
      anio: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      correlativo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fecha_publicacion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      plazo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      glosa: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      tableName: "cotizaciones", // Nombre explícito de la tabla
      timestamps: true, // Para habilitar createdAt y updatedAt
      indexes: [
        {
          fields: ["tipo"],
        },
        {
          fields: ["sbn"],
        },
      ],
    }
  );
};
