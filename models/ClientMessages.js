module.exports = (sequelize, DataTypes) => {
    const ClientMessages = sequelize.define("ClientMessages", {
        client_topic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        client_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        client_response: {
            type: DataTypes.STRING,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    });
    ClientMessages.associate = (models) => {
        ClientMessages.belongsTo(models.FeedingDevices, { foreignKey: 'feeder_id', targetKey: 'id' });
    };
    return ClientMessages;
}