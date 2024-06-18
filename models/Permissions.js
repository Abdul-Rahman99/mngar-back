module.exports = (sequelize, DataTypes) => {
    const Permissions  = sequelize.define("Permissions", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        definition: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });
    // UserTypes.associate = (models) => {
    //     UserTypes.belongsTo(models.users);
    // };
    return Permissions;
}
