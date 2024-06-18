module.exports = (sequelize, DataTypes) => {
    const UserTypes = sequelize.define("UserTypes", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: '1'
        }
    });
    // UserTypes.associate = (models) => {
    //     UserTypes.belongsTo(models.users);
    // };
    return UserTypes;
}
