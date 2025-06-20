const mongoose = require('mongoose');
const { govDB } = require('../config'); // use your gov DB connection

const CategoryLimitSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  maxPrice: { type: Number, required: true }
});

module.exports = govDB.model('CategoryLimit', CategoryLimitSchema);
