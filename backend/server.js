
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

const PRODUCTS_FILE = path.join(__dirname, '..', 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const STATIC_DIR = path.join(__dirname, '..', 'frontend');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change_this_secure_token';

app.use(bodyParser.json());
app.use(require('cors')());
app.use('/static', express.static(STATIC_DIR));

if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOADS_DIR); },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\\-]/g, '_');
    cb(null, name);
  }
});
const upload = multer({ storage: storage });

app.get('/products', (req, res) => {
  const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
  res.json(JSON.parse(data));
});

app.post('/orders', upload.single('gerber'), async (req, res) => {
  const body = req.body || {};
  let items = [];
  try { items = JSON.parse(body.items || "[]"); } catch(e) {}

  const newOrder = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    status: "pending",
    customer: {
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      address: body.address || ""
    },
    notes: body.notes || "",
    items,
    attachment: req.file ? { filename: req.file.filename, path: req.file.path } : null
  };

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  orders.unshift(newOrder);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

  // email optional
  try {
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL || "no-reply@besaventures.com",
        to: process.env.ADMIN_EMAIL || "info@besaventures.com",
        subject: "New Order: " + newOrder.id,
        text: "A new order has been received.",
        html: "<pre>" + JSON.stringify(newOrder, null, 2) + "</pre>",
        attachments: newOrder.attachment ? [{ path: newOrder.attachment.path }] : []
      });
    }
  } catch (err) {
    console.error("Email error:", err);
  }

  res.json({ ok: true, orderId: newOrder.id });
});

app.get('/admin/orders', (req, res) => {
  if (req.query.token !== ADMIN_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  res.json(orders);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => console.log("Server running on " + PORT));
