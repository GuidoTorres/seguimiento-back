const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SIG_PROPUESTA_ARC_OBS', {
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
    SEC_POS: {
      type: DataTypes.DECIMAL(15,0),
      allowNull: false,
      primaryKey: true
    },
    SECUENCIA: {
      type: DataTypes.DECIMAL(4,0),
      allowNull: false,
      primaryKey: true
    },
    SEC_OBS: {
      type: DataTypes.DECIMAL(15,0),
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'SIG_PROPUESTA_ARC_OBS',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK_SIG_PROPUESTA_ARC_OBS",
        unique: true,
        fields: [
          { name: "ANO_EJE" },
          { name: "SEC_EJEC" },
          { name: "SEC_POS" },
          { name: "SECUENCIA" },
          { name: "SEC_OBS" },
        ]
      },
    ]
  });
};
