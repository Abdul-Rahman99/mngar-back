
module.exports = (sequelize, DataTypes) => {
    const LoginLogs = sequelize.define("LoginLogs", {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: '0'
        },
        user_loggedin_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status:{
            type: DataTypes.BOOLEAN,
            allowNull: true  
        }
    });
    return LoginLogs;
}