const mongoose = require('mongoose');
const { govDB } = require('../config');


const GovUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Regulator' } // Single role
});

module.exports = govDB.model('GovUser', GovUserSchema, 'govusers');
