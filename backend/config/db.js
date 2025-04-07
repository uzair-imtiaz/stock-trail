const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbName = process.env.NODE_ENV === 'production' ? 'prod_database' : 'test';
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName,
    });
    console.log(`MongoDB Connected: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
