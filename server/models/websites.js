module.exports = (sequelize, DataTypes) => {
  const websites = sequelize.define('websites', {
    case_uuid: {
      type: DataTypes.UUID
    },
    name: {
      type: DataTypes.STRING
    },
    status_id: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  });

  websites.associate = (models) => {
    // associations can be defined here
    websites.belongsTo(models.cases, {
      foreignKey: 'case_uuid',
      targetKey: 'case_uuid'
    });

    websites.belongsTo(models.website_status, {
      foreignKey: 'status_id',
      as: 'status'
    });
  };

  return websites;
};