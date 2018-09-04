module.exports = (sequelize, DataTypes) => {
  const settings = sequelize.define('settings', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    about_us_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    about_us_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    about_us_img: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  return settings;
};