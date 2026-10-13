
import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const styles = {
  Electronics: { icon: "🎧", color: "#e8eaff" },
  Accessories: { icon: "🎒", color: "#fff0dc" },
  Fashion: { icon: "👟", color: "#fce5ed" },
  Home: { icon: "💡", color: "#fff4c9" },
  Other: { icon: "🛍️", color: "#e3f4ed" }
};

const money = (price) =>
  "Rs. " + Number(price || 0).toLocaleString("en-PK");

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState("shop");
  const [notice, setNotice] = useState("");
  
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach((element) => {
        element.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  
}, [page, loading]);
  
const categories = [
  "All",
  "Men",
  "Women",
  "Unisex",
  "Electronics",
  "Accessories",
  "Fashion",
  "Home"
];
  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error("Products could not be loaded from the backend.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response received from the server.");
        }

        const formatted = data.map((product) => {
          const style = styles[product.category] || styles.Other;

          return {
            ...product,
            id: product._id,
            icon: style.icon,
            color: style.color
          };
        });

        if (active) setProducts(formatted);
      } catch (err) {
        if (active) {
          setError(
            err.message || "Cannot connect to the backend server."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesName = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      
const matchesCategory =
  ["Men", "Women", "Unisex"].includes(category)
    ? product.collection === category
    : category === "All" || product.category === category;


      return matchesName && matchesCategory;
    });
  }, [products, search, category]);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function addToCart(product) {
    if (product.stock <= 0) {
      showNotice("This product is out of stock.");
      return;
    }

    const existing = cart.find((item) => item.id === product.id);

    if (existing && existing.quantity >= product.stock) {
      showNotice("Available stock limit reached.");
      return;
    }

    setCart((current) => {
      const found = current.find((item) => item.id === product.id);

      if (found) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    showNotice(product.name + " added to cart");
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.min(
                  item.stock,
                  item.quantity + amount
                )
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  return (
    <div className="store">
      <div className="announcement">
        Welcome to NovaMart — smart finds, everyday value.
      </div>

      <header className="header">
        <button className="brand" onClick={() => setPage("shop")}>
          <span className="brand-icon">N</span> nova<span>mart.</span>
        </button>

        <div className="search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
          />
        </div>

        <nav>
          <button
            className={page === "shop" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("shop")}
          >
            Shop
          </button>
          <button
            className={page === "admin" ? "nav-link active" : "nav-link"}
            onClick={() => setPage("admin")}
          >
            Admin
          </button>
          <button
            className="cart-button"
            onClick={() => setPage("cart")}
          >
            ♧ Cart <b>{count}</b>
          </button>
        </nav>
      </header>

      {notice && <div className="toast">{notice}</div>}

      {page === "shop" && (
        <>
<section className="hero hero-premium" data-reveal>
  <div className="hero-copy">
    <span className="eyebrow">THE EVERYDAY COLLECTION</span>

    <h1>
      Good finds.
      <br />
      <span>Better living.</span>
    </h1>

    <p>
      Discover thoughtful essentials for your everyday life.
      Quality products, simple shopping, all in one place.
    </p>

    <button
      className="primary-button"
      onClick={() =>
        document
          .getElementById("products")
          ?.scrollIntoView({ behavior: "smooth" })
      }
    >
      Explore collection <span>→</span>
    </button>

    <div className="hero-stats">
      <div>
        <b>{products.length}</b>
        <small>Store products</small>
      </div>
      <div>
        <b>Easy</b>
        <small>Shopping experience</small>
      </div>
      <div>
        <b>Live</b>
        <small>Database catalog</small>
      </div>
    </div>
  </div>

  <div className="hero-art hero-art-premium">
    <div className="hero-image-backdrop"></div>

    {products[0]?.image ? (
      <img
        className="hero-feature-image"
        src={products[0].image}
        alt={products[0].name}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    ) : (
      <div className="hero-product">🛍️</div>
    )}

    {products[1]?.image && (
      <div className="hero-mini-card hero-mini-one">
        <img src={products[1].image} alt={products[1].name} />
        <span>{products[1].name}</span>
      </div>
    )}

    {products[2]?.image && (
      <div className="hero-mini-card hero-mini-two">
        <img src={products[2].image} alt={products[2].name} />
        <span>{products[2].name}</span>
      </div>
    )}

    <div className="floating-card">
      <span>✦</span>
      <div>
        <b>Everyday essentials</b>
        <small>Picked for you</small>
      </div>
    </div>

    <div className="hero-tag">STYLE · TECH · HOME</div>
  </div>
</section>
         <section className="benefits" data-reveal>
            <div>
              <span>✦</span>
              <p>
                <b>Quality picks</b>
                <small>Thoughtfully selected</small>
              </p>
            </div>
            <div>
              <span>↗</span>
              <p>
                <b>Easy shopping</b>
                <small>A smooth experience</small>
              </p>
            </div>
            <div>
              <span>♡</span>
              <p>
                <b>Customer first</b>
                <small>Made around your needs</small>
              </p>
            </div>
          </section>

          <main className="catalog" id="products">
            <div className="section-heading" data-reveal>
              <div>
                <span className="eyebrow">OUR COLLECTION</span>
                <h2>Shop your favorites</h2>
                <p>Find something you'll love.</p>
              </div>
              <span className="product-count">
                {filteredProducts.length} products
              </span>
            </div>

            <div className="filters" data-reveal>
              {categories.map((item) => (
                <button
                  key={item}
                  className={
                    category === item ? "filter active-filter" : "filter"
                  }
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {loading && (
              <div className="empty-state">
                Loading products from database...
              </div>
            )}

            {!loading && error && (
              <div className="empty-state">
                {error}
                <p>Check that MongoDB and the backend server are running.</p>
                <button
                  className="text-button"
                  onClick={() => window.location.reload()}
                >
                  Try again ↻
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="product-grid" data-reveal>
                  {filteredProducts.map((product) => (
                    
<article className="product-card product-flip-card" key={product.id}>
  <div className="product-flip-inner">
    <div className="product-flip-front">
      <div
        className="product-art"
        style={{ background: product.color }}
      >
        <span className="product-category">
          {product.category}
        </span>

        <img
          className="product-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        <span className="rating">
          {product.stock > 0
            ? `${product.stock} in stock`
            : "Out of stock"}
        </span>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        <p className="product-subtitle">
          {product.description || "Everyday collection"}
        </p>

        <div className="product-bottom">
          <b>{money(product.price)}</b>
          <span className="flip-hint">↻ Flip to explore</span>
        </div>
      </div>
    </div>

    <div className="product-flip-back">
      <span className="flip-back-label">
        NOVAMART · EVERYDAY COLLECTION
      </span>

      <div className="flip-back-content">
        <span className="flip-back-icon">✦</span>

        <h3>{product.name}</h3>

        <p>
          {product.description ||
            "A thoughtful pick for your everyday lifestyle."}
        </p>

        <div className="flip-back-price">
          {money(product.price)}
        </div>

        <span className="flip-back-stock">
          {product.stock > 0
            ? `${product.stock} available`
            : "Currently out of stock"}
        </span>

        <button
          className="flip-cart-button"
          disabled={product.stock <= 0}
          onClick={() => { console.log("Add to Cart clicked", product.name); addToCart(product); }}
          aria-label={`Add ${product.name} to cart`}
        >
          {product.stock > 0
            ? "Add to Cart  →"
            : "Out of Stock"}
        </button>
      </div>

      <span className="flip-back-footer">
        GOOD FINDS. BETTER LIVING.
      </span>
    </div>
  </div>
</article>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="empty-state">
                    {products.length === 0
                      ? "Your database has no products yet. Products must be added through the backend."
                      : "No products found. Try another search."}
                  </div>
                )}
              </>
            )}
          </main>
        </>
      )}

      {page === "cart" && (
        <main className="page-panel">
          <span className="eyebrow">YOUR BAG</span>
          <h1>Shopping cart</h1>

          {cart.length === 0 ? (
            <div className="empty-state">
              Your cart is empty.{" "}
              <button
                className="text-button"
                onClick={() => setPage("shop")}
              >
                Continue shopping →
              </button>
            </div>
          ) : (
            <div className="cart-layout">
              <div>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    
<div
  className="cart-item-art"
  style={{ background: item.color }}
>
  <img
    src={item.image}
    alt={item.name}
    loading="lazy"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
</div>
                    <div className="cart-item-info">
                      <b>{item.name}</b>
                      <span>{money(item.price)}</span>
                      <div className="quantity">
                        <button
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          disabled={item.quantity >= item.stock}
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          ＋
                        </button>
                      </div>
                    </div>
                    <b>{money(item.price * item.quantity)}</b>
                  </div>
                ))}
              </div>

              <aside className="summary">
                <h3>Order summary</h3>
                <div>
                  <span>Subtotal</span>
                  <b>{money(total)}</b>
                </div>
                <div>
                  <span>Shipping</span>
                  <b>Calculated at checkout</b>
                </div>
                <hr />
                <div className="summary-total">
                  <span>Total</span>
                  <b>{money(total)}</b>
                </div>
                <button
                  className="primary-button full-button"
                  onClick={() => setPage("checkout")}
                >
                  Proceed to checkout →
                </button>
              </aside>
            </div>
          )}
        </main>
      )}

      {page === "checkout" && (
        <main className="page-panel">
          <span className="eyebrow">ALMOST YOURS</span>
          <h1>Checkout</h1>
          <p>
            Your shopping cart is ready. Real order placement requires
            customer details and authentication.
          </p>
          <div className="summary checkout-summary">
            <h3>Order total</h3>
            <div>
              <span>Items ({count})</span>
              <b>{money(total)}</b>
            </div>
            <p className="small-note">
              Checkout is a demo screen at this stage. No order or payment
              is submitted from this page.
            </p>
            <button
              className="text-button"
              onClick={() => setPage("cart")}
            >
              ← Back to cart
            </button>
          </div>
        </main>
      )}

      {page === "admin" && (
        <main className="page-panel">
          <span className="eyebrow">STORE MANAGEMENT</span>
          <h1>Admin overview</h1>
          <p>Product counts below come from the backend catalog.</p>

          <div className="admin-stats">
            <div>
              <span>Total products</span>
              <b>{products.length}</b>
            </div>
            <div>
              <span>Cart items</span>
              <b>{count}</b>
            </div>
            <div>
              <span>Cart value</span>
              <b>{money(total)}</b>
            </div>
          </div>

<h2>Product Inventory</h2>

{loading ? (
  <p>Loading inventory...</p>
) : error ? (
  <p>{error}</p>
) : products.length === 0 ? (
  <p>No products have been added to the database yet.</p>
) : (
  <div className="admin-table">
    {products.map((product) => (
      <div key={product.id}>
        <span className="inventory-product-name">
          {product.name}
        </span>
        <span className="inventory-category">
          {product.category}
        </span>
        <b className="inventory-price">
          {money(product.price)}
        </b>
      </div>
    ))}
  </div>
)}


          <p className="small-note">
            This page is a catalog overview, not a secure admin management
            panel. Adding, editing and deleting products requires admin
            authentication and backend API requests.
          </p>
        </main>
      )}

      <footer className="footer">
        <div className="footer-brand">
          nova<span>mart.</span>
        </div>
        <p>Thoughtful essentials for everyday living.</p>
        <div>
          © {new Date().getFullYear()} NovaMart · E-Commerce Project
        </div>
      </footer>
    </div>
  );
}

export default App;
