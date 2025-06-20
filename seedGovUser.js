const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { govDB } = require('./config');

const GovUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const GovUser = govDB.model('GovUser', GovUserSchema, 'govusers');

async function insertUser() {
  const hashed = await bcrypt.hash('1234', 10);
  await GovUser.create({
    name: 'CypGov Admin',
    email: 'cypgov@gov.com',
    password: hashed,
    role: 'Regulator'
  });

  console.log("✅ Test Gov User inserted");
  process.exit();
}

insertUser();
