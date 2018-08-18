module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('settings', [{
      title: 'settings-1',
      logo_url: '',
      about_us: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {}),
  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('settings', null, {})
};