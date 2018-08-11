module.exports = (sequelize, DataTypes) => {
  const case_logs = sequelize.define('case_logs', {
    case_uuid: {
      type: DataTypes.UUID
    },
    agent_id: {
      type: DataTypes.INTEGER,
    },
    details: {
      type: DataTypes.TEXT,
    },
  });
  
  case_logs.associate = (models) => {
    // associations can be defined here
    case_logs.belongsTo(models.cases, {
      foreignKey: 'case_uuid',
      targetKey: 'case_uuid'
    });

    case_logs.belongsTo(models.users, {
      foreignKey: 'agent_id',
      as: 'agent'
    });
  };
  
  return case_logs;
};