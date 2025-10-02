/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Load .env from project root explicitly (two levels up from this script)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

async function loadAllModels() {
  // Dynamically require all model files to ensure models are registered with Mongoose
  const modelsDir = path.join(__dirname, '..', 'models');
  const files = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.js'));
  for (const file of files) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(path.join(modelsDir, file));
  }
}

async function migrate() {
  await connectDB();

  try {
    await loadAllModels();

    const db = mongoose.connection.db;
    const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);

    const modelNames = mongoose.modelNames();
    let createdCollections = 0;
    let syncedIndexes = 0;

    for (const modelName of modelNames) {
      const Model = mongoose.model(modelName);
      const collectionName = Model.collection.name;

      // Create collection only if it does not exist
      if (!existingCollections.includes(collectionName)) {
        await db.createCollection(collectionName);
        createdCollections += 1;
        console.log(`Created missing collection: ${collectionName}`);
      }

      // Sync indexes to reflect any schema index changes
      // This is idempotent and only applies changes when needed
      await Model.syncIndexes();
      syncedIndexes += 1;
      console.log(`Synced indexes for model: ${modelName}`);
    }

    if (createdCollections === 0 && syncedIndexes === 0) {
      console.log('No structural changes detected. Nothing to migrate.');
    } else {
      console.log(
        `Migration completed. Collections created: ${createdCollections}, Index sync operations: ${syncedIndexes}`
      );
    }
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  migrate();
}
