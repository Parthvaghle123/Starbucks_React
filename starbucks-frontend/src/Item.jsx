import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Home.css";
import axios from "axios";

// 🔹 Static Product List
const products1 = [
  {
    id: 0,
    image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/100501.jpg",
    title: "Java Chip Frappuccino",
    per: "Mocha sauce and Frappuccino® chips blended with with Frappu..",
    price: 441,
  },
  {
    id: 1,
    image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/112539.jpg",
    title: "Picco Cappuccino",
    per: "Dark, Rich in flavour espresso lies in wait under a smoothed..",
    price: 200,
  },
  {
    id: 2,
    image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/100385.jpg",
    title: "Iced Caffe Latte",
    per: "Our dark, Rich in flavour espresso is combined with milk and..",
    price: 372,
  },
];

const Item = () => {
  const [filteredProducts, setFilteredProducts] = useState(products1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 🔹 Search Filter
  useEffect(() => {
    const query =
      new URLSearchParams(location.search).get("q")?.toLowerCase() || "";
    if (query) {
      setLoading(true);
      setTimeout(() => {
        const filtered = products1.filter((item) =>
          item.title.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
        setLoading(false);
      }, 800);
    } else {
      setFilteredProducts(products1);
    }
  }, [location.search]);

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
          productId: product.id.toString(),
          image: product.image,
          title: product.title,
          price: product.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setToastMessage(`${product.title} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Already added item");
    }
  };

  return (
    <>
      {/* 🔹 Toast Popup */}
      {showToast && <div className="toast-popup bg-success">🛒 {toastMessage}</div>}

      <div className="Herosection_1">
        <div className="container">
          {/* Loader */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center my-5">
              <div className="spinner-border text-success mb-4" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              className="alert alert-danger text-center mt-3 fw-bold mb-4 m-auto"
              style={{
                width: "18%",
                backgroundColor: "#e7414c",
              }}
            >
               Product not found
            </div>
          ) : (
            <div className="container" id="products1">
              {filteredProducts.map((item) => (
                <div key={item.id} className="box">
                  <div className="img-box1">
                    <img className="images1" src={item.image} alt={item.title} />
                  </div>

                  <div className="bottom">
                    <h2>{item.title}</h2>
                    <h4>{item.per}</h4>
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
