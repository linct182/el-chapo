const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const saltRounds = require('../config/config.json')['salt-rounds'];

module.exports = (sequelize, DataTypes) => {

  const users = sequelize.define('users', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  });

  users.comparePassword = (password, userspassword, callback) => {
    const hash = crypto.createHash('sha384')
      .update(password)
      .digest('hex');

    return bcrypt.compare(hash, userspassword, (error, isMatch) => {
      if (error) { return callback(error); }
      callback(null, isMatch);
    });
  }

  users.associate = (models) => {
    users.belongsTo(models.user_types, {
      foreignKey: 'user_type_id',
      onDelete: 'CASCADE',
    });
  };
  return users;
};