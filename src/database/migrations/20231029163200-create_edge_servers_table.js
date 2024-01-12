'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (q, Sequelize) {
    q.createTable("edge_servers", {
      id: {
        type: Sequelize.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      vendor: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: true,
      },
      mqtt_user: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      mqtt_password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
    })
  },

  async down (q, Sequelize) {
   q.dropTable('edge_servers')
  }
};
