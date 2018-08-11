module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('case_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      agent_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
          as: 'agent_id',
        },
      },
      details: {
        type: Sequelize.TEXT
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
    queryInterface.dropTable('case_logs')
};