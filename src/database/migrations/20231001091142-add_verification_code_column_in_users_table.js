'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'verification_code', {
      type: Sequelize.DataTypes.STRING(6),
      allowNull: true
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'verification_code')
  }
};
