import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUsers,
  faShoppingCart,
  faBoxes,
  faSignOutAlt,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import "./AdminNavbar.css";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top admin-navbar">
      <div className="container">
        {/* Brand */}
        <NavLink
          className="navbar-brand fw-bold fs-4 d-flex"
          to="/admin/dashboard"
        >
          <img
            src="https://www.starbucks.in/assets/icon/logo.png"
            alt=""
            width="50"
            height="50"
          />
          <h3 className="fs-4 ms-1">Starbucks</h3>
        </NavLink>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbarContent"
          aria-controls="adminNavbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        {/* Navbar content */}
        <div className="collapse navbar-collapse" id="adminNavbarContent">
          {/* Main navigation links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active fw-bold" : ""}`
                }
                to="/admin/dashboard"
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="me-1" />
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active fw-bold" : ""}`
                }
                to="/admin/users"
              >
                <FontAwesomeIcon icon={faUsers} className="me-1" />
                Users
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active fw-bold" : ""}`
                }
                to="/admin/orders"
              >
                <FontAwesomeIcon icon={faShoppingCart} className="me-1" />
                Orders
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active fw-bold" : ""}`
                }
                to="/admin/products"
              >
                <FontAwesomeIcon icon={faBoxes} className="me-1" />
                Products
              </NavLink>
            </li>
          </ul>

          {/* Right side - User info and logout */}
          <div className="navbar-nav">
            <div className="nav-item dropdown">
              <a
                className="text-decoration-none dropdown-toggle text-dark "
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-user-shield me-1"></i>
                Admin
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item-text text-muted small">
                    <i className="fas fa-crown me-1"></i>
                    Administrator
                  </span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
