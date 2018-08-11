module.exports = (sequelize, DataTypes) => {
  const case_status = sequelize.define('case_status', {
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
  },{
    freezeTableName: true,
    tableName: 'case_status'
  });

  case_status.associate = (models) => {
    // associations can be defined here
    case_status.hasMany(models.cases, {
      foreignKey: 'status_id',
      as: 'cases',
    });
  };

  return case_status;
};