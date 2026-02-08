import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Images from "./Images";
// import "./Home.css";
import Item from "./Item";
const Home = ({ setUsername }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const username = searchParams.get('username');

    if (token && username) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      if (setUsername) setUsername(username);
      navigate('/home', { replace: true });
    }
  }, [searchParams, navigate, setUsername]);
  return (
    <>
      {/* Carousel Section */}
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div
              id="carouselExampleControls"
              className="carousel slide mt-5"
              data-bs-ride="carousel"
            >
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img
                    src="https://cdn.sbux.com.my/media/bc78f7ce-b47d-43e3-b297-14543013d3a8.jpg"
                    className="d-block w-100 img-fluid"
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                    alt="carousel 1"
                  />
                </div>
                <div className="carousel-item">
                  <img
                    src="https://cdn.sbux.com.my/media/34163518-78f9-4a5e-afba-3d969535f4c8.webp"
                    className="d-block w-100 img-fluid"
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                    alt="carousel 2"
                  />
                </div>
                <div className="carousel-item">
                  <img
                    src="https://pbs.twimg.com/media/EhpesVAWsAE7Tmj.jpg"
                    className="d-block w-100 img-fluid"
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                    alt="carousel 3"
                  />
                </div>
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleControls"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon"></span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleControls"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Handcrafted Section */}
      <div className="Herosection_1">
        <div className="container">
          <h3 className="mt-5 pt-3 text-success head fw-bold h3">
            Handcrafted Curations
          </h3>
          <Images />
        </div>
      </div>

      <div className="Herosection_2">
        <div className="container">
          {/* Heading and Button in one row */}
          <div className="d-flex justify-content-between align-items-center mt-2 pt-4 mb-3 flex-wrap">
            <h3 className="text-success head h3 fw-bold mb-0">
              Barista Recommends
            </h3>

            <a
              href="/menu" // Replace with Link if using React Router
              className="btn btn-outline-success btn-sm fw-bold btn-font"
            >
              <i className="fas fa-utensils me-1"></i> View Menu
            </a>
          </div>
          <Item />
        </div>
      </div>

      <div className="Herosection_3 mt-4">
        <div className="container">
          <h3 className="mt-3 pt-4 text-success head fw-bold h3">
            Learn more about the world of coffee!
          </h3>
          <div className="card bg-dark text-white mt-4 mb-4">
            <img
              src="https://preprodtsbstorage.blob.core.windows.net/cms/uploads/ICW_Live_Event_Day5_41f11ca3d2.jpg"
              className="card-img"
              height="400px"
              alt="coffee event"
            />
            <div
              className="card-img-overlay"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <h5 className="card-title fs-4 ms-4 head fw-bold">
                Art & Science Of Coffee Brewing
              </h5>
              <p className="card-text ms-4 fw-bold">
                Master the perfect brew with starbucks! Learn the art and
                science of coffee brewing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modern Footer */}
      <footer className="text-white pt-5 pb-3 fw-medium shadow-lg footer">
        <div className="container">
          <div className="row justify-content-start">
            {/* Contact Info Left Aligned */}
            <div className="col-md-5 mb-4 text-md-start text-center">
              <h5 className="text-uppercase fw-bold text-white mb-3  border-white h5 pb-2">
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
                <strong className="text-white text-decoration-none">
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

export default Home;
