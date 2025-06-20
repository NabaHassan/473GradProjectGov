const https = require("https");

function fetchPricesFromAPI(productName) {
    return new Promise((resolve, reject) => {
        if (!productName || typeof productName !== "string" || productName.trim() === "") {
            console.warn("⚠️ Skipping API fetch: invalid or empty name →", productName);
            return resolve(null);
        }

        const options = {
            method: "GET",
            hostname: "api.collectapi.com",
            path: "/bazaar/single?city=istanbul",
            headers: {
                "content-type": "application/json",
                "authorization": "apikey 6Cw3gWlEcvgn4tFaMSdVtH:22xjIawEqtb1rMrc5bbjmg"
            }
        };

        const req = https.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    const results = parsed.result || [];

                    const match = results.find(item =>
                        item.isim.toLowerCase().includes(productName.trim().toLowerCase())
                    );

                    if (match) {
                        const avgPrice =
                            (parseFloat(match.min.replace(",", ".")) +
                                parseFloat(match.max.replace(",", "."))) / 2;
                        resolve({ averagePrice: avgPrice });
                    } else {
                        console.warn("❌ No match found for", productName);
                        resolve(null);
                    }
                } catch (e) {
                    console.error("❌ Failed to parse API response:", e);
                    resolve(null);
                }
            });
        });

        req.on("error", (e) => {
            console.error("❌ Request error:", e);
            resolve(null);
        });

        req.end();
    });
}

module.exports = { fetchPricesFromAPI };
