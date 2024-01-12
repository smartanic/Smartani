'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        // allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
      },
      edge_server_id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        // allowNull: false,
        references: {
          model: 'edge_servers',
          key: 'id',
        },
      },
      device_id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      device_type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      object_label: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      risk_level: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: Sequelize.DataTypes.CHAR(255),
        allowNull: false,
      },
      image: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
      },
      is_viewed: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
      },
      deleted_at: {
        type: Sequelize.DataTypes.DATE,
      }
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('notifications')
  }
};
