const mongoose = require('mongoose');
const { govDB } = require('./config'); // Make sure this points to gov DB
const CategoryLimit = require('./models/CategoryLimit');

const categoryLimits = [
  { category: "Beverages", maxPrice: 100 },
  { category: "Dairy & Eggs", maxPrice: 80 },
  { category: "Bakery", maxPrice: 50 },
  { category: "Fruits & Vegetables", maxPrice: 60 },
  { category: "Meat & Seafood", maxPrice: 150 },
  { category: "Frozen Foods", maxPrice: 120 },
  { category: "Pantry Staples", maxPrice: 90 },
  { category: "Snacks & Sweets", maxPrice: 70 },
  { category: "Canned Goods", maxPrice: 60 },
  { category: "Condiments & Sauces", maxPrice: 65 },
  { category: "Pasta & Rice", maxPrice: 55 },
  { category: "Breakfast & Cereal", maxPrice: 75 },
  { category: "Baking & Cooking Essentials", maxPrice: 85 },
  { category: "Personal Care", maxPrice: 100 },
  { category: "Household Supplies", maxPrice: 110 },
  { category: "Electronics & Appliances", maxPrice: 2000 },
  { category: "Home & Garden", maxPrice: 1000 },
  { category: "Pet Supplies", maxPrice: 150 },
  { category: "Sports & Outdoors", maxPrice: 500 },
  { category: "Toys & Games", maxPrice: 400 },
  { category: "Tools & Hardware", maxPrice: 450 },
  { category: "Automotive", maxPrice: 800 },
  { category: "Clothing & Accessories", maxPrice: 300 },
  { category: "Home & Living", maxPrice: 900 },
  { category: "Kitchen & Dining", maxPrice: 600 },
  { category: "Office & Stationery", maxPrice: 200 }
];

const seed = async () => {
  try {
    await govDB;
    await CategoryLimit.deleteMany({});
    await CategoryLimit.insertMany(categoryLimits);
    console.log("✅ Category limits inserted!");
    process.exit();
  } catch (err) {
    console.error("❌ Error inserting category limits:", err);
    process.exit(1);
  }
};

seed();
