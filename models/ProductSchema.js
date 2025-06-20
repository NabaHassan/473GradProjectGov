const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },                 // currentPrice
  regulatedPrice: { type: Number, required: true },        // ✅ add this
  sku: { type: String, required: true },                   // ✅ add this
  storeId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

module.exports = ProductSchema;
