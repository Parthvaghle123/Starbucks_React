import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import "./css/Cart.css";

const PAYMENT_TIMEOUT_SECONDS = 60; // 1 minute

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

  // QR payment popup state
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrModalPhase, setQrModalPhase] = useState("waiting"); // "waiting" | "success" | "timeout" | "submit_error"
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const timeoutRef = useRef(null);
  const timerRef = useRef(null);

  const UPI_ID = "vaghelaparth2005-2@oksbi";

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:4500/user/profile1", {
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

    fetchUserProfile();
    fetchCart();
  }, []);

  // Countdown timer when QR modal is open and in "waiting" phase
  useEffect(() => {
    if (!showQRModal || qrModalPhase !== "waiting") return;

    setTimeLeft(PAYMENT_TIMEOUT_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setQrModalPhase("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showQRModal, qrModalPhase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN${timestamp}${random}`;
  };

  const closeQRModal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowQRModal(false);
    setQrModalPhase("waiting");
    setTimeLeft(PAYMENT_TIMEOUT_SECONDS);
  };

  const openQRModal = () => {
    setErrorMsg("");
    setQrModalPhase("waiting");
    setTimeLeft(PAYMENT_TIMEOUT_SECONDS);
    setShowQRModal(true);
  };

  const handleRetryPayment = () => {
    setQrModalPhase("waiting");
    setTimeLeft(PAYMENT_TIMEOUT_SECONDS);
  };

  const submitOrderAfterPayment = async () => {
    setSubmittingOrder(true);
    const txId = generateTransactionId();

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        paymentMethod: "Online Payment",
        paymentType: "QRCode",
        transactionId: txId,
        paymentStatus: "Paid",
      };

      await axios.post("http://localhost:4500/order", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQrModalPhase("success");
      setErrorMsg("");

      // Brief success message in modal then redirect
      timeoutRef.current = setTimeout(() => {
        closeQRModal();
        navigate("/order-success");
      }, 1500);
    } catch (err) {
      console.error("Order failed", err);
      setQrModalPhase("submit_error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.paymentMethod === "Online Payment") {
      openQRModal();
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const payload = { ...formData, paymentStatus: "Pending" };
      await axios.post("http://localhost:4500/order", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/order-success");
    } catch (err) {
      console.error("Order failed", err);
      setErrorMsg("❌ Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const upiPaymentString = `upi://pay?pa=${UPI_ID}&am=${totalAmount}&cu=INR&tn=Starbucks Order`;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
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
                ></textarea>
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
                        Online Payment (QR)
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
                    ? "Proceed to payment"
                    : "Submit order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* QR Payment Modal */}
      {showQRModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {qrModalPhase === "waiting" && "Complete payment"}
                  {qrModalPhase === "success" && "Payment successful"}
                  {qrModalPhase === "timeout" && "Payment timed out"}
                  {qrModalPhase === "submit_error" && "Something went wrong"}
                </h5>
                {(qrModalPhase === "timeout" || qrModalPhase === "submit_error") && (
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeQRModal}
                    aria-label="Close"
                  />
                )}
              </div>
              <div className="modal-body text-center">
                {qrModalPhase === "waiting" && (
                  <>
                    <p className="mb-2">Scan QR code to pay <strong>₹{totalAmount}</strong></p>
                    <div className="d-flex justify-content-center mb-3">
                      <QRCodeSVG value={upiPaymentString} size={200} />
                    </div>
                    <p className="text-muted small mb-2">
                      Time remaining: <strong className={timeLeft <= 30 ? "text-danger" : ""}>{formatTime(timeLeft)}</strong>
                    </p>
                    <button
                      type="button"
                      className="btn btn-success btn-lg fw-bold"
                      onClick={submitOrderAfterPayment}
                      disabled={submittingOrder}
                    >
                      {submittingOrder ? "Submitting order…" : "I've completed payment"}
                    </button>
                  </>
                )}
                {qrModalPhase === "success" && (
                  <>
                    <div className="text-success display-6 mb-2 ">✅</div>
                    <p className="mb-0 fw-bold">Order placed successfully. Redirecting…</p>
                  </>
                )}
                {qrModalPhase === "timeout" && (
                  <>
                    <p className="text-danger mb-3 fw-bold">
                      Payment was not completed within 1 minute. You can try again.
                    </p>
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                      <button
                        type="button"
                        className="btn btn-outline-primary fw-bold"
                        onClick={closeQRModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-success fw-bold"
                        onClick={handleRetryPayment}
                      >
                        Retry payment
                      </button>
                    </div>
                  </>
                )}
                {qrModalPhase === "submit_error" && (
                  <>
                    <p className="text-danger mb-3">Order could not be placed. Please try again.</p>
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                      <button
                        type="button"
                        className="btn btn-outline-secondary fw-bold"
                        onClick={closeQRModal}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary fw-bold"
                        onClick={() => {
                          setQrModalPhase("waiting");
                          submitOrderAfterPayment();
                        }}
                      >
                        Retry submit order
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Check;
