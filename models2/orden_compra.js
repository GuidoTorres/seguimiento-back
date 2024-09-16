const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "orden_compra",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        
      },
      fecha_orden: {
        type: DataTypes.DATE,
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
      exp_siaf: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      concepto: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      clasificador: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      nombre_clasif: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      nro_ruc: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      nombre_prov: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nombre_depend: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      precio_total_orden: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      precio_bien: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      nro_certifica: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      tipo_bien: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      cuser_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nro_orden: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      centro_costo: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      secuencia: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      ano_eje: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },

    },
    {
      tableName: "orden_compra", // Nombre explícito de la tabla
      timestamps: true, // Para habilitar createdAt y updatedAt
    }
  );
};
