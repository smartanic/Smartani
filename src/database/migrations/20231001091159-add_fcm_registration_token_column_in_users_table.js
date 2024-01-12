'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'fcm_registration_token', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'fcm_registration_token')
  }
};
