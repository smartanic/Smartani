'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (q, Sequelize) {
    q.addColumn("edge_servers", "mqtt_pub_topic", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    })
    
    q.addColumn("edge_servers", "mqtt_sub_topic", {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    })
  },

  async down (queryInterface, Sequelize) {
    
  }
};
