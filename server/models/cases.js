
module.exports = (sequelize, DataTypes) => {
  const cases = sequelize.define('cases', {
    case_uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    status_id: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    is_deleted: {
      type:DataTypes.BOOLEAN,
      defaultValue: false
    },
    delete_reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    openedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    closedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
  });

  cases.associate = (models) => {
    // associations can be defined here
    cases.belongsTo(models.case_plans, {
      foreignKey: 'plan_id'
    });

    cases.belongsTo(models.case_status, {
      foreignKey: 'status_id',
      as: 'status'
    });

    cases.belongsTo(models.users, {
      foreignKey: 'customer_id',
      as: 'customer'
    });

    cases.belongsTo(models.users, {
      foreignKey: 'agent_id',
      as: 'agent'
    });

    cases.hasMany(models.websites, {
      foreignKey: 'case_uuid',
      as: 'websites',
    });

    cases.hasMany(models.attachments, {
      foreignKey: 'case_uuid',
      as: 'attachments',
    });

    cases.hasMany(models.case_feedbacks, {
      foreignKey: 'case_uuid',
      as: 'feedbacks',
    });

    cases.hasOne(models.customer_payments, {
      foreignKey: 'case_uuid',
      as: 'payment',
    });

  };

  return cases;
};