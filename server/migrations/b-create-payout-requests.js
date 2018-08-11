module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('payout_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      agent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
          as: 'agent_id',
        }
      },
      total_amount: {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true,
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
    queryInterface.dropTable('payout_requests')
};