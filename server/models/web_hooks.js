module.exports = (sequelize, DataTypes) => {
  const web_hooks = sequelize.define('web_hooks', {
    hook_name: {
      type: DataTypes.STRING
    },
    raw_data: {
      type: DataTypes.TEXT
    },
  });

  web_hooks.associate = (models) => {
    // associations can be defined here
  };

  return web_hooks;
};