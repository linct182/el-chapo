module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('case_feedbacks', {
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
      user_id: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
          as: 'user_id',
        },
      },
      feedback: {
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
    queryInterface.dropTable('case_feedbacks')
};