import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shops: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    ],
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);

export default Route;
