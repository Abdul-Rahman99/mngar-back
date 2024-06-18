module.exports = (sequelize, DataTypes) => {
  const FeedingDevices = sequelize.define("FeedingDevices", {
    title: {
      type: DataTypes.STRING,
    },
    feeder_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mac_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    camera_mac_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    other_info: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    tank_capacity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 800, // Default tank capacity
    },
    feed_level: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 100, // Default feed level percentage
    },
    last_refill: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
  return FeedingDevices;
};
