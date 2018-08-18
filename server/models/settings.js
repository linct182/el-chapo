module.exports = (sequelize, DataTypes) => {
  const settings = sequelize.define('settings', {
    logo_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    about_us: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  return settings;
};