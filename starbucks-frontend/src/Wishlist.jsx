import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/Wishlist.css";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const fetchWishlist = async () => {
    if (!token) {
      setLoading(false);
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4500/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.items || []);
      setError("");
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`http://localhost:4500/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      showToastMessage("Item removed from wishlist");
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);
      showToastMessage("Failed to remove item");
    }
  };

  const handleMoveToCart = async (productId) => {
    if (!token) {
      alert("Please login to move items to cart.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:4500/wishlist/move-to-cart",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToastMessage(res.data.message || "Item moved to cart");
      fetchWishlist();
    } catch (err) {
      console.error("Failed to move item to cart:", err);
      showToastMessage("Failed to move item to cart");
    }
  };

  if (!token) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center fw-bold fs-5">
          Please login to view your wishlist.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {showToast && (
        <div className="wishlist-toast bg-success text-white">
          {toastMessage}
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center fw-bold">{error}</div>
      ) : items.length === 0 ? (
        <div className="alert alert-warning text-center fw-bold fs-5">
          ❤️ Your wishlist is empty.
        </div>
      ) : (
        <div className="wishlist-page">
          <h2 className="wishlist-page-title display-6 fs-2 mb-4 fw-bold text-center">
            ❤️ My Wishlist
          </h2>{" "}
          <div className="wishlist-tiles">
            {items.map((item) => (
              <article key={item.productId} className="wishlist-tile">
                <div className="wishlist-tile-thumb">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="wishlist-tile-info">
                  <h3 className="wishlist-tile-title">{item.title}</h3>
                  <span className="wishlist-tile-price">₹{item.price}.00</span>
                </div>
                <div className="wishlist-tile-actions">
                  <button
                    onClick={() => handleMoveToCart(item.productId)}
                    className="wishlist-tile-btn wishlist-tile-btn-cart fw-bold"
                  >
                    Move to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="wishlist-tile-btn wishlist-tile-btn-remove fw-bold"
                    aria-label="Remove from wishlist"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
