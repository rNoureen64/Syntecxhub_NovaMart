# 🛍️ NovaMart — Full-Stack E-Commerce Web Application

<p align="center">
  <strong>A modern shopping experience built with React, Node.js, Express, and MongoDB.</strong>
</p>

<p align="center">
  Developed as part of my <strong>Web Development Internship at Syntecxhub</strong>.
</p>

---

## ✨ About the Project

**NovaMart** is a full-stack e-commerce web application designed to provide a clean, interactive, and user-friendly online shopping experience.

This project gave me practical experience in building responsive interfaces, connecting a React frontend to a REST API, and working with a MongoDB database.

## 🚀 Features

- 🛍️ **Product Catalog** — Browse products with pricing and stock information.
- 🔎 **Product Search** — Find products using the search functionality.
- 🧩 **Category Filtering** — Explore products by category, including Men, Women, and Unisex collections.
- 🎴 **Interactive Product Cards** — Product cards with a flip animation.
- 🛒 **Shopping Cart** — Add products and manage cart items.
- 🔗 **REST API Integration** — Fetch product data from the backend.
- 🗄️ **Database Connectivity** — Store and retrieve product information using MongoDB.
- 🔐 **Protected Management Routes** — Backend authentication and role-based authorization for supported product management operations.
- 📱 **Responsive UI** — Styling designed to support different screen sizes.

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| JavaScript | Application logic |
| CSS | Styling and responsive layouts |
| Node.js | Backend runtime |
| Express.js | REST API and server routes |
| MongoDB | Database |
| Mongoose | MongoDB data modelling |
| Git & GitHub | Version control and project hosting |

## 📂 Project Structure

```text
Syntecxhub_NovaMart/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .gitignore
└── backend/
    ├── models/
    ├── routes/
    ├── server.js
    ├── package.json
    └── .gitignore
```

*The structure above represents the intended organization; adjust it to match the actual files in your repository.*

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection string
- Git

### 1. Clone the repository

```bash
git clone https://github.com/rNoureen64/Syntecxhub_NovaMart.git
cd Syntecxhub_NovaMart
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with your own local configuration:

```env
MONGO_URI=mongodb://127.0.0.1:27017/novamart
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
```

Never commit your `.env` file or share secret values publicly.

Start the backend using the command configured in your `package.json`. If the entry point is `server.js`, you can use:

```bash
node server.js
```

### 3. Configure the frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create a frontend `.env` file containing:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React development server:

```bash
npm start
```

The frontend should open at `http://localhost:3000`, while the backend API runs at `http://localhost:5000`.

## 🎯 What I Learned

- Building reusable React components and interactive UI elements.
- Implementing search and category-based filtering.
- Connecting frontend applications to backend REST APIs.
- Working with MongoDB and Mongoose.
- Understanding backend authentication and authorization.
- Improving project organization, styling, and debugging skills.

## 👩‍💻 Project & Internship

**Project:** NovaMart — Full-Stack E-Commerce Web Application  
**Internship:** Web Development Internship at Syntecxhub  
**Developer:** Rabail Noureen

## 🌱 Future Improvements

- Product creation, editing, and deletion through a secure admin interface.
- Order management and checkout integration.
- Payment gateway integration.
- Product reviews and wishlists.
- Deployment of the frontend and backend.

---

⭐ If you find this project interesting, feel free to explore the repository and share your feedback.

**Built with curiosity, consistency, and a passion for learning web development.** 💙
