module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('case_payouts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      payout_request_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'payout_requests',
          key: 'id',
          as: 'payout_request_id',
        },
      },
      case_uuid: {
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'cases',
          key: 'case_uuid',
          as: 'case_uuid',
        },
      },
      amount: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      is_paid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }),
  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable('case_payouts')
};