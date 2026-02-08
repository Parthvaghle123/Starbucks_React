import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Profile.css";

const Profile = ({ token: propToken }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(
    propToken || localStorage.getItem("token")
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    country_code: "+91",
    gender: "",
    dob: "",
    address: "",
  });

  const fetchProfile = useCallback(
    async (currentToken) => {
      if (!currentToken) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:4500/user/profile", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        const data = response.data;
        setProfile({
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          country_code: data.country_code || "+91",
          gender: data.gender || "",
          dob: data.dob || "",
          address: data.address || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setErrorMessage("Failed to load profile");
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const usernameParam = searchParams.get("username");

    if (tokenParam && usernameParam) {
      localStorage.setItem("token", tokenParam);
      localStorage.setItem("username", usernameParam);
      setToken(tokenParam);
      navigate("/profile", { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const currentToken = propToken || localStorage.getItem("token");
    if (!currentToken) {
      navigate("/login");
      return;
    }
    setToken(currentToken);
    fetchProfile(currentToken);
  }, [propToken, navigate, fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setProfile((prev) => ({ ...prev, [name]: value || "" }));
      }
    } else if (name === "username") {
      if (/^[A-Za-z\s]*$/.test(value)) {
        setProfile((prev) => ({ ...prev, [name]: value || "" }));
      }
    } else {
      setProfile((prev) => ({ ...prev, [name]: value || "" }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!profile.username || profile.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(profile.username)) {
      newErrors.username = "Username must contain only letters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(profile.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits.";
    }

    if (!profile.gender) {
      newErrors.gender = "Please select gender.";
    }

    if (!profile.dob) {
      newErrors.dob = "Date of birth is required.";
    } else {
      const today = new Date();
      const dobDate = new Date(profile.dob);
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dobDate.getDate())
      ) {
        age--;
      }

      if (age < 14) {
        newErrors.dob = "You must be at least 14 years old.";
      }
    }

    if (!profile.address || profile.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      const response = await axios.put(
        "http://localhost:4500/user/profile",
        profile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Profile successfully ✅");
        setIsEditing(false);
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/home");
        }, 1000);
      }
      setSaving(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMessage("Failed to update profile");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {successMessage && (
        <div className="toast-popup bg-success">{successMessage}</div>
      )}

      <div className="body">
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
          <div className="profile-container bg-white p-4 shadow">
            <h2 className="text-success text-center mb-3 h2">My Profile</h2>
            <hr />

            {errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* ================= VIEW MODE ================= */}
            {!isEditing ? (
              <div className="profile-view">
                <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                  <div className="d-flex flex-column flex-fill ">
                    <label className="form-label">Username</label>
                    <input
                      className="form-control"
                      value={profile.username}
                      readOnly
                    />
                  </div>
                  <div className="d-flex flex-column flex-fill ">
                    <label className="form-label ">Email</label>
                    <input
                      className="form-control"
                      value={profile.email}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                  <div className="d-flex flex-column flex-fill ">
                    <label className="form-label ">Phone</label>
                    <input
                      className="form-control"
                      value={
                        profile.phone
                          ? `${profile.country_code} ${profile.phone}`
                          : "Not set"
                      }
                      readOnly
                    />
                  </div>
                  <div className="d-flex flex-column flex-fill ">
                    <label className="form-label ">Gender</label>
                    <input
                      className="form-control"
                      value={
                        profile.gender
                          ? profile.gender.charAt(0).toUpperCase() +
                            profile.gender.slice(1)
                          : "Not set"
                      }
                      readOnly
                    />
                  </div>
                </div>

                <div className="mb-3 d-flex flex-column flex-fill">
                  <label className="form-label ">Date of Birth</label>
                  <input
                    className="form-control"
                    value={
                      profile.dob
                        ? new Date(profile.dob).toLocaleDateString()
                        : "Not set"
                    }
                    readOnly
                  />
                </div>

                <div className="mb-3 d-flex flex-column flex-fill">
                  <label className="form-label">Address</label>
                  <input
                    className="form-control"
                    value={profile.address || "Not set"}
                    readOnly
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success w-100 fw-bold mt-3"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="btn  w-100 fw-bold mt-3"
                    style={{
                      backgroundColor: "#343a40",
                      color: "white",
                      width: "50%",
                    }}
                    onClick={() => navigate("/home")}
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                  <div className="d-flex flex-column flex-fill">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      value={profile.username}
                      onChange={handleChange}
                      required
                    />
                    {errors.username && (
                      <small className="text-danger">{errors.username}</small>
                    )}
                  </div>

                  <div className="d-flex flex-column flex-fill">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={profile.email}
                      disabled
                    />
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
                      value={profile.phone}
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
                    value={profile.gender}
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

                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="2"
                    style={{ resize: "none", height: "80px" }}
                    value={profile.address}
                    onChange={handleChange}
                    required
                  ></textarea>
                  {errors.address && (
                    <small className="text-danger">{errors.address}</small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={
                      profile.dob
                        ? new Date(profile.dob).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={handleChange}
                    required
                  />
                  {errors.dob && (
                    <small className="text-danger">{errors.dob}</small>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success w-100 fw-bold"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Submit"}
                  </button>
                  <button
                    type="button"
                    className="btn w-100 fw-bold"
                    style={{ backgroundColor: "#343a40", color: "white" }}
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile(token);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
