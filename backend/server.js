
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/novamart";
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
}

app.get("/", (req, res) => {
  res.json({
    message: "NovaMart E-Commerce API is running",
    status: "success"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Authentication

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Name, valid email and password of at least 8 characters are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user"
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Products

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

app.post(
  "/api/products",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const {
  name,
  description,
  price,
  category,
  collection = "Unisex",
  image,
  stock
} = req.body;

      if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof description !== "string" ||
        !description.trim() ||
        typeof category !== "string" ||
        !category.trim() ||
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(stock) ||
        stock < 0 ||
        !["Men", "Women", "Unisex"].includes(collection) ||
        (image !== undefined && typeof image !== "string")
      ) {
        return res.status(400).json({
          message: "Provide valid product details and non-negative price and stock"
        });
      }

      const product = await Product.create({
        name: name.trim(),
        description: description.trim(),
        price,
        category: category.trim(),
        collection,
        image: image || "",
        stock
      });

      res.status(201).json({
        message: "Product created successfully",
        product
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed to create product",
        error: error.message
      });
    }
  }
);

app.put(
  "/api/products/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const allowedFields = [
        "name",
        "description",
        "price",
        "category",
        "collection",
        "image",
        "stock"
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message: "No valid product fields provided"
        });
      }

      if (
        ("name" in updates &&
          (typeof updates.name !== "string" || !updates.name.trim())) ||
        ("description" in updates &&
          (typeof updates.description !== "string" ||
            !updates.description.trim())) ||
        
("category" in updates &&
  (typeof updates.category !== "string" ||
    !updates.category.trim())) ||
("collection" in updates &&
  (typeof updates.collection !== "string" ||
    !["Men", "Women", "Unisex"].includes(updates.collection))) ||

        ("image" in updates && typeof updates.image !== "string") ||
        ("price" in updates &&
          (typeof updates.price !== "number" ||
            !Number.isFinite(updates.price) ||
            updates.price < 0)) ||
        ("stock" in updates &&
          (!Number.isInteger(updates.stock) || updates.stock < 0))
      ) {
        return res.status(400).json({
          message: "Invalid product field values"
        });
      }

      if (typeof updates.name === "string") updates.name = updates.name.trim();
      if (typeof updates.description === "string") {
        updates.description = updates.description.trim();
      }
      if (typeof updates.category === "string") {
        updates.category = updates.category.trim();
      }
if (typeof updates.collection === "string") {
  updates.collection = updates.collection.trim();
}
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product updated successfully", product });
    } catch (error) {
      res.status(400).json({
        message: "Failed to update product",
        error: error.message
      });
    }
  }
);

app.delete(
  "/api/products/:id",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  }
);

// Orders and checkout (Cash on Delivery)

app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50 ||
      !shippingAddress ||
      typeof shippingAddress.fullName !== "string" ||
      !shippingAddress.fullName.trim() ||
      typeof shippingAddress.address !== "string" ||
      !shippingAddress.address.trim() ||
      typeof shippingAddress.city !== "string" ||
      !shippingAddress.city.trim() ||
      typeof shippingAddress.phone !== "string" ||
      !shippingAddress.phone.trim()
    ) {
      return res.status(400).json({
        message: "Valid cart items and complete shipping details are required"
      });
    }

    const quantities = new Map();

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return res.status(400).json({
          message: "Invalid product ID or quantity"
        });
      }

      const id = item.productId;
      quantities.set(id, (quantities.get(id) || 0) + item.quantity);
    }

    const productIds = [...quantities.keys()];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    const orderItems = [];
    let totalAmount = 0;

    for (const [productId, quantity] of quantities) {
      const product = productMap.get(productId);

      if (!product) {
        return res.status(400).json({
          message: "A selected product was not found"
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity
      });

      totalAmount += product.price * quantity;
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        phone: shippingAddress.phone.trim()
      },
      paymentMethod: "Cash on Delivery"
    });

    res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error("Order creation error:", error.message);
    res.status(500).json({ message: "Failed to place order" });
  }
});

app.get("/api/orders/my-orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
});

app.get(
  "/api/orders",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  }
);

app.patch(
  "/api/orders/:id/status",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const allowedStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
      ];

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid order status" });
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
      );

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({ message: "Order status updated", order });
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  }
);

async function startServer() {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error(
      "Set a private JWT_SECRET of at least 32 characters in .env"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
console.log("MongoDB connected successfully");

const migrationResult = await Product.updateMany(
  { collection: { $exists: false } },
  { $set: { collection: "Unisex" } }
);

console.log(
  `Existing products assigned to Unisex: ${migrationResult.modifiedCount}`
);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
