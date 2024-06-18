
module.exports = (sequelize, DataTypes) => {
    const UploadedFiles = sequelize.define("UploadedFiles", {
        term: {
            type: DataTypes.STRING,
            allowNull: false
        },
        link_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        file_path: {
            type: DataTypes.STRING,
            allowNull: true
        }, 
    });
    
    return UploadedFiles;
}