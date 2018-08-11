module.exports = (sequelize, DataTypes) => {
  const customer_payments = sequelize.define('customer_payments', {
    particulars: {
      type: DataTypes.STRING
    },
    transaction_id: {
      type: DataTypes.STRING
    },
    amount: {
      type: DataTypes.DECIMAL
    },
    refunded: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    actual_payment: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    gateway: {
      type: DataTypes.STRING
    },
  });

  customer_payments.associate = (models) => {
    // associations can be defined here
    customer_payments.belongsTo(models.cases, {
      foreignKey: 'case_uuid',
      targetKey: 'case_uuid'
    });

    customer_payments.belongsTo(models.users, {
      foreignKey: 'user_id'
    });
  };

  return customer_payments;
};