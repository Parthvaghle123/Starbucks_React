import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Signup.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    country_code: "+91",
    gender: "",
    dob: "",
    address: "",
  });

  const [password, setPassword] = useState("");
  const [strengthMessage, setStrengthMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  // ===============================
  // HANDLE CHANGE (REAL-TIME)
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // PHONE
    if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setForm((prev) => ({ ...prev, phone: value }));
        setErrors((prev) => ({
          ...prev,
          phone:
            value === ""
              ? ""
              : value.length !== 10
              ? "Phone must be exactly 10 digits."
              : "",
        }));
      }
    }

    // USERNAME
    else if (name === "username") {
      if (/^[A-Za-z\s]*$/.test(value)) {
        setForm((prev) => ({ ...prev, username: value }));
        setErrors((prev) => ({
          ...prev,
          username:
            value === ""
              ? ""
              : value.length < 3
              ? "Username must be at least 3 characters."
              : "",
        }));
      }
    }

    // EMAIL
    else if (name === "email") {
      setForm((prev) => ({ ...prev, email: value }));
      setErrors((prev) => ({
        ...prev,
        email:
          value === ""
            ? ""
            : !gmailRegex.test(value)
            ? "Only valid @gmail.com email allowed."
            : "",
      }));
    }

    // GENDER
    else if (name === "gender") {
      setForm((prev) => ({ ...prev, gender: value }));
      setErrors((prev) => ({ ...prev, gender: "" }));
    }

    // DOB
    else if (name === "dob") {
      setForm((prev) => ({ ...prev, dob: value }));

      if (value === "") {
        setErrors((prev) => ({ ...prev, dob: "" }));
        return;
      }

      const today = new Date();
      const dobDate = new Date(value);
      let age = today.getFullYear() - dobDate.getFullYear();
      const m = today.getMonth() - dobDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;

      setErrors((prev) => ({
        ...prev,
        dob: age < 14 ? "You must be at least 14 years old." : "",
      }));
    }

    // ADDRESS
    else if (name === "address") {
      setForm((prev) => ({ ...prev, address: value }));
      setErrors((prev) => ({
        ...prev,
        address:
          value === ""
            ? ""
            : value.length < 5
            ? "Address must be at least 5 characters."
            : "",
      }));
    }
  };

  // ===============================
  // PASSWORD REAL-TIME
  // ===============================
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (value === "") {
      setStrengthMessage("");
      setErrors((prev) => ({ ...prev, password: "" }));
    } else if (value.length < 4) {
      setStrengthMessage("Weak password ❌");
      setErrors((prev) => ({
        ...prev,
        password:
          "Password must be 8+ chars, 1 uppercase, 1 number, 1 special char.",
      }));
    } else if (passwordRegex.test(value)) {
      setStrengthMessage("Strong password ✅");
      setErrors((prev) => ({ ...prev, password: "" }));
    } else {
      setStrengthMessage("Moderate password ⚠️");
      setErrors((prev) => ({
        ...prev,
        password:
          "Password must be 8+ chars, 1 uppercase, 1 number, 1 special char.",
      }));
    }
  };

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (Object.values(errors).some((err) => err !== "")) return;

    axios
      .post("http://localhost:4500/register", {
        ...form,
        password,
      })
      .then((res) => {
        if (res.data.success) {
          setToastMessage("Registration successful ✅");
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
          setTimeout(() => navigate("/login"), 1000);
        }
      })
      .catch(() => {
        setErrorMessage("Someone error occurred. Please try again.");
      });
  };

  return (
    <>
      {showSuccessToast && (
        <div className="toast-popup bg-success">{toastMessage}</div>
      )}

      <div className="body">
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
          <div className="signup-container bg-white p-4 shadow">
            <h2 className="text-success text-center mb-3 h2">Sign-Up</h2>
            <hr />

            {errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                {/* Username */}
                <div className="d-flex flex-column flex-fill ">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder="Enter your name"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && (
                    <small className="text-danger">{errors.username}</small>
                  )}
                </div>

                {/* Email */}
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="example@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <small className="text-danger">{errors.email}</small>
                  )}
                </div>
              </div>

              <div className="row g-3">
                {/* Phone */}
                <div className="col-12 col-sm-6">
                  <label className="form-label">Phone</label>

                  <div className="input-group phone-group">
                    <span className="input-group-text country-code">+91</span>

                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="1234567890"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {errors.phone && (
                    <small className="text-danger">{errors.phone}</small>
                  )}
                </div>

                {/* Gender */}
                <div className="col-12 col-sm-6">
                  <label className="form-label">Gender</label>

                  <select
                    className="form-select gender-select"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>

                  {errors.gender && (
                    <small className="text-danger">{errors.gender}</small>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  placeholder="Enter your address"
                  rows="2"
                  style={{ resize: "none", height: "80px" }}
                  value={form.address}
                  onChange={handleChange}
                  required
                ></textarea>
                {errors.address && (
                  <small className="text-danger">{errors.address}</small>
                )}
              </div>
              <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={form.dob}
                    onChange={handleChange}
                    required
                  />
                  {errors.dob && (
                    <small className="text-danger">{errors.dob}</small>
                  )}
                </div>
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="********"
                    className="form-control"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <small className="text-muted">{strengthMessage}</small>
                  {errors.password && (
                    <small className="text-danger d-block">
                      {errors.password}
                    </small>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn7 fw-bold w-100 rounded"
                disabled={Object.values(errors).some((e) => e !== "")}
              >
                Register
              </button>
            </form>
               <p className="text-center mt-3">
              Already registered?{" "}
              <a
                href="/login"
                className="text-decoration-none fw-bold text-success"
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
