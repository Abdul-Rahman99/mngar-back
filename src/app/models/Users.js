
module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // usertype_id: {
        //     type: DataTypes.INTEGER,
        //     allowNull: true,
        //     defaultValue: '2'
        // },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: '1'
        }
    });
    Users.associate = (models) => {
        //Users.belongsTo(models.UserTypes, { foreignKey: 'usertype_id', targetId: 'id' });
        //  Users.hasMany(models.UserDevices, { foreignKey: 'id', targetId: 'user_id' });
        Users.hasMany(models.UserDevices, { foreignKey: 'user_id', sourceKey: 'id' }); // Use sourceKey here
        Users.hasMany(models.User_Role, { foreignKey: 'user_id', as: 'Roles' });


    };
    return Users;
}