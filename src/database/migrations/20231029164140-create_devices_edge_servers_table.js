'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (q, Sequelize) {
    q.createTable("devices_edge_servers", {
      edge_server_id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      device_id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      }
    })
  },

  async down (q, Sequelize) {
    q.dropTable("devices_edge_servers")
  }
};
