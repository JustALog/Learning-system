require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Validate required environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    // Test database connection
    console.log('Attempting to connect to database...');

    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync models to database (creates tables if not exist)
    // In production, use migrations instead
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database models synchronized.');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\nServer is running on http://localhost:${PORT}`);
      console.log(`API Health: http://localhost:${PORT}/api/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    console.error(error);
    process.exit(1);
  }
}

startServer();
