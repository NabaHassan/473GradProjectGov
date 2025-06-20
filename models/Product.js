const mongoose = require('mongoose');
const { retailerDB } = require('../config');
const CategoryLimit = require('../models/CategoryLimit');
const express = require('express');
const router = express.Router();

router.get('/store-details/:storeId', async (req, res) => {
    const storeId = req.params.storeId;
    const collectionName = `product_${storeId}`;

    const ProductSchema = new mongoose.Schema({
        productName: String,
        category: String,
        price: Number,
        storeId: mongoose.Schema.Types.ObjectId
        
    });

    const Product = retailerDB.model(`Product_${storeId}`, ProductSchema, collectionName);

    try {
        const products = await Product.find({});
        const limits = await CategoryLimit.find({});

        const checkedProducts = products.map(p => {
            const limit = limits.find(l => l.category === p.category);
            const status = !limit
                ? "⚠ No Limit"
                : p.price > limit.maxPrice
                ? "❌ Over Limit"
                : "✅ OK";
            return { ...p._doc, status };
        });

        res.render('storeDetails', { products: checkedProducts, storeId });
    } catch (err) {
        console.error('Error loading store products:', err);
        res.status(500).send("Error loading store products");
    }
});

module.exports = router;
