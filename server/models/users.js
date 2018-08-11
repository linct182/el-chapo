const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const saltRounds = require('../config/config.json')['salt-rounds'];

module.exports = (sequelize, DataTypes) => {

  const users = sequelize.define('users', {
    forename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
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
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    braintree_customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bank_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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

    users.hasMany(models.customer_payments, {
      foreignKey: 'user_id',
      as: 'payments',
    });

    users.hasMany(models.case_feedbacks, {
      foreignKey: 'user_id',
      as: 'feedbacks',
    });
  };
  return users;
};