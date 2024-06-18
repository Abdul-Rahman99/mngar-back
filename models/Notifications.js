module.exports = (sequelize, DataTypes) => {
    const Notifications = sequelize.define("Notifications", {
        client_topic: {
            type: DataTypes.STRING,
            allowNull: false
        },
        client_message: {
            type: DataTypes.JSON,
            allowNull: false
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
    Notifications.associate = (models) => {
        Notifications.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };

    return Notifications;
}