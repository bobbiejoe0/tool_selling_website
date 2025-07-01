const express = require('express');
const cors = require('cors');
const { storage } = require('./storage.js');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

// Configure Nodemailer for email automation
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your Gmail
    pass: 'your-app-password'     // Use an App Password if 2FA is on
  }
});

// Helper function to log to console (Vercel has read-only file system)
const logToFile = (filename, entry) => {
  console.log(`${filename}: ${entry}`); // Log to console instead of file
};

// NOWPayments configuration (move to env vars in production)
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || '24KGXSK-H004Z1G-K7M22EZ-32RNGBV';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1/payment';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || 'mPUMX/aGV5uoaPk/Jd0COUat1f0YZkkE';

// Ensure VERCEL_URL is a valid HTTPS URL
const getValidVercelUrl = () => {
  const baseUrl = process.env.VERCEL_URL || 'https://ecommerce-website-gor13bbcs-testyemma123-gmailcoms-projects.vercel.app';
  return baseUrl.startsWith('http://') || baseUrl.startsWith('https://') ? baseUrl : `https://${baseUrl}`;
};

// --------- AUTH ---------
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = await storage.getUserByEmail(email);
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid email or password' });
    logToFile('login.log', `User ${user.username} (ID: ${user.id}) logged in`);
    return res.json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error('Error in /login:', error);
    return res.status(500).json({ error: 'Failed to login', details: error.message });
  }
});

app.post('/api/create-user', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Username, email, and password are required' });
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    const user = await storage.createUser({ username, email, password, firstName, lastName });
    logToFile('login.log', `User ${user.username} (ID: ${user.id}) created`);
    return res.json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error('Error in /create-user:', error);
    return res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// --------- CATEGORIES & PRODUCTS ---------
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await storage.getAllCategories();
    return res.json(categories);
  } catch (error) {
    console.error('Error in /categories:', error);
    return res.status(500).json({ error: 'Failed to get categories', details: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    console.log('Products fetched:', products.length);
    return res.json(products);
  } catch (error) {
    console.error('Error in /products:', error);
    return res.status(500).json({ error: 'Failed to get products', details: error.message });
  }
});

app.get('/api/products/category/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const products = await storage.getProductsByCategory(categoryId);
    return res.json(products);
  } catch (error) {
    console.error('Error in /products/category:', error);
    return res.status(500).json({ error: 'Failed to get products by category', details: error.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query parameter is required' });
    const products = await storage.searchProducts(String(query));
    return res.json(products);
  } catch (error) {
    console.error('Error in /search:', error);
    return res.status(500).json({ error: 'Failed to search products', details: error.message });
  }
});

// --------- CART ---------
app.post('/api/add-to-cart', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId) return res.status(400).json({ error: 'User ID and Product ID are required' });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const cartItem = await storage.addToCart({ userId, productId, quantity });
    return res.json(cartItem);
  } catch (error) {
    console.error('Error in /add-to-cart:', error);
    return res.status(500).json({ error: 'Failed to add to cart', details: error.message });
  }
});

app.get('/api/cart/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const cartItems = await storage.getCartItems(userId);
    return res.json(cartItems);
  } catch (error) {
    console.error('Error in /cart:', error);
    return res.status(500).json({ error: 'Failed to get cart items', details: error.message });
  }
});

app.delete('/api/cart/:userId/:productId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const productId = parseInt(req.params.productId);
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await storage.removeFromCart(userId, productId);
    return res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error in /cart/delete:', error);
    return res.status(500).json({ error: 'Failed to remove from cart', details: error.message });
  }
});

