

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Usertypes', [{
            title: 'Super Admin'
        }]);
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});
    }
};