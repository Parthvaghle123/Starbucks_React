// src/OrderSuccess.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Loader.css"; // Loader animation CSS

const OrderSuccess = ({ message = "Please Wait...", redirectUrl = "/orders", seconds = 3 }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, redirectUrl]);

  return (
    <div className="d-flex justify-content-center align-items-center flex-column vh-100">
      <div className="loader"></div>
      <h4 className="fw-bold display-6 text-center fst-italic text-black">
        {message} <span>{timeLeft}</span>
      </h4>
    </div>
  );
};

export default OrderSuccess;
