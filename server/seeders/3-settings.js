module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('settings', [{
      title: 'settings-1',
      logo_url: '',
      about_us_title: '',
      about_us_description: '',
      about_us_img: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {}),
  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('settings', null, {})
};