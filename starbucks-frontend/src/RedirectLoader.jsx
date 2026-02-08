// RedirectLoader.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Loader.css"; // Optional if CSS is separated

const RedirectLoader = ({ seconds = 3, redirectUrl = "/" }) => {
  const [count, setCount] = useState(seconds);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup
  }, [navigate, redirectUrl]);

  return (
    <div style={{ height: "90vh" }} className="d-flex justify-content-center align-items-center flex-column">
      <div className="loader"></div>
      <h4 className="fw-bold text-center fst-italic display-6 text-black">
        Please wait... <span>{count}</span>
      </h4>
    </div>
  );
};

export default RedirectLoader;
