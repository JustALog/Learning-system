const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    charset: dbConfig.charset,
    collate: dbConfig.collate,
    define: dbConfig.define,
    pool: dbConfig.pool,
    logging: dbConfig.logging,
  }
);

// Import model definitions
const Student = require('./Student')(sequelize);
const Course = require('./Course')(sequelize);
const Semester = require('./Semester')(sequelize);
const Section = require('./Section')(sequelize);
const Schedule = require('./Schedule')(sequelize);
const Enrollment = require('./Enrollment')(sequelize);
const Result = require('./Result')(sequelize);

// Collect all models
const models = {
  Student,
  Course,
  Semester,
  Section,
  Schedule,
  Enrollment,
  Result,
};

// Run associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
