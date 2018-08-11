
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('cases', {
      case_uuid: {
        type: Sequelize.UUID,
        unique: true,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
          as: 'customer_id',
        }
      },
      agent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
          as: 'agent_id',
        }
      },
      status_id: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        onDelete: 'CASCADE',
        references: {
          model: 'case_status',
          key: 'id',
          as: 'status_id',
        }
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      plan_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'case_plans',
          key: 'id',
          as: 'plan_id',
        }
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delete_reason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      openedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      closedAt: {
        allowNull: true,
        type: Sequelize.DATE
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
    queryInterface.dropTable('cases')
};