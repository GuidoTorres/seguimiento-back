const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "estados",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(45),
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
      fecha: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      hora: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      orden_compra_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      completado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      comentarios: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nro_orden: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "estados", // Nombre explícito de la tabla
      timestamps: true, // Para habilitar createdAt y updatedAt
    }
  );
};
