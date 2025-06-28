import express from 'express';
import cors from 'cors';
import { storage } from './storage';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/products', async (req, res) => {
  try {
    const products = await storage.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get products' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});