module.exports = (sequelize, DataTypes) => {
  const case_plans = sequelize.define('case_plans', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    min: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });

  case_plans.associate = (models) => {
    // associations can be defined here
    case_plans.hasMany(models.cases, {
      foreignKey: 'plan_id',
      as: 'cases',
    });
  };

  return case_plans;
};

