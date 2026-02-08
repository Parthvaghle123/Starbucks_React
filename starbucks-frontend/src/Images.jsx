// src/ProductList.jsx
import React from "react";
import products from "./products";
import "./css/images.css"; // Link to the CSS below
import "bootstrap/dist/css/bootstrap.min.css";

const Images = () => {
  return (
    <>
      <div id="products" className="container mt-4 mb-2">
        {products.map((item) => (
          <div key={item.id} className="text-center">
            <div className="img-box1">
              <img src={item.image} alt={item.title} className="images" />
            </div>
            <h6 className="text-center fw-bold mt-1 h6">{item.title}</h6>
          </div>
        ))}
      </div>
    </>
  );
};

export default Images;
