'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn("edge_servers", "invitation_code", {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true,
    })
    queryInterface.addColumn("edge_servers", "invitation_expired_at", {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
