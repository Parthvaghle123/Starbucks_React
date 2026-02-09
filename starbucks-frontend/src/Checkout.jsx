import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/Cart.css";

const API_BASE = "http://localhost:4500";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Check = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    countryCode: "+91",
    address: "",
    paymentMethod: "Cash On Delivery",
  });

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE}/user/profile1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData((prev) => ({
          ...prev,
          email: res.data.email || "",
          phone: res.data.phone || "",
        }));
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };

    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cart = res.data.cart || [];
        setCartItems(cart);
        const total = cart.reduce((sum, item) => sum + (item.total || item.price * (item.quantity || 1)), 0);
        setTotalAmount(total);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    fetchUserProfile();
    fetchCart();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrderWithRazorpay = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg("Please log in to continue.");
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setErrorMsg("");
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg("Payment gateway could not be loaded. Please try again.");
        setLoading(false);
        submittingRef.current = false;
        return;
      }

      const { data: orderData } = await axios.post(
        `${API_BASE}/api/create-razorpay-order`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, key } = orderData;
      if (!key || !orderId) {
        setErrorMsg(orderData.message || "Could not create payment order.");
        setLoading(false);
        submittingRef.current = false;
        return;
      }

      const options = {
        key,
        amount: String(amount),
        currency: currency || "INR",
        name: "Starbucks",
        description: "Order payment",
        order_id: orderId,
        prefill: {
          name: formData.email?.split("@")[0] || "Customer",
          email: formData.email,
          contact: (formData.countryCode || "") + (formData.phone || ""),
        },
        theme: { color: "#00704a" },
        handler: async (response) => {
          try {
            await axios.post(
              `${API_BASE}/order`,
              {
                ...formData,
                paymentMethod: "Online Payment",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate("/order-success");
          } catch (err) {
            console.error("Order failed after payment", err);
            setErrorMsg(err.response?.data?.message || "Order could not be placed. Please contact support with your payment ID.");
          } finally {
            setLoading(false);
            submittingRef.current = false;
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            submittingRef.current = false;
            alert("Payment cancelled. Please make payment to complete your order.");
            navigate("/cart", { state: { paymentCancelled: true, message: "Please make payment to complete your order." } });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error", err);
      setErrorMsg(err.response?.data?.message || "Payment could not be started. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.paymentMethod === "Online Payment") {
      await placeOrderWithRazorpay();
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const payload = { ...formData, paymentStatus: "Pending" };
      await axios.post(`${API_BASE}/order`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/order-success");
    } catch (err) {
      console.error("Order failed", err);
      setErrorMsg(err.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9">
          <div className="card shadow-lg border-0 p-4 rounded-4">
            <h1 className="fs-3 text-success text-center fw-bold checkout-title">
              Payment
            </h1>
            <p className="text-success fw-bold text-center checkout-subtitle">
              Brew & Pay • Easy Checkout
            </p>
            <hr />
            {errorMsg && (
              <div className="alert alert-danger py-2">{errorMsg}</div>
            )}

            <form onSubmit={placeOrder}>
              <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label fw-semibold">Email ID</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-lg rounded-3"
                    value={formData.email}
                    readOnly
                    required
                  />
                </div>
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={formData.countryCode}
                      style={{ maxWidth: "100px", height: "50px" }}
                      disabled
                    >
                      <option value="+91">+91 🇮🇳</option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      readOnly
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Shipping Address</label>
                <textarea
                  name="address"
                  className="form-control rounded-3"
                  placeholder="Enter your address"
                  style={{ resize: "none", height: "100px" }}
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Payment Method</label>
                <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                  <div className="d-flex flex-column flex-fill">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        value="Cash On Delivery"
                        checked={formData.paymentMethod === "Cash On Delivery"}
                        onChange={handleChange}
                        id="cod"
                      />
                      <label className="form-check-label" htmlFor="cod">
                        Cash on Delivery
                      </label>
                    </div>
                  </div>
                  <div className="d-flex flex-column flex-fill me-5">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        value="Online Payment"
                        checked={formData.paymentMethod === "Online Payment"}
                        onChange={handleChange}
                        id="online"
                      />
                      <label className="form-check-label" htmlFor="online">
                        Razorpay (Card / UPI / Net Banking)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-grid mt-4">
                <button
                  type="submit"
                  className="btn7 fw-bold w-100"
                  style={{
                    height: "40px",
                    fontSize: "17px",
                    borderRadius: "5px",
                  }}
                  disabled={loading}
                >
                  {formData.paymentMethod === "Online Payment"
                    ? "Pay ₹" + totalAmount.toFixed(0) + " with Razorpay"
                    : "Place order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Check;
