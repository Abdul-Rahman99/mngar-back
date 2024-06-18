module.exports = (sequelize, DataTypes) => {
    const AuditLogs = sequelize.define("AuditLogs", {
        command: {
            type: DataTypes.STRING,
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });
    return AuditLogs;
}