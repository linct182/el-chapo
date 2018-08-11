module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('website_status', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
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
    }, {
        freezeTableName: true,
        tableName: 'website_status'
      }),
  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable('website_status')
}