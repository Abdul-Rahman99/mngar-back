module.exports = (sequelize, DataTypes) => {
    const SensorWorking = sequelize.define("SensorWorking", {
        client_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });
    SensorWorking.associate = (models) => {
        SensorWorking.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };
    return SensorWorking;
}