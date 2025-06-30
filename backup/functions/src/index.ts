import * as functions from 'firebase-functions';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { storage } from './storage.js';

const app = express();
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await storage.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error('Error in /api/login:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

app.post('/api/create-user', async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const user = await storage.createUser({ username, email, password, firstName, lastName });
    return res.json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error('Error in /api/create-user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await storage.getAllCategories();
    return res.json(categories);
  } catch (error) {
    console.error('Error in /api/categories:', error);
    return res.status(500).json({ error: 'Failed to get categories' });
  }
});

app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const products = await storage.getAllProducts();
    console.log('Products fetched:', products.length);
    return res.json(products);
  } catch (error) {
    console.error('Error in /api/products:', error);
    return res.status(500).json({ error: 'Failed to get products' });
  }
});

app.get('/api/products/category/:id', async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    const products = await storage.getProductsByCategory(categoryId);
    return res.json(products);
  } catch (error) {
    console.error('Error in /api/products/category:', error);
    return res.status(500).json({ error: 'Failed to get products by category' });
  }
});

app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const products = await storage.searchProducts(query);
    return res.json(products);
  } catch (error) {
    console.error('Error in /api/search:', error);
    return res.status(500).json({ error: 'Failed to search products' });
  }
});

app.post('/api/add-to-cart', async (req: Request, res: Response) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: 'User ID and Product ID are required' });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const cartItem = await storage.addToCart({ userId, productId, quantity });
    return res.json(cartItem);
  } catch (error) {
    console.error('Error in /api/add-to-cart:', error);
    return res.status(500).json({ error: 'Failed to add to cart' });
  }
});

app.get('/api/cart/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const cartItems = await storage.getCartItems(userId);
    return res.json(cartItems);
  } catch (error) {
    console.error('Error in /api/cart:', error);
    return res.status(500).json({ error: 'Failed to get cart items' });
  }
});

app.delete('/api/cart/:userId/:productId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const productId = parseInt(req.params.productId);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await storage.removeFromCart(userId, productId);
    return res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error in /api/cart/delete:', error);
    return res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

app.post('/api/create-payment', async (req: Request, res: Response) => {
  try {
    const { productId, cryptoCurrency, userId } = req.body;
    const product = await storage.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const paymentData = {
      merchant: 'YOUR_MERCHANT_ID',
      item_name: product.title,
      amount: parseFloat(product.price),
      currency: 'USD',
      crypto_currency: cryptoCurrency || 'USDT',
      success_url: 'https://ecommerce-bdf9f.web.app/success',
      cancel_url: 'https://ecommerce-bdf9f.web.app/cancel',
      custom: `userId:${userId}`,
    };
    return res.json(paymentData);
  } catch (error) {
    console.error('Error in /api/create-payment:', error);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

app.post('/api/create-order', async (req: Request, res: Response) => {
  try {
    const { userId, cartItems } = req.body;
    if (!userId || !cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'User ID and cart items are required' });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const order = await storage.createOrder({ userId, status: 'pending', paymentMethod: 'crypto' });
    for (const item of cartItems) {
      await storage.addOrderItem({ orderId: order.id, productId: item.productId, quantity: item.quantity || 1 });
    }
    await storage.clearCart(userId);
    return res.json(order);
  } catch (error) {
    console.error('Error in /api/create-order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const orders = await storage.getUserOrders(userId);
    return res.json(orders);
  } catch (error) {
    console.error('Error in /api/orders:', error);
    return res.status(500).json({ error: 'Failed to get orders' });
  }
});

export const api = functions.https.onRequest(app);