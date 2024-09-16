const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TEMP_SIG_CUADRO_NECESIDAD', {
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
    CENTRO_COSTO: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true
    },
    SECUENCIA: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false,
      primaryKey: true
    },
    SECUENCIA_COPIA: {
      type: DataTypes.DECIMAL(6,0),
      allowNull: true
    },
    FASE_CUADRO: {
      type: DataTypes.DECIMAL(1,0),
      allowNull: false,
      primaryKey: true
    },
    TIPO_TAREA: {
      type: DataTypes.STRING(1),
      allowNull: false
    },
    NIVEL_TAREA: {
      type: DataTypes.STRING(1),
      allowNull: false
    },
    CODIGO_TAREA: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false
    },
    SEC_FUNC_PROP: {
      type: DataTypes.DECIMAL(4,0),
      allowNull: true
    },
    SEC_FUNC: {
      type: DataTypes.DECIMAL(4,0),
      allowNull: true
    },
    ORIGEN: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    FUENTE_FINANC: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    CONCEPTO_GASTO: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: true
    },
    CATEG_GASTO: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    GRUPO_GASTO: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    CLASIFICADOR: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    TIPO_RECURSO: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    TOTAL_ASIGNADO: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    TOTAL_PROGRA: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    TOTAL_APROB: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    TOTAL_MODIF: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    MONTO_ASIGNADO: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    MONTO_PROGRA: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    MONTO_APROB: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    MONTO_MODIF: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    VALOR_IMP_ASIGNADO: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    VALOR_IMP_PROGRA: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    VALOR_IMP_APROB: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    VALOR_IMP_MODIF: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    TIPO_IMPUESTO: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    FUENTE_IMPTO: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    TASA_IMPTO: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    FLAG_GASTO: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    TIPO_PPTO: {
      type: DataTypes.DECIMAL(1,0),
      allowNull: true
    },
    TIPO_USO: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    EQUIPO_REG: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    FECHA_REG: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CUSER_ID: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    tipo_operacion: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    operacion: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: true
    },
    mayor: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    sub_cta: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    sub_cta_det: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    NRO_PLANTILLA: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: true
    },
    tipo_bien: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    TIPO_ORIGEN_EXTERNO: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    ID_CLASIFICADOR: {
      type: DataTypes.CHAR(7),
      allowNull: true
    },
    sec_establec: {
      type: DataTypes.DECIMAL(6,0),
      allowNull: true
    },
    sub_finalidad: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    flag_origen_cab: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    data_origen: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    fase_copia: {
      type: DataTypes.DECIMAL(1,0),
      allowNull: true
    },
    bd_copia: {
      type: DataTypes.STRING(4),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'TEMP_SIG_CUADRO_NECESIDAD',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_TEMP_SIG_CUADRO_NECESIDAD",
        unique: true,
        fields: [
          { name: "ANO_EJE" },
          { name: "SEC_EJEC" },
          { name: "CENTRO_COSTO" },
          { name: "SECUENCIA" },
          { name: "FASE_CUADRO" },
        ]
      },
    ]
  });
};
