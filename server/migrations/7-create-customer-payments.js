module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('customer_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      particulars: {
        type: Sequelize.STRING
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.DECIMAL
      },
      refunded: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      actual_payment: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      gateway: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
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
      user_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
          as: 'user_id',
        },
      },
    }),
  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable('customer_payments')
};