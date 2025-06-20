const mongoose = require('mongoose');

// Database URIs
const GOV_DB_URI = 'mongodb://127.0.0.1:27017/GovSystem'; 
const RETAILER_DB_URI = 'mongodb://127.0.0.1:27017/LoginSignUpDetails';
const STORES_DB_URI = 'mongodb://127.0.0.1:27017/stores';

// ✅ Create direct connection object for GovSystem
const govDB = mongoose.createConnection(GOV_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

govDB.on('connected', () => {
    console.log('Connected to Government MongoDB');
});

govDB.on('error', (err) => {
    console.error('Error connecting to Government DB:', err);
});

// ✅ Retailer DB connection
const retailerDB = mongoose.createConnection(RETAILER_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

retailerDB.on('connected', () => {
    console.log('Connected to Retailer MongoDB (LoginSignUpDetails)');
});

retailerDB.on('error', (err) => {
    console.error('Error connecting to Retailer DB:', err);
});

// ✅ Stores DB connection
const storesDB = mongoose.createConnection(STORES_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

storesDB.on('connected', () => {
    console.log('Connected to Stores MongoDB');
});

storesDB.on('error', (err) => {
    console.error('Error connecting to Stores DB:', err);
});

// ✅ Export the connections
module.exports = { govDB, retailerDB, storesDB };