module.exports = (sequelize, DataTypes) => {
  const case_feedbacks = sequelize.define('case_feedbacks', {
    case_uuid: {
      type: DataTypes.UUID
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    feedback: {
      type: DataTypes.TEXT,
    }
  });

  case_feedbacks.associate = (models) => {
    case_feedbacks.belongsTo(models.cases, {
      foreignKey: 'case_uuid',
      as: 'case'
    });

    case_feedbacks.belongsTo(models.users, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return case_feedbacks;
};