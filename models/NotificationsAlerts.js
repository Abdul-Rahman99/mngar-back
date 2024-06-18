module.exports = (sequelize, DataTypes) => {
    const NotificationAlerts = sequelize.define("NotificationAlerts", {
        message_topic: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        feeder_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
    return NotificationAlerts;
}