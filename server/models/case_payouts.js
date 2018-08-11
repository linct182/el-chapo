module.exports = (sequelize, DataTypes) => {
  const case_payouts = sequelize.define('case_payouts', {
    amount: {
      type: DataTypes.DECIMAL,
      defaultValue: 0
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  case_payouts.associate = function(models) {
    // associations can be defined here
    case_payouts.belongsTo(models.payout_requests, {
      foreignKey: 'payout_request_id',
      as: 'payout_request'
    });

    case_payouts.belongsTo(models.cases, {
      foreignKey: 'case_uuid',
      targetKey: 'case_uuid'
    });
    
  };
  return case_payouts;
};