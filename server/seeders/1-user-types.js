module.exports = {
  up: (queryInterface, Sequelize) => 
      queryInterface.bulkInsert('user_types', [{
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role: 'Customer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        role: 'Agent',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {}),
  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('user_types', null, {})
};
