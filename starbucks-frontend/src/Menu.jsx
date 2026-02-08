import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Menu.css";
import axios from "axios";

const Item = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const menuCategories = [
    "All",
    "Bestseller",
    "Drinks",
    "Food",
    "Coffee At Home",
    "Ready to Eat",
  ];
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);

 // 🔹 Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          "http://localhost:4500/api/products?displayOnMenu=true"
        );

        const sortedProducts = response.data.sort((a, b) => {
          const dateA = new Date(a.createdAt || a._id);
          const dateB = new Date(b.createdAt || b._id);
          return dateB - dateA;
        });

        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
        setError(null);

        const isFirstLoad = !sessionStorage.getItem("giftPageLoaded");

        if (isFirstLoad) {
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem("giftPageLoaded", "true");
          }, 700);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🔹 Fetch wishlist for current user
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        setWishlistIds([]);
        return;
      }
      try {
        const res = await axios.get("http://localhost:4500/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = (res.data.items || []).map((item) => item.productId);
        setWishlistIds(ids);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    fetchWishlist();
  }, [token]);

  // 🔹 Search Filter
  useEffect(() => {
    const query =
      new URLSearchParams(location.search).get("q")?.toLowerCase() || "";

    if (query) {
      setLoading(true);
      setTimeout(() => {
        const filtered = products.filter((item) =>
          item.name.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
        setLoading(false);
      }, 600);
    } else {
      setFilteredProducts(products);
    }
  }, [location.search, products]);

  // ✅ CATEGORY FILTER (FIX)
  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
    setShowAll(false);
  }, [activeCategory, products]);

  // 🔹 Display products
  useEffect(() => {
    if (showAll) {
      setDisplayedProducts(filteredProducts);
    } else {
      setDisplayedProducts(filteredProducts.slice(0, 12));
    }
  }, [filteredProducts, showAll]);

  // 🔹 Add to cart
  const addToCart = async (product) => {
    if (!token) {
      alert("Please login to add items to cart.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4500/add-to-cart",
        {
          productId: product._id,
          image: product.image,
          title: product.name,
          price: product.price,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setToastMessage(`${product.name} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Already added item");
    }
  };

  // 🔹 Toggle wishlist (add / remove)
  const toggleWishlist = async (product) => {
    if (!token) {
      alert("Please login to manage wishlist.");
      navigate("/login");
      return;
    }

    const isWishlisted = wishlistIds.includes(product._id);

    try {
      if (isWishlisted) {
        await axios.delete(
          `http://localhost:4500/wishlist/remove/${product._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWishlistIds((prev) => prev.filter((id) => id !== product._id));
      } else {
        await axios.post(
          "http://localhost:4500/wishlist/add",
          {
            productId: product._id,
            image: product.image,
            title: product.name,
            price: product.price,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistIds((prev) => [...prev, product._id]);
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      alert("Failed to update wishlist");
    }
  };
  if (loading && products.length === 0) {
    return (
      <div className="Herosection_1">
        <div className="container">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "200px", width: "100%" }}
          >
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Herosection_1">
        <div className="container">
          <div className="alert alert-danger text-center">❌ {error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showToast && (
        <div className="toast-popup bg-success">🛒 {toastMessage}</div>
      )}
      <div className="Herosection_1">
        <div className="container">
          <div className="category-pills mb-3">
            {menuCategories.map((cat) => (
              <button
                key={cat}
                className={`pill-btn1 ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center my-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              className="alert alert-danger text-center mt-3 fw-bold align-items-center"
              style={{
                width: "18%",
                backgroundColor: "#e7414c",
                margin: "20px auto", // centers horizontally
              }}
            >
              Product not found
            </div>
          ) : (
            <>
              <div id="products3">
                {displayedProducts.map((item) => (
                  <div key={item._id} className="box2">
                    <div className="img-box1 position-relative">
                      <button
                        type="button"
                        className={`wishlist-heart-btn ${
                          wishlistIds.includes(item._id) ? "active" : ""
                        }`}
                        onClick={() => toggleWishlist(item)}
                        aria-label="Toggle wishlist"
                      >
                        <i
                          className={
                            wishlistIds.includes(item._id)
                              ? "fas fa-heart"
                              : "far fa-heart"
                          }
                        ></i>
                      </button>
                      <img className="images1" src={item.image} alt={item.name} />
                    </div>
                    <div className="bottom">
                      <h2>{item.name}</h2>
                      {item.rating != null && (
                        <div className="product-rating">
                          <span className="product-rating-stars">
                            {(() => {
                              const rating = Number(item.rating);
                              const fullStars = Math.floor(rating);
                              const hasHalfStar = (rating % 1) >= 0.5;
                              const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
                              
                              return (
                                <>
                                  {[...Array(fullStars)].map((_, i) => (
                                    <span key={`full-${i}`} className="star filled" aria-hidden>★</span>
                                  ))}
                                  {hasHalfStar && (
                                    <span key="half" className="star half" aria-hidden>
                                      <span className="half-star-filled">★</span>
                                      <span className="half-star-empty">☆</span>
                                    </span>
                                  )}
                                  {[...Array(emptyStars)].map((_, i) => (
                                    <span key={`empty-${i}`} className="star" aria-hidden>☆</span>
                                  ))}
                                </>
                              );
                            })()}
                          </span>
                          <span className="product-rating-value">
                            {Number(item.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                      <h4>{item.description}</h4>
                      <h3>₹{item.price}.00</h3>
                      <button className="btn4" onClick={() => addToCart(item)}>
                        Add Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredProducts.length > 12 && !showAll && (
                <div className="text-center mt-4 mb-4">
                  <a
                    href="#"
                    className="text-success text-decoration-none fw-bold"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAll(true);
                    }}
                    style={{
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    See More ({filteredProducts.length - 12} more products) →
                  </a>
                </div>
              )}
              {showAll && filteredProducts.length > 12 && (
                <div className="text-center mt-4 mb-4">
                  <a
                    href="#"
                    className="text-secondary text-decoration-none fw-bold mx-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAll(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    ↑ Show Less
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Enhanced Modern Footer */}
      <footer className="text-white pt-5 pb-3 fw-medium shadow-lg mt-3 footer">
        <div className="container">
          <div className="row justify-content-start">
            {/* Contact Info Left Aligned */}
            <div className="col-md-5 mb-4 text-md-start text-center">
              <h5 className="text-uppercase fw-bold text-white mb-3 h5 border-white pb-2">
                Contact
              </h5>
              <p className="mb-2">
                <i className="fas fa-map-marker-alt me-2 text-white"></i>
                Surat, Gujarat
              </p>
              <p className="mb-2">
                <i className="far fa-envelope me-2 text-white"></i>
                vaghelaparth2005@gmail.com
              </p>
              <p>
                <i className="fas fa-phone me-2 text-white"></i>
                +91 8735035021
              </p>
            </div>
          </div>

          <hr className=" border-secondary" />

          <div className="row align-items-center justify-content-between">
            <div className="col-md-6 text-md-start text-center  mb-md-0 headding-font">
              <p className="mb-0 fw-bold">
                Owned by:{" "}
                <strong className="text-whitetext-decoration-none">
                  Noob Ninjas
                </strong>
              </p>
            </div>

            {/* Social Icons Modernized */}
            <div className="col-md-6 text-md-end text-center">
              <ul className="list-inline mb-0">
                {[
                  { icon: "facebook-f", link: "https://www.facebook.com/" },
                  { icon: "x-twitter", link: "https://x.com/" },
                  { icon: "linkedin-in", link: "https://www.linkedin.com/in/parth-vaghela-177988343/" },
                  { icon: "instagram", link: "https://www.instagram.com/" },
                  { icon: "youtube", link: "https://www.youtube.com/" },
                ].map((social, idx) => (
                  <li className="list-inline-item mx-1" key={idx}>
                    <a
                      href={social.link}
                      className="social-icon d-inline-flex align-items-center justify-content-center rounded-circle"
                      aria-label={social.icon}
                    >
                      <i className={`fab fa-${social.icon}`}></i>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Item;
