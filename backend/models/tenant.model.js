const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  settings: {
    plan: { type: String, enum: ["free", "premium"], default: "free" }, 
    customConfig: { type: Object, default: {} }, 
  },
}, { timestamps: true });

module.exports = mongoose.model("Tenant", TenantSchema);