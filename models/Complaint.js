const mongoose = require('mongoose');
const { govDB } = require('../config');

const ComplaintSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  product: { type: String, required: true }, // product name
  sku: { type: String, required: true },
  complaintBy: { type: String }, // Government officer name or system
  violationType: { type: String, required: true }, // e.g., "Price Too High"
  currentPrice: { type: String, required: true },
  regulatedPrice: { type: String, required: true },
  date: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false } // status flag
}, { collection: 'complaints' });

module.exports = govDB.model('Complaint', ComplaintSchema);
