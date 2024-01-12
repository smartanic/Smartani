'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'avatar', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
  }
};
