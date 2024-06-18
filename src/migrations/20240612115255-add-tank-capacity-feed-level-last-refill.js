"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("FeedingDevices", "tank_capacity", {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 800,
    });
    await queryInterface.addColumn("FeedingDevices", "feed_level", {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 800,
    });
    await queryInterface.addColumn("FeedingDevices", "last_refill", {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("FeedingDevices", "tank_capacity");
    await queryInterface.removeColumn("FeedingDevices", "feed_level");
    await queryInterface.removeColumn("FeedingDevices", "last_refill");
  },
};
