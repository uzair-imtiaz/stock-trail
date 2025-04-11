const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbName = 'prod_database';
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
