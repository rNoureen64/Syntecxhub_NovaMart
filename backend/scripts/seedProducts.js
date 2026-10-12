
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

const products = [
  {
    name: "Wireless Headphones",
    description: "Comfortable wireless headphones for everyday listening.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    stock: 15
  },
  {
    name: "Smart Watch",
    description: "A stylish smartwatch for your daily routine.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    stock: 12
  },
  {
    name: "Everyday Backpack",
    description: "A versatile backpack for study, work and travel.",
    price: 2799,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    stock: 20
  },
  {
    name: "Classic Sneakers",
    description: "Minimal sneakers designed for everyday comfort.",
    price: 3999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    stock: 10
  },
  {
    name: "Minimal Desk Lamp",
    description: "A modern lamp for a calm and productive workspace.",
    price: 2199,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
    stock: 8
  },
  {
    name: "Ceramic Coffee Mug",
    description: "A simple ceramic mug for your everyday coffee.",
    price: 899,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
    stock: 25
  },
  {
    name: "Sunglasses",
    description: "Classic sunglasses with a versatile everyday style.",
    price: 1599,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
    stock: 14
  },
  {
    name: "Casual T-Shirt",
    description: "A comfortable everyday essential with a clean design.",
    price: 1299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    stock: 18
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingCount = await Product.countDocuments();

    if (existingCount > 0) {
      console.log(
        `Database already contains ${existingCount} products. No changes made.`
      );
      return;
    }

    await Product.insertMany(products);
    console.log(`${products.length} sample products added successfully.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
