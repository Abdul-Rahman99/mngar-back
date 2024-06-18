'use strict';
const bcrypt = require("bcryptjs");
async function encyptpassword(password) {
    const passwprdHash = await bcrypt.hash(password, 10);
    return passwprdHash;
}
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // return queryInterface.bulkInsert('Users', [{
        //     first_name: 'Teerath',
        //     last_name: 'Kumar',
        //     email: 'teerath@gmail.com',
        //     username: 'teerathkumar',
        //     password: await bcrypt.hash('pass123', 10),
        //     feeder_id: '1',
        //     usertype_id: '1',
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // }]);
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});
    }
};