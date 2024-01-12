'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (q, Sequelize) {
    q.removeConstraint("user_groups", "user_groups_ibfk_2")
    q.renameColumn("user_groups", "device_id", "edge_server_id")
  },

  async down (q, Sequelize) {
   
  }
};
