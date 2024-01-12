"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "created_at", {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    }),
      await queryInterface.addColumn("users", "updated_at", {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      }),
      await queryInterface.addColumn("users", "deleted_at", {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "created_at")
    await queryInterface.removeColumn("users", "updated_at")
    await queryInterface.removeColumn("users", "deleted_at")
  },
}

