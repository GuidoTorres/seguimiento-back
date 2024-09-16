const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tmp_techo_fase_5', {
    origen: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    fuente_financ: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    mnto_progra: {
      type: DataTypes.DECIMAL(18,3),
      allowNull: true
    },
    secuencia: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    FASE_CUADRO: {
      type: DataTypes.DECIMAL(1,0),
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
    FUNCION: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    PROGRAMA: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    SEC_FUNC_PROP: {
      type: DataTypes.DECIMAL(4,0),
      allowNull: true
    },
    CENTRO_COSTO: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    CENTRO_COSTO_PRESUP: {
      type: DataTypes.STRING(15),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tmp_techo_fase_5',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "IND_FASE_6",
        fields: [
          { name: "origen" },
          { name: "fuente_financ" },
          { name: "secuencia" },
          { name: "FASE_CUADRO" },
          { name: "CATEG_GASTO" },
          { name: "GRUPO_GASTO" },
          { name: "FUNCION" },
          { name: "PROGRAMA" },
          { name: "SEC_FUNC_PROP" },
          { name: "CENTRO_COSTO" },
          { name: "CENTRO_COSTO_PRESUP" },
        ]
      },
    ]
  });
};
