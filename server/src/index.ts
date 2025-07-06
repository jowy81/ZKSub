// server/src/index.ts
import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { IntMaxNodeClient } from 'intmax2-server-sdk';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Initialize Express app
const app = express();

// Enable CORS for frontend (http://localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use(fileUpload());
app.use('/public', express.static(path.join(__dirname, '../../client/public')));

// Ensure client/public directory exists
const publicDir = path.join(__dirname, '../../client/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Path for contents JSON
const contentsFilePath = path.join(__dirname, 'contents.json');

// Load contents from JSON file
let contents: { id: string; name: string; description: string; price: number; creatorAddress: string; filePath: string }[] = [];
if (fs.existsSync(contentsFilePath)) {
  const data = fs.readFileSync(contentsFilePath, 'utf-8');
  contents = JSON.parse(data);
}

// In-memory storage for subscriptions
const subscriptions: { subscriberAddress: string; contentId: string; expiresAt: number }[] = [];

// Initialize IntMax client
const client = new IntMaxNodeClient({
  environment: 'testnet',
  eth_private_key: process.env.ETH_PRIVATE_KEY,
  l1_rpc_url: process.env.L1_RPC_URL,
});

// Save contents to JSON file
const saveContents = () => {
  fs.writeFileSync(contentsFilePath, JSON.stringify(contents, null, 2));
};

// Upload content
app.post('/upload-content', async (req, res) => {
  const { name, description, price, creatorAddress } = req.body;
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: 'No file received' });
  }
  const file = req.files.file as fileUpload.UploadedFile;
  const id = uuidv4();
  const filePath = path.join(__dirname, '../../client/public', `${id}-${file.name}`);
  try {
    await file.mv(filePath);
    const content = {
      id,
      name,
      description,
      price: parseFloat(price),
      creatorAddress,
      filePath: `/public/${id}-${file.name}`,
    };
    contents.push(content);
    saveContents();
    res.json({ id, filePath: content.filePath });
  } catch (err) {
    console.error('Content upload failed:', err);
    res.status(500).json({ error: 'Failed to upload content' });
  }
});

// Get all contents
app.get('/contents', (req, res) => {
  res.json(contents);
});

// Get contents by creator address
app.get('/contents/:address', (req, res) => {
  const { address } = req.params;
  const creatorContents = contents.filter((c) => c.creatorAddress === address);
  res.json(creatorContents);
});

// Delete content
app.delete('/content/:id', (req, res) => {
  const { id } = req.params;
  const contentIndex = contents.findIndex((c) => c.id === id);
  if (contentIndex === -1) {
    return res.status(404).json({ error: 'Content not found' });
  }
  const content = contents[contentIndex];
  const filePath = path.join(__dirname, '../../client/public', content.filePath.replace('/public/', ''));
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    contents.splice(contentIndex, 1);
    saveContents();
    res.json({ success: true });
  } catch (err) {
    console.error('Content deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Validate subscription payment
app.post('/validate-payment', async (req, res) => {
  const { subscriberAddress, creatorAddress, amount, txHash, contentId } = req.body;
  try {
    await client.login();
    const { transactions } = await client.fetchTransactionHistory();
    const tx = transactions.find((t: any) => 
      t.digest === txHash && 
      t.to === creatorAddress && 
      Math.abs(parseFloat(t.amount) / Math.pow(10, 18) - amount) < 0.0000001
    );
    if (tx) {
      subscriptions.push({ subscriberAddress, contentId, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
      res.json({ valid: true });
    } else {
      res.status(400).json({ valid: false, error: 'Transaction not found or invalid' });
    }
    await client.logout();
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ valid: false, error: err instanceof Error ? err.message : 'Validation failed' });
  }
});

// Get user subscriptions
app.get('/subscriptions/:address', (req, res) => {
  const { address } = req.params;
  const userSubs = subscriptions.filter((s) => s.subscriberAddress === address);
  res.json(userSubs);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});