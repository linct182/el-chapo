module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('product_types', [{
      name: 'Normal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Promo',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {}),
  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('product_types', null, {})
};