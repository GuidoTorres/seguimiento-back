const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SIG_CONTRATO_ITEM_DIST', {
    SEC_EJEC: {
      type: DataTypes.DECIMAL(6,0),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'SIG_CONTRATO_ITEM',
        key: 'TIPO_CONTRATO'
      }
    },
    ANO_EJE: {
      type: DataTypes.DECIMAL(4,0),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'SIG_CONTRATO_ITEM',
        key: 'TIPO_CONTRATO'
      }
    },
    TIPO_CONTRATO: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'SIG_CONTRATO_ITEM',
        key: 'TIPO_CONTRATO'
      }
    },
    NRO_CONTRATO: {
      type: DataTypes.DECIMAL(5,0),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'SIG_CONTRATO_ITEM',
        key: 'TIPO_CONTRATO'
      }
    },
    NRO_ITEM: {
      type: DataTypes.DECIMAL(4,0),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'SIG_CONTRATO_ITEM',
        key: 'TIPO_CONTRATO'
      }
    },
    ANO_PROGRAMACION: {
      type: DataTypes.DECIMAL(4,0),
      allowNull: false,
      primaryKey: true
    },
    FASE_CUADRO: {
      type: DataTypes.DECIMAL(1,0),
      allowNull: false,
      primaryKey: true
    },
    SEC_ITEM_DIST: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false,
      primaryKey: true
    },
    ANNO: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false
    },
    ORIGEN_FF: {
      type: DataTypes.STRING(1),
      allowNull: false
    },
    FUENTE_FINANC: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    SEC_FUNC: {
      type: DataTypes.DECIMAL(4,0),
      allowNull: false
    },
    CLASIFICADOR: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    FECHA_REG: {
      type: DataTypes.DATE,
      allowNull: false
    },
    CUSER_ID: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    EQUIPO_REG: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'SIG_CONTRATO_ITEM_DIST',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_SIG_CONTRATO_ITEM_DIST",
        unique: true,
        fields: [
          { name: "SEC_EJEC" },
          { name: "ANO_EJE" },
          { name: "TIPO_CONTRATO" },
          { name: "NRO_CONTRATO" },
          { name: "NRO_ITEM" },
          { name: "ANO_PROGRAMACION" },
          { name: "FASE_CUADRO" },
          { name: "SEC_ITEM_DIST" },
        ]
      },
    ]
  });
};
