

module.exports = (sequelize, DataTypes) => {
    const BirdsDataNew = sequelize.define("BirdsDataNew", {
        common_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        scientific_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        family: {
            type: DataTypes.STRING,
            allowNull: true
        },
        genus: {
            type: DataTypes.STRING,
            allowNull: true
        },
        arabic_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gulf: {
            type: DataTypes.STRING,
            allowNull: true
        },
        population: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ae_loc: {
            type: DataTypes.STRING,
            allowNull: true
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true
        },
        eating_habbits: {
            type: DataTypes.STRING,
            allowNull: true
        },
        endangered: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        },

    })
    return BirdsDataNew;
}