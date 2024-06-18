module.exports = (sequelize, DataTypes) => {
    const CameraData = sequelize.define("CameraData", {
        client_topic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        client_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
    })
    return CameraData;
}