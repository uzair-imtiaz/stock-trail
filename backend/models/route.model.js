const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shops: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    ],
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;
