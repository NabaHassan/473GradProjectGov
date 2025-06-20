const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const GovUser = require('../models/GovUser');
const Store = require('../models/Store');
const CategoryLimit = require('../models/CategoryLimit');
const ProductSchema = require('../models/ProductSchema');
const { retailerDB, storesDB } = require('../config');
const Complaint = require('../models/Complaint');
const { User } = require('../../473GradProjectRetailer/models/index.js');
const { fetchPricesFromAPI } = require('../helpers/priceChecker.js');

const express = require('express');

const router = express.Router();

// Middleware
function ensureAuthenticated(req, res, next) {
    if (!req.session || !req.session.user) {
        console.log("Unauthorized access attempt.");
        return res.redirect('/login');
    }
    next();
}

// Default Routes
router.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/price-violations-live', async (req, res) => {
    try {
      const violations = await getOverpricedProducts();
      res.render('price-violations-live', { violations });
      console.log("Price violations live page accessed." + violations);
    } catch (error) {
      console.error("Error checking prices:", error);
      res.status(500).send("Internal Server Error");
    }
  });


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await GovUser.findOne({ email });
        if (!user) return res.status(401).send('Invalid email or password.');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send('Invalid email or password.');
        req.session.user = { id: user._id, name: user.name };
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/complain/:storeId', async (req, res) => {
    const { productName, regulatedPrice } = req.body;
    const { storeId } = req.params;

    console.log("📦 Received body:", req.body);

    try {
        const storeInfo = await Store.findById(storeId);
        if (!storeInfo) return res.status(404).send("Store not found");

        const retailer = await User.findOne({ storeName: storeInfo.storeName });
        if (!retailer) return res.status(404).send("Retailer not found");

        if (!productName || !productName.trim()) {
            console.log("❌ productName missing in request body.");
            return res.status(400).send("Product name is required.");
        }

        const collectionName = `product_${storeInfo.storeId}`;
        const Product = storesDB.model(`Product_${storeInfo.storeId}`, ProductSchema, collectionName);

        const foundProduct = await Product.findOne({
            productName: { $regex: new RegExp(`^${productName.trim()}$`, 'i') }
        });

        console.log("🔍 Searching for product:", productName);

        if (!foundProduct) {
            console.log("❌ Product not found:", productName);
            return res.status(404).send("Product not found");
        }

        const usedRegulatedPrice = regulatedPrice || foundProduct.regulatedPrice || 0;

        await Complaint.create({
            storeId,
            product: foundProduct.productName || "N/A", 
            complaintBy: req.session.user?.name || "Anonymous",
            sku: foundProduct.sku || "N/A",
            violationType: "Price Too High",
            currentPrice: foundProduct.price || 0,
            regulatedPrice: parseFloat(regulatedPrice) || foundProduct.regulatedPrice || 0
        });
        
        // Push notification with regulatedPrice too
        await User.updateOne(
          { _id: retailer._id },
          {
            $push: {
              notifications: {
                message: `Your product "${productName}" is not compliance regulated.`,
                date: new Date(),
                read: false,
                productId: foundProduct._id,
                storeId: retailer.storeId,
                productName: foundProduct.productName || productName,
                sku: foundProduct.sku || "N/A",
                violationType: "Price Too High",
                currentPrice: foundProduct.price?.toString() || "0",
                regulatedPrice: parseFloat(regulatedPrice)?.toString() || foundProduct.regulatedPrice?.toString() || "0"
              }
            }
          }
        );
        console.log(`✅ Complaint received for ${productName}, notification sent to ${retailer.name}`);
        return res.redirect(`/store-details/${storeId}?status=success`);
    } catch (error) {
        console.error('❌ Error submitting complaint:', error);
        return res.redirect(`/store-details/${storeId}?status=error`);
    }
});




router.get('/store-details/:id', async (req, res) => {
    try {
        const storeId = req.params.id;

        // Fetch store by ID
        const store = await Store.findById(storeId);
        if (!store) return res.status(404).send("Store not found");


        // Ensure correct access to the store data
        const retailerId = store.storeId || "N/A"; // Ensure store name is being accessed properly
        const collectionName = `product_${store.storeId}`;
        const Product = storesDB.model(`Product_${store.storeId}`, ProductSchema, collectionName);

        const products = await Product.find({});
        const limits = await CategoryLimit.find({});

        const checkedProducts = await Promise.all(
            products.map(async (p) => {
                const limit = limits.find((l) => l.category === p.category);

                const status = !limit
                    ? "No Limit ⚠"
                    : p.price > limit.maxPrice
                    ? "Over Limit ❌"
                    : "OK ✅";

                const statusClass = !limit
                    ? "status-none"
                    : p.price > limit.maxPrice
                    ? "status-over"
                    : "status-ok";

                let apiAvgPrice = null;
                let productName = "";

                // Ensure we get product name correctly
                  /* try {
                        productName = (p.name || p.productName || p._doc?.name || p._doc?.productName || "").toString().trim();

                        if (!productName) {
                        } else {
                         const apiResult = await fetchPricesFromAPI(productName);
                            apiAvgPrice = apiResult?.averagePrice || null;
                        }
                    } catch (err) {
                        console.error("❌ Error extracting product name:", err);
                    }
*/
                // Return all necessary data, including SKU and retailerId
                return {
                    ...p._doc,  // All product properties
                    status,
                    statusClass,
                    apiPrice: apiAvgPrice,  // API Price
                    regulatedPrice: apiAvgPrice || "N/A", // Use apiAvgPrice as regulated price
                    sku: p._id || "N/A",  // Ensure SKU is passed correctly
                    retailerId: retailerId  // Use storeName for retailerId (or store._id if needed)
                };
            })
        );

        // Render the page with the checked products
        res.render("storeDetails", {
            store,
            products: checkedProducts,
            storeId
        });

    } catch (error) {
        console.error('Error fetching store or products:', error);
        res.status(500).send("Error fetching store details");
    }
});





// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const stores = await Store.find({}, 'username storeName storeAddress email phone nationalId storeId')
            .populate('storeId'); // If `storeId` refers to another collection

        console.log("📊 Dashboard accessed by:", req.session.user.storeId);

        res.render('dashboard', { name: req.session.user.name, stores });
    } catch (error) {
        console.error('Error fetching retailer data:', error);
        res.status(500).send('Error loading dashboard');
    }
});



module.exports = router;
