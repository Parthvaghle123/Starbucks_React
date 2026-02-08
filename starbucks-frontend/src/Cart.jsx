import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/Cart.css";
import { Link } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4500/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cart = res.data.cart || [];
      setCartItems(cart);
      const total = cart.reduce((sum, item) => sum + item.total, 0);
      setTotalAmount(total);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const updateQuantity = async (productId, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:4500/update-quantity/${productId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:4500/remove-from-cart/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  return (
    <div className="container mt-5">
      {cartItems.length === 0 ? (
        <div className="alert alert-warning text-center fw-bold fs-5">
          🛒 Your cart is empty.
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div className="table-responsive card-custom">
              <table className="table table-bordered align-middle text-center shadow-sm ">
                <thead className="table">
                  <tr className="tr">
                    <th>Image</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.productId}>
                      <td>
                        <img
                          src={item.image}
                          alt={item.title}
                          width="60"
                          className="img-fluid rounded"
                        />
                      </td>
                      <td>{item.title}</td>
                      <td>₹{item.price}</td>
                      <td>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, "decrease")
                            }
                            className="btn btn-outline-danger btn-sm"
                          >
                            −
                          </button>
                          <span className="fw-bold">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, "increase")
                            }
                            className="btn btn-outline-success btn-sm"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>₹{item.total}</td>
                      <td>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="btn btn-danger btn-sm btn-remove"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Total Amount Row */}
                  <tr>
                    <td colSpan="4" className="text-end fw-bold">
                      Total:
                    </td>
                    <td className="text-success fw-bold fs-5">
                      ₹{totalAmount}
                    </td>
                    <td className="text-center">
                      <Link
                        to="/checkout"
                        className="btn btn-success btn-md btn-order"
                      >
                        Order Now
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
