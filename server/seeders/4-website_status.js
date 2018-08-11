module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('website_status', [{
      name: 'Pending',
      description: 'Website is waiting be assessed',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Ongoing',
      description: 'Website is on process',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Done',
      description: 'Website is done',
      createdAt: new Date(),
      updatedAt: new Date()
    }]),
  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('website_status', null, {})
};