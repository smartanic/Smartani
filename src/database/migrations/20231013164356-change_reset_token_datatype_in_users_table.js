'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.changeColumn('users', 'reset_token', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
  }
};