// --------- ORDERS & PAYMENT ---------
app.post('/api/create-payment', async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    console.log('Create payment request:', { orderId, userId });
    const order = await storage.getOrderById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!order.total || order.total <= 0) {
      console.error('Invalid order total:', order.total);
      return res.status(400).json({ error: 'Order total must be greater than 0' });
    }

    const vercelUrl = getValidVercelUrl();
    const paymentData = {
      price_amount: order.total || 10,
      price_currency: 'usd',
      pay_currency: 'btc',
      order_id: order.id,
      order_description: `Payment for Order #${order.id} - ${order.items.map(item => item.product.title).join(', ') || 'No items'}`,
      ipn_callback_url: `${vercelUrl}/api/payment-callback`,
      success_url: `${vercelUrl}/success`,
      cancel_url: `${vercelUrl}/cancel`,
    };
    console.log('Payment data sent:', paymentData);

    const response = await axios.post(NOWPAYMENTS_API_URL, paymentData, {
      headers: { 'x-api-key': NOWPAYMENTS_API_KEY },
    });
    console.log('NOWPayments full response:', response.data);
    const paymentUrl = response.data.payment_url;

    order.status = 'pending payment';
    await storage.updateOrder(order);

    res.json({ payment_url: paymentUrl, order_id: order.id });
  } catch (error) {
    console.error('Error in /create-payment:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to create payment', details: error.response?.data?.message || error.message });
  }
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { userId, cartItems } = req.body;
    if (!userId || !cartItems || !Array.isArray(cartItems)) return res.status(400).json({ error: 'User ID and cart items are required' });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const order = await storage.createOrder({ userId, status: 'pending', paymentMethod: 'crypto' });
    let total = 0;
    for (const item of cartItems) {
      const product = await storage.getProductById(item.productId);
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      await storage.addOrderItem({ orderId: order.id, productId: item.productId, quantity: item.quantity || 1 });
      total += parseFloat(product.price) * (item.quantity || 1);
    }
    if (total <= 0) return res.status(400).json({ error: 'Order total must be greater than 0' });
    order.total = total;
    await storage.updateOrder(order);
    await storage.clearCart(userId);

    // Send automated email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Order Confirmation - VPS eShop',
      text: `Hello ${user.username},\n\nWe've received your order #${order.id} and will process it after payment. Total: $${total}\n\nBest,\nVPS eShop Team`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error('Error sending email:', error);
      else console.log('Email sent:', info.response);
    });

    logToFile('orders.log', `User ${userId} ordered: ${JSON.stringify(cartItems)}, Total: $${total}`);
    return res.json(order);
  } catch (error) {
    console.error('Error in /create-order:', error);
    return res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const orders = await storage.getUserOrders(userId);
    return res.json(orders);
  } catch (error) {
    console.error('Error in /orders:', error);
    return res.status(500).json({ error: 'Failed to get orders', details: error.message });
  }
});

// Payment callback endpoint
app.post('/api/payment-callback', (req, res) => {
  try {
    const { payment_status, order_id, payment_id, ipn_secret } = req.body;
    console.log('Payment callback received:', JSON.stringify(req.body, null, 2));

    if (ipn_secret !== NOWPAYMENTS_IPN_SECRET) {
      console.error('Invalid IPN secret');
      return res.status(403).json({ error: 'Invalid IPN secret' });
    }

    if (payment_status === 'confirmed' || payment_status === 'finished') {
      const order = storage.getOrderById(order_id);
      if (order) {
        order.status = 'completed';
        order.payment_id = payment_id;
        storage.updateOrder(order);
        logToFile('orders.log', `Order ${order_id} payment confirmed with ${payment_id}`);
      }
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      const order = storage.getOrderById(order_id);
      if (order) order.status = 'failed';
      storage.updateOrder(order);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in /payment-callback:', error);
    res.status(500).json({ error: 'Failed to process callback', details: error.message });
  }
});

// --------- ADMIN ENDPOINTS ---------
app.get('/api/orders', (req, res) => {
  try {
    return res.json(Array.from(storage.orders.values()));
  } catch (error) {
    console.error('Error in /api/orders:', error);
    return res.status(500).json({ error: 'Failed to get orders', details: error.message });
  }
});

app.get('/api/developers', (req, res) => {
  try {
    return res.json(storage.developers || []);
  } catch (error) {
    console.error('Error in /api/developers:', error);
    return res.status(500).json({ error: 'Failed to get developers', details: error.message });
  }
});

app.post('/api/log-developer', async (req, res) => {
  try {
    const { userId, isDeveloper, githubInput, developerEmail } = req.body;
    if (!userId || !isDeveloper) return res.status(400).json({ error: 'User ID and developer status are required' });
    const logEntry = { userId, isDeveloper, githubInput, developerEmail, date: new Date().toISOString() };
    if (!storage.developers) storage.developers = [];
    storage.developers.push(logEntry);
    logToFile('developer.log', JSON.stringify(logEntry));
    return res.json({ success: true });
  } catch (error) {
    console.error('Error in /api/log-developer:', error);
    return res.status(500).json({ error: 'Failed to log developer info', details: error.message });
  }
});

// Start server locally (for testing)
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app; // Export for Vercel