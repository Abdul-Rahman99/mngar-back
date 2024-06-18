module.exports = (sequelize, DataTypes) => {
    const ServerMessages = sequelize.define("ServerMessages", {
        topic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        response: {
            type: DataTypes.STRING,
            allowNull: true
        },
        feeder_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    }, {
        getterMethods: {
            getHB() {
                return parseInt(this.getDataValue('message'));
            }
        }
    })
    return ServerMessages;
}