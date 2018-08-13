module.exports = (sequelize, DataTypes) => {
  const user_types = sequelize.define('user_types', {
    role: DataTypes.STRING,
    allowNull: false,
  });

  user_types.associate = (models) => {
    user_types.hasMany(models.users, {
      foreignKey: 'user_type_id',
      as: 'users'
    });
  };

  return user_types;
};