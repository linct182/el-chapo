module.exports = (sequelize, DataTypes) => {
  const attachments = sequelize.define('attachments', {
    case_uuid: {
      type: DataTypes.UUID
    },
    user_id: {
      type: DataTypes.INTEGER
    },
    link: {
      type: DataTypes.STRING
    },
    file_name: {
      type: DataTypes.STRING,
      defaultValue: 'Untitled',
    },
    file_type: {
      type: DataTypes.STRING
    }
  });
  
  attachments.associate = function(models) {
    // associations can be defined here
    attachments.belongsTo(models.cases, {
      foreignKey: 'case_uuid',
      targetKey: 'case_uuid'
    });

    attachments.belongsTo(models.users, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return attachments;
};