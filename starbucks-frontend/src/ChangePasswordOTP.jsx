import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/Login.css";

const ChangePasswordOTP = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const showAlert = (message, type, clearAfter = 5000) => {
    setAlertMessage(message);
    setAlertType(type);
    if (clearAfter > 0) {
      setTimeout(() => setAlertMessage(""), clearAfter);
    }
  };

  // Step 1: Email verification and OTP sending
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:4500/verify-email-send-otp", {
        email: email.toLowerCase(),
      });

      if (res.data.success) {
        showAlert("Email verified! Sending OTP...", "success", 1000);
        
        setTimeout(() => {
          setStep(2);
          setAlertMessage(""); // Clear previous alert
          showAlert("OTP sent to your email successfully!", "success");
        }, 2000);
      } else {
        showAlert(res.data.message, "danger");
      }
    } catch (err) {
      showAlert("Failed to send OTP. Please try again.", "danger",err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP verification
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:4500/verify-otp", {
        email: email.toLowerCase(),
        otp,
      });

      if (res.data.success) {
        showAlert("OTP verified successfully!", "success");
        setStep(3);
      } else {
        showAlert(res.data.message, "danger");
      }
    } catch (err) {
      showAlert("OTP verification failed. Please try again.", "danger",err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showAlert("Passwords do not match!", "danger");
      return;
    }

    if (newPassword.length < 8) {
      showAlert("Password must be at least 8 characters!", "danger");
      return;
    }

    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:4500/change-password-otp", {
        email: email.toLowerCase(),
        newPassword,
      });

      if (res.data.success) {
        showAlert("Password updated successfully!", "success");
        
        // Countdown and redirect
        let count = 3;
        setCountdown(count);
        const timer = setInterval(() => {
          count--;
          setCountdown(count);
          if (count === 0) {
            clearInterval(timer);
            navigate("/login");
          }
        }, 1000);
      } else {
        showAlert(res.data.message, "danger");
      }
    } catch (err) {
      showAlert("Failed to update password. Please try again.", "danger",err);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4500/verify-email-send-otp", {
        email: email.toLowerCase(),
      });
      
      if (res.data.success) {
        showAlert("OTP resent successfully!", "success");
        if (res.data.otp) {
          console.log("Development OTP:", res.data.otp);
        }
      } else {
        showAlert("Failed to resend OTP", "danger");
      }
    } catch (err) {
      showAlert("Failed to resend OTP", "danger",err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body">
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="login-container">
          <h2 className="change-password-title text-success text-center">
            Change Password
          </h2>
          
          {/* Progress indicator */}
          <div className="progress-indicator mb-4">
            <div className="progress-line">
              <div className="progress-step">
                <div className={`step-circle ${step >= 1 ? 'active' : 'inactive'}`}>
                  <span className="step-number">1</span>
                </div>
                <span className={`step-label ${step >= 1 ? 'active' : 'inactive'}`}>Email</span>
              </div>
              <div className="progress-step">
                <div className={`step-circle ${step >= 2 ? 'active' : 'inactive'}`}>
                  <span className="step-number">2</span>
                </div>
                <span className={`step-label ${step >= 2 ? 'active' : 'inactive'}`}>OTP</span>
              </div>
              <div className="progress-step">
                <div className={`step-circle ${step >= 3 ? 'active' : 'inactive'}`}>
                  <span className="step-number">3</span>
                </div>
                <span className={`step-label ${step >= 3 ? 'active' : 'inactive'}`}>Password</span>
              </div>
            </div>
          </div>

          {/* Alert Message */}
          {alertMessage && (
            <div className={`alert alert-${alertType}`} role="alert">
              {alertMessage}
            </div>
          )}

          {/* Step 1: Email Verification */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-3">
                <label className="l1">Email Address</label>
                <input
                  type="email"
                  className="form-control mt-2"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                className="btn7 fw-bold w-100 rounded"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div>
              <form onSubmit={handleOTPSubmit}>
                <div className="mb-3">
                  <label className="l1">OTP Code</label>
                  <div className="otp-inputs-container">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        type="text"
                        className="form-control otp-digit-input"
                        maxLength="1"
                        value={otp[index] || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value) {
                            const newOtp = otp.split('');
                            newOtp[index] = value;
                            setOtp(newOtp.join(''));
                            
                            // Auto-focus next input
                            if (index < 5) {
                              const nextInput = e.target.parentNode.children[index + 1];
                              nextInput?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace') {
                            if (!otp[index] && index > 0) {
                              // Move to previous input if current is empty
                              const prevInput = e.target.parentNode.children[index - 1];
                              prevInput?.focus();
                            } else if (otp[index]) {
                              // Clear current input
                              const newOtp = otp.split('');
                              newOtp[index] = '';
                              setOtp(newOtp.join(''));
                            }
                          }
                        }}
                        disabled={loading}
                      />
                    ))}
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn7 fw-bold w-100 rounded mb-2"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
              
              <div className="text-center">
                <button 
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-success fw-bold"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Password Change */}
          {step === 3 && (
            <div>
              {countdown > 0 ? (
                <div className="text-center">
                  <div className="spinner-border text-success mb-3" role="status"></div>
                  <p>Redirecting to login in {countdown} seconds...</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange}>
                  <div className="mb-3">
                    <label className="l1">New Password</label>
                    <input
                      type="password"
                      className="form-control mt-2"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength="8"
                    />
                    <small className="text-muted">Minimum 8 characters</small>
                  </div>
                  
                  <div className="mb-3">
                    <label className="l1">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control mt-2"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength="8"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn7 fw-bold w-100 rounded"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Loading indicator */}
          {loading && step !== 3 && (
            <div className="text-center mt-3">
              <div className="spinner-border text-success" role="status"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordOTP;