"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const storage_1 = require("./storage");
// Initialize Express app
const app = (0, express_1.default)();
const port = 3000;
// Middleware setup
app.use((0, cors_1.default)()); // Enable CORS for frontend requests
app.use(express_1.default.json()); // Parse JSON request bodies
// --- API Endpoints ---
// Note: These APIs are placeholders for the VPS eShop backend.
// Replace with actual storage implementation and CoinPayments merchant ID.
// GET /api/categories
// Fetches all product categories (e.g., Web Developers, E-commerce).
app.get("/api/categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield storage_1.storage.getAllCategories();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get categories" });
    }
}));
// GET /api/products
// Fetches all VPS products.
app.get("/api/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield storage_1.storage.getAllProducts();
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get products" });
    }
}));
// GET /api/products/category/:id
// Fetches products by category ID.
// @param id - Category ID (e.g., 1 for Web Developers).
app.get("/api/products/category/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = parseInt(req.params.id);
        const products = yield storage_1.storage.getProductsByCategory(categoryId);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get products by category" });
    }
}));
// GET /api/search
// Searches products by query string.
// @param q - Search query (e.g., "DevBox").
app.get("/api/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.q;
        if (!query) {
            res.status(400).json({ error: "Query parameter is required" });
            return;
        }
        const products = yield storage_1.storage.searchProducts(query);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to search products" });
    }
}));
// POST /api/create-payment
// Creates a CoinPayments payment for a product.
// @param productId - ID of the product to purchase.
// @param cryptoCurrency - Cryptocurrency for payment (defaults to USDT).
app.post("/api/create-payment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, cryptoCurrency } = req.body;
        const product = yield storage_1.storage.getProductById(productId);
        if (!product) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        const paymentData = {
            merchant: "YOUR_MERCHANT_ID", // Replace with your CoinPayments merchant ID
            item_name: product.title,
            amount: product.price,
            currency: "USD",
            crypto_currency: cryptoCurrency || "USDT",
            success_url: "https://e-commerce.vercel.app/success",
            cancel_url: "https://e-commerce.vercel.app/cancel",
        };
        res.json(paymentData);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create payment" });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
