module.exports = {
  up: (queryInterface, Sequelize) => 
      queryInterface.bulkInsert('case_plans', [{
        title: 'Small',
        description: '1 website',
        amount: 3,
        min: 1,
        max: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Medium',
        description: '3-10 websites',
        amount: 5,
        min: 3,
        max: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Large',
        description: '11-20 websites',
        amount: 10,
        min: 11,
        max: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      }], {}),
  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('case_plans', null, {})
};