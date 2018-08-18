module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      logo_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      about_us_title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      about_us_description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      about_us_img: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }),
  down: (queryInterface /* , Sequelize */) =>
    queryInterface.dropTable('settings'),
};