

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('FeedingDevices', [{
            title: 'Feeder01',
            feeder_id: 'BF_3485186abfc8'
        }]);
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});
    }
};