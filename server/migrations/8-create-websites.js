
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('websites', {
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
      name: {
        type: Sequelize.STRING
      },
      status_id: {
        type: Sequelize.INTEGER,
        defaultValue: 1
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
    queryInterface.dropTable('websites')
};