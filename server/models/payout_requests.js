module.exports = (sequelize, DataTypes) => {
  const payout_requests = sequelize.define('payout_requests', {
    total_amount: {
      type: DataTypes.DECIMAL,
      defaultValue: 0,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });

  payout_requests.associate = (models) => {
    // associations can be defined here
    payout_requests.belongsTo(models.users, {
      foreignKey: 'agent_id',
      as: 'agent'
    });

    payout_requests.hasMany(models.cases, {
      foreignKey: 'status_id',
      as: 'cases',
    });
  };

  return payout_requests;
};