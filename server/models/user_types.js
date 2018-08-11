module.exports = (sequelize, DataTypes) => {
  const user_types = sequelize.define('user_types', {
    role: DataTypes.STRING
  });

  user_types.associate = (models) => {
    user_types.hasMany(models.users, {
      foreignKey: 'user_type_id',
      as: 'members'
    });
  };

  return user_types;
};