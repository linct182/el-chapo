module.exports = (sequelize, DataTypes) => {
  const website_status = sequelize.define('website_status', {
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
  }, {
    freezeTableName: true,
    tableName: 'website_status'
  });

  website_status.associate = (models) => {
    // associations can be defined here
    website_status.hasMany(models.websites, {
      foreignKey: 'status_id',
      as: 'websites',
    });
  };

  return website_status;
};