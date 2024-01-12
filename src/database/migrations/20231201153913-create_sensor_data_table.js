'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (q, Sequelize) {
    q.createTable('sensor_data', {
      id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      edge_server_id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      device_id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      data_measured: {
        type: Sequelize.DataTypes.JSON,
        allowNull: false,
        defaultValue: 0,
      },
      inference_label_status: {
        type: Sequelize.DataTypes.STRING(30),
        allowNull: false,
      },
      captured_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      }
    })
  },

  async down (q, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
    //  * await queryInterface.dropTable('users');
     */
    q.dropTable('sensor_data')
  }
};
