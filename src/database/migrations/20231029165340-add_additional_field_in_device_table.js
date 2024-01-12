'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (q, Sequelize) {
    q.addColumn("devices", "type", {
      type: Sequelize.DataTypes.STRING(32),
      allowNull: false,
    })
    q.addColumn("devices", "source_type", {
      type: Sequelize.DataTypes.STRING(32),
      allowNull: false,
    })
    q.addColumn("devices", "source_address", {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
    })
    q.addColumn("devices", "assigned_model_type", {
      type: Sequelize.DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    })
    q.addColumn("devices", "assigned_model_index", {
      type: Sequelize.DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    })
    q.addColumn("devices", "additional_info", {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
    })
  },

  async down (q, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
