module.exports = (sequelize, DataTypes) => {
    const ResetTokens = sequelize.define("ResetTokens", {
        token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        expiry_date:{
            type: DataTypes.DATE,
            allowNull: true
        }
    });
    return ResetTokens;
}