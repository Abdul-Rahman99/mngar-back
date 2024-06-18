'use strict';


const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
// console.log(__dirname)
// const env = process.env.NODE_ENV || 'development';
const env = process.env.DEV_ENV || 'production';
console.log(env)
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const applyHooksToSequelize = (config) => ({
  ...config,
  hooks: {
    afterConnect: async (connection, conf) => {
      try {
        // important to avoid long text truncated
        await connection.promise().query("SET @@session.sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));");
        
        // important to avoid long text truncated
        await connection.promise().query('SET @@session.group_concat_max_len = @@global.max_allowed_packet;');
      } catch (error) {
        console.error('Error setting session configuration:', error);
      }
    }
  }
})

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], applyHooksToSequelize(config));
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, applyHooksToSequelize(config));
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    console.log(file)
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    console.log(model.name)
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

// console.log(db);

// process.exit()


module.exports = db;
