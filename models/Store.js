const mongoose = require('mongoose');
const { retailerDB } = require('../config'); // Connect to `LoginSignUpDetails`

// Define User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true }, 
    email: { type: String, required: true }, 
    phone: { type: String, required: true },
    storeName: { type: String, required: true },
    storeAddress: { type: String, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId },

     notifications: [{
        message: String,
        date: { type: Date, default: Date.now },
        read: { type: Boolean, default: false }
    }],



}, { collection: 'users',timestamps: true }); // Ensure correct collection

// Use retailerDB connection
module.exports = retailerDB.model('User', UserSchema);
