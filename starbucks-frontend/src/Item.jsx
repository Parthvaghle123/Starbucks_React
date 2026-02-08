import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Home.css";
import axios from "axios";

const Item = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 🔹 Fetch products marked "Show on Item (Home)" by admin
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:4500/api/products?displayOnItem=true");
        const sortedProducts = (response.data || []).sort((a, b) => {
          const dateA = new Date(a.createdAt || a._id);
          const dateB = new Date(b.createdAt || b._id);
          return dateB - dateA;
        });
        setProducts(sortedProducts);
        setFilteredProducts(sortedProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🔹 Search Filter
  useEffect(() => {
    const query =
      new URLSearchParams(location.search).get("q")?.toLowerCase() || "";
    if (query) {
      const filtered = products.filter((item) =>
        (item.name || "").toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [location.search, products]);

  // 🔹 Add To Cart Function
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
          productId: product._id.toString(),
          image: product.image,
          title: product.name,
          price: product.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setToastMessage(`${product.name} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Already added item");
    }
  };

  return (
    <>
      {showToast && <div className="toast-popup bg-success">🛒 {toastMessage}</div>}

      <div className="Herosection_1">
        <div className="container">
          {loading && products.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center my-5">
              <div className="spinner-border text-success mb-4" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="empty-state-box">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state-box">Product not found</div>
          ) : (
            <div className="container" id="products1">
              {filteredProducts.map((item) => (
                <div key={item._id} className="box">
                  <div className="img-box1">
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
          )}
        </div>
      </div>
    </>
  );
};

export default Item;
