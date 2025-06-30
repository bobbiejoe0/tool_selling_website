import express, { Express, Request, Response } from "express";
import cors from "cors";
import { storage } from "./storage";

// Initialize Express app
const app: Express = express();
const port = 3000;

// Middleware setup
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json()); // Parse JSON request bodies

// --- API Endpoints ---
// Note: These APIs are placeholders for the VPS eShop backend.
// Replace with actual storage implementation and CoinPayments merchant ID.

// GET /api/categories
// Fetches all product categories (e.g., Web Developers, E-commerce).
app.get("/api/categories", async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await storage.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to get categories" });
  }
});

// GET /api/products
// Fetches all VPS products.
app.get("/api/products", async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to get products" });
  }
});

// GET /api/products/category/:id
// Fetches products by category ID.
// @param id - Category ID (e.g., 1 for Web Developers).
app.get("/api/products/category/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id);
    const products = await storage.getProductsByCategory(categoryId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to get products by category" });
  }
});

// GET /api/search
// Searches products by query string.
// @param q - Search query (e.g., "DevBox").
app.get("/api/search", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ error: "Query parameter is required" });
      return;
    }
    const products = await storage.searchProducts(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to search products" });
  }
});

// POST /api/create-payment
// Creates a CoinPayments payment for a product.
// @param productId - ID of the product to purchase.
// @param cryptoCurrency - Cryptocurrency for payment (defaults to USDT).
app.post("/api/create-payment", async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, cryptoCurrency } = req.body as { productId: number; cryptoCurrency: string };
    const product = await storage.getProductById(productId);
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
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});