const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MPP_PCA_X_GENERICA', {
    ANO_EJE: {
      type: DataTypes.DECIMAL(4,0),
      allowNull: false,
      primaryKey: true
    },
    SEC_EJEC: {
      type: DataTypes.DECIMAL(6,0),
      allowNull: false,
      primaryKey: true
    },
    FUENTE_FINANC: {
      type: DataTypes.STRING(2),
      allowNull: false,
      primaryKey: true
    },
    CATEGORIA: {
      type: DataTypes.STRING(2),
      allowNull: false,
      primaryKey: true
    },
    TIPO_TRANSACCION: {
      type: DataTypes.STRING(1),
      allowNull: false,
      primaryKey: true
    },
    GENERICA: {
      type: DataTypes.STRING(1),
      allowNull: false,
      primaryKey: true
    },
    SIAF_MONTO_ASIGNADO: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    },
    SIAF_MONTO_PRECERTIF: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    },
    SIAF_MONTO_CERTIF: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    },
    SIAF_MONTO_COMPR_ANUAL: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    },
    PPTO_RESER: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    },
    PPTO_RESER_SIAF: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    },
    PPTO_DEF: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    },
    PPTO_DEF_ANUAL: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    },
    PPTO_SALDO_SIAF: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    },
    SIAF_MONTO_COMPR: {
      type: DataTypes.DECIMAL(19,2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'MPP_PCA_X_GENERICA',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_MPP_PCA_X_GENERICA",
        unique: true,
        fields: [
          { name: "ANO_EJE" },
          { name: "SEC_EJEC" },
          { name: "FUENTE_FINANC" },
          { name: "CATEGORIA" },
          { name: "TIPO_TRANSACCION" },
          { name: "GENERICA" },
        ]
      },
    ]
  });
};
