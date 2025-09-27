/* eslint-disable no-console */
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Tenant = require('../models/tenant.model');
const User = require('../models/user.model');

// Load .env from project root explicitly (two levels up from this script)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

async function up() {
  await connectDB();

  try {
    let tenant = await Tenant.findOne({ slug: 'default' });
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'Default Tenant',
        slug: 'default',
        settings: { plan: 'free', customConfig: {} },
      });
      console.log('Created tenant: default');
    } else {
      console.log('Tenant already exists: default');
    }

    let admin = await User.findOne({ email: 'admin@local.test' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@local.test',
        password: 'Admin@12345',
        role: 'admin',
        modules: ['sales'],
        tenant: tenant._id,
      });
      console.log('Created admin user');
    } else {
      console.log('Admin user already exists');
    }

    if (!tenant.owner || String(tenant.owner) !== String(admin._id)) {
      await Tenant.updateOne({ _id: tenant._id }, { owner: admin._id });
      console.log('Linked admin as tenant owner');
    }

    console.log('Migration up completed successfully');
  } catch (err) {
    console.error('Migration up failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  up();
}
