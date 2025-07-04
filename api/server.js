const express = require('express');
const cors = require('cors');
const { storage } = require('./storage.js');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

app.use(cors());
app.use(express.json());

// Configure Nodemailer for email automation (to be configured later)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Helper function to log to console (Vercel has read-only file system)
const logToFile = (filename, entry) => {
  console.log(`${filename}: ${entry}`);
};

// NOWPayments configuration
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || '24KGXSK-H004Z1G-K7M22EZ-32RNGBV';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1/payment';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || 'mPUMX/aGV5uoaPk/Jd0COUat1f0YZkkE';

// Ensure VERCEL_URL is a valid HTTPS URL and append callback path
const getValidVercelUrl = () => {
  const baseUrl = process.env.VERCEL_URL || 'ecommerce-website-bqjdovegy-testyemma123-gmailcoms-projects.vercel.app';
  const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  return `${cleanUrl}/api/payment-callback`;
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
app.get('/api/order-status/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await storage.getOrderById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ status: order.status });
  } catch (error) {
    console.error('Error in /order-status:', error);
    return res.status(500).json({ error: 'Failed to get order status', details: error.message });
  }
});

app.post('/api/create-payment', async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    console.log('Create payment request:', { orderId, userId });
    const order = await storage.getOrderById(parseInt(orderId));
    if (!order) {
      console.error('Order not found:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }
    const user = await storage.getUser(parseInt(userId));
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!order.total || order.total <= 0) {
      console.error('Invalid order total:', order.total);
      return res.status(400).json({ error: 'Order total must be greater than 0' });
    }

    const vercelUrl = getValidVercelUrl();
    console.log('Generated ipn_callback_url:', vercelUrl);
    const paymentData = {
      price_amount: order.total.toString(),
      price_currency: 'usd',
      pay_currency: 'btc',
      order_id: order.id.toString(),
      order_description: `Payment for Order #${order.id} - ${order.items.map(item => item.product?.title).join(', ') || 'No items'}`,
      ipn_callback_url: vercelUrl,
      success_url: `${vercelUrl.replace('/api/payment-callback', '/success')}`,
      cancel_url: `${vercelUrl.replace('/api/payment-callback', '/cancel')}`,
      customer_email: user.email,
      is_fixed_rate: true,
    };

    console.log('Payment data sent:', paymentData);

    const response = await axios.post(NOWPAYMENTS_API_URL, paymentData, {
      headers: { 'x-api-key': NOWPAYMENTS_API_KEY },
    });
    console.log('NOWPayments full response:', response.data);
    if (response.data.payment_status === 'error') {
      console.error('Payment creation failed:', response.data.message);
      return res.status(500).json({ error: 'Payment creation failed', details: response.data.message });
    }

    order.status = 'pending payment';
    await storage.updateOrder(order);

    if (response.data.payment_url) {
      res.json({ payment_url: response.data.payment_url });
    } else if (response.data.pay_address && response.data.pay_amount) {
      res.json({
        pay_address: response.data.pay_address,
        pay_amount: response.data.pay_amount
      });
    } else {
      console.error("No usable payment data received:", response.data);
      res.status(500).json({ error: "No valid payment info from gateway." });
    }
  } catch (error) {
    console.error('Error in /create-payment:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to create payment', details: error.response?.data?.message || error.message });
  }
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { userId, cartItems } = req.body;
    if (!userId || !cartItems || !Array.isArray(cartItems)) return res.status(400).json({ error: 'User ID and cart items are required' });
    const user = await storage.getUser(parseInt(userId));
    if (!user) return res.status(404).json({ error: 'User not found' });
    const order = await storage.createOrder({ userId: parseInt(userId), status: 'pending', paymentMethod: 'crypto' });
    let total = 0;
    for (const item of cartItems) {
      const product = await storage.getProductById(parseInt(item.productId));
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      await storage.addOrderItem({ orderId: order.id, productId: parseInt(item.productId), quantity: item.quantity || 1 });
      total += parseFloat(product.price) * (item.quantity || 1);
    }
    if (total <= 0) return res.status(400).json({ error: 'Order total must be greater than 0' });
    order.total = total;
    await storage.updateOrder(order);
    await storage.clearCart(parseInt(userId));

    // Email notification (to be configured later)
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
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
    const body = req.body;

    const receivedSignature = req.headers['x-nowpayments-sig'];
    if (!receivedSignature) {
      console.error('Missing IPN signature');
      return res.status(403).json({ error: 'Missing IPN signature' });
    }

    // Stringify the body 
    const payloadString = JSON.stringify(body);
    const computedSignature = crypto
      .createHmac('sha512', NOWPAYMENTS_IPN_SECRET)
      .update(payloadString)
      .digest('hex');

    if (receivedSignature !== computedSignature) {
      console.error('Invalid IPN signature');
      return res.status(403).json({ error: 'Invalid IPN signature' });
    }

    const { payment_status, order_id, payment_id } = body;

    storage.getOrderById(parseInt(order_id)).then(order => {
      if (order) {
        if (payment_status === 'confirmed' || payment_status === 'finished') {
          order.status = 'completed';
          order.payment_id = payment_id;
        } else if (payment_status === 'failed' || payment_status === 'expired') {
          order.status = 'failed';
        }
        storage.updateOrder(order);
        console.log(`Order ${order_id} payment updated to ${order.status}`);
      }
    }).catch(err => console.error('Error updating order:', err));

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in /payment-callback:', error);
    res.status(500).json({ error: 'Failed to process callback', details: error.message });
  }
});

// --------- ADMIN ENDPOINTS ---------
app.get('/api/orders', async (req, res) => {
  try {
    const orders = Array.from(storage.orders.values());
    return res.json(orders);
  } catch (error) {
    console.error('Error in /api/orders:', error);
    return res.status(500).json({ error: 'Failed to get orders', details: error.message });
  }
});

app.get('/api/developers', async (req, res) => {
  try {
    if (!storage.developers) storage.developers = [];
    const developers = await Promise.all(storage.developers.map(async (dev) => {
      const user = await storage.getUser(parseInt(dev.userId));
      return {
        ...dev,
        username: user ? user.username : 'Unknown User'
      };
    }));
    return res.json(developers);
  } catch (error) {
    console.error('Error in /api/developers:', error);
    return res.status(500).json({ error: 'Failed to get developers', details: error.message });
  }
});

app.post('/api/log-developer', async (req, res) => {
  try {
    const { userId, isDeveloper, githubInput, developerEmail } = req.body;
    if (!userId || !isDeveloper) return res.status(400).json({ error: 'User ID and developer status are required' });
    if (!storage.developers) storage.developers = [];
    const logEntry = { userId, isDeveloper, githubInput: githubInput || '', developerEmail: developerEmail || '', date: new Date().toISOString() };
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

module.exports = app;