'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'reset_token', {
      type: Sequelize.DataTypes.STRING(12),
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'reset_token')
  }
};
