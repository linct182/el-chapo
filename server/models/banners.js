module.exports = (sequelize, DataTypes) => {
  const banners = sequelize.define('banners', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_home: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
  return banners;
};