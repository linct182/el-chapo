module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('case_status', [{
      name: 'Queued',
      description: 'Case was submitted for payment verification',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Verified',
      description: 'Case was verified for payment and is now available for agent review',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Active',
      description: 'Case is in process by an Agent',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
    name: 'Resolved',
    description: 'Case was finished by an Agent and waiting for Customer\'s review',
    createdAt: new Date(),
    updatedAt: new Date()
    },
    {
      name: 'Closed',
      description: 'Case was confirmed and reviewed by Customer',
      createdAt: new Date(),
      updatedAt: new Date()
    }]),
  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete('case_status', null, {})
};