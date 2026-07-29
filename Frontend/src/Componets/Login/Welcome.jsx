

import React, { useState } from "react";
import "../Loader/Loader.css"; // rv-btn-spinner used in login & sign-up buttons
import { useTranslation } from "react-i18next";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheckCircle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import { toast } from "../../utils/toastService";

const Welcome = () => {
  const { t } = useTranslation();
  const [view, setView] = useState("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error(t("passwordTooShort") || "Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("passwordMismatch") || "Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await handleOtpSend();
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleOtpSend = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/otp/send-otp`,
        { email }
      );

      if (response.data.success) {
        setOtpSent(true);
        toast.info(t("otpSentSuccess"));
      } else {
        toast.error(t("otpSendFail"));
      }
    } catch (error) {
      toast.error(t("otpSendFail"));
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/otp/verify-otp`,
        { otp, email }
      );

      if (response.data.success) {
        setOtpVerified(true);
        await handleCompleteAccountCreation();
      } else {
        toast.error(t("invalidOtp"));
      }
    } catch (error) {
      toast.error(t("verificationError"));
    }
  };

  const handleCompleteAccountCreation = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/complete-signup`,
        { email, password, username, mobileNo, companyName },
        { timeout: 10000 }
      );

      if (response.data?.success) {
        toast.success(t("account_created_success"));
        setView("login");
        setOtpSent(false);
        setOtpVerified(false);
      } else {
        toast.error(t("failed_to_create_account"));
        setOtpSent(false);
        setOtpVerified(false);
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        toast.error(t("server_timeout"));
      } else if (error?.response?.data?.error || error?.response?.data?.message) {
        toast.error(error.response.data.error || error.response.data.message);
      } else {
        toast.error(t("general_error"));
      }
      setOtpSent(false);
      setOtpVerified(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // lock UI immediately

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { idToken }
      );

      if (response.status === 200) {
        toast.success(t("login_success"));
        const userData = response.data.user;
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("uid", userData.uid);
        localStorage.setItem("userData", JSON.stringify(userData));
        window.location.href = "/";
      } else {
        toast.error(t("login_failed"));
      }
    } catch (error) {
      toast.error(t("invalid_credentials"));
    } finally {
      setLoading(false); // always unlock, even on error
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warn(t("enter_email") || "Enter your email");
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/check-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (!data.exists) {
        toast.error(t("email_not_registered"));
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast.success(t("reset_link_sent") || "Link sent successfully!");
    } catch (error) {
      toast.error(t("reset_email_error"));
    }
  };

  const handleBackToLogin = () => {
    setView("login");
    setIsEmailSent(false);
  };

  const handleOpenEmailApp = (e) => {
    e.preventDefault();
    if (!email) return;
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain === 'gmail.com') {
      window.open(`https://mail.google.com/mail/u/?authuser=${email}`, '_blank');
    } else if (domain === 'yahoo.com' || domain === 'ymail.com') {
      window.open('https://mail.yahoo.com/', '_blank');
    } else if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
      window.open('https://outlook.live.com/mail/0/inbox', '_blank');
    } else {
      window.location.href = `mailto:`;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[var(--bg-main)] p-4 font-sans relative overflow-hidden">

      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border-color)] shadow-2xl relative z-10"
        >
          {view === "welcome" && (
            <div className="flex flex-col items-center text-center space-y-8 py-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[var(--text-main)] mb-2 tracking-tight">
                  Welcome to <span className="text-[var(--primary)]">RentVeda</span>
                </h1>
                <p className="text-[var(--text-muted)] text-sm">{t("welcome") || "Manage your machinery effortlessly"}</p>
              </div>

              <div className="space-y-4 w-full pt-4">
                <button
                  onClick={() => setView("createAccount")}
                  className="w-full py-3.5 bg-[var(--primary)] text-black text-sm font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                >
                  {t("create_account") || "Create Account"}
                </button>
                <button
                  onClick={() => setView("login")}
                  className="w-full py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] text-sm font-bold rounded-xl hover:border-[var(--primary)] active:scale-95 transition-all"
                >
                  {t("login") || "Login"}
                </button>
              </div>
            </div>
          )}

          {view === "createAccount" && !otpSent && (
            <div>
              <div className="flex items-center mb-6">
                <button onClick={() => setView("welcome")} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-2 -ml-2">
                  <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-bold text-[var(--text-main)] ml-2">{t("create_account") || "Create Account"}</h1>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                {[
                  { label: t("username") || "Username", icon: FaUser, state: username, setState: setUsername, type: "text" },
                  { label: t("email") || "Email", icon: FaEnvelope, state: email, setState: setEmail, type: "email" },
                  { label: t("mobile_number") || "Mobile No.", icon: FaPhone, state: mobileNo, setState: setMobileNo, type: "tel", maxLength: 10, pattern: "\\d{10}" },
                  { label: t("company_name") || "Company", icon: FaBuilding, state: companyName, setState: setCompanyName, type: "text" },
                  { label: t("password") || "Password", icon: FaLock, state: password, setState: setPassword, type: "password", minLength: 6 },
                  { label: t("confirm_password") || "Confirm Password", icon: FaLock, state: confirmPassword, setState: setConfirmPassword, type: "password", minLength: 6 },
                ].map(({ label, icon: Icon, state, setState, type, maxLength, pattern }) => (
                  <div key={label} className="relative">
                    <Icon className={`absolute left-4 top-3.5 text-[var(--text-muted)] text-sm ${label === (t("mobile_number") || "Mobile No.") ? "scale-x-[-1]" : ""}`} />
                    <input
                      type={type}
                      placeholder={label}
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      maxLength={maxLength}
                      pattern={pattern}
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-[var(--text-muted)]"
                    />
                  </div>
                ))}

                {error && <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 mt-2 bg-[var(--primary)] text-black font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-2 ${
                    loading ? "opacity-60 cursor-not-allowed" : "active:scale-95 hover:bg-yellow-500"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="rv-btn-spinner" />
                      {t("processing") || "Processing…"}
                    </>
                  ) : (
                    t("sign_up") || "Sign Up"
                  )}
                </button>
              </form>
            </div>
          )}

          {otpSent && !otpVerified && (
            <div className="py-4">
              <div className="flex items-center mb-6">
                <button onClick={() => setOtpSent(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-2 -ml-2">
                  <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-bold text-[var(--text-main)] ml-2">{t("verify_otp") || "Verify OTP"}</h1>
              </div>

              <p className="text-[var(--text-muted)] text-xs mb-4 text-center">We've sent an OTP to <span className="text-[var(--text-main)] font-bold">{email}</span></p>

              <div className="flex justify-center mb-6">
                <button 
                  onClick={handleOpenEmailApp}
                  className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full hover:bg-[var(--primary)]/20 transition-colors"
                >
                  <FaEnvelope size={12} />
                  Open Email App
                </button>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-4">
                <input
                  type="text"
                  placeholder={t("enter_otp") || "Enter OTP"}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-[var(--bg-main)] text-[var(--text-main)] text-center tracking-[0.5em] font-bold border border-[var(--border-color)] rounded-xl py-3 px-4 focus:border-[var(--primary)] outline-none transition-colors text-lg placeholder-[var(--text-muted)] placeholder:tracking-normal placeholder:font-normal"
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[var(--primary)] text-black font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                >
                  {t("submit_otp") || "Submit OTP"}
                </button>
              </form>
            </div>
          )}

          {/* =========================================
              VIEW: FORGOT PASSWORD (BILINGUAL)
              ========================================= */}
          {view === "forgotPassword" && (
            <div className="py-2">
              <div className="flex items-center mb-6">
                <button onClick={handleBackToLogin} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-2 -ml-2">
                  <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-bold text-[var(--text-main)] ml-2">
                  {isEmailSent ? (t("checkInbox") || "Check Inbox") : (t("resetPassword") || "Reset Password")}
                </h1>
              </div>

              {!isEmailSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                    {t("forgotPasswordDesc") || "Enter your registered email address. We'll send you a link to reset your password."}
                  </p>

                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-3.5 text-[var(--text-muted)] text-sm" />
                    <input
                      type="email"
                      placeholder={t("enterYourEmail") || "Enter your email"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-[var(--text-muted)]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] font-bold rounded-xl hover:border-[var(--primary)] active:scale-95 transition-all"
                  >
                    {t("sendResetLink") || "Send Reset Link"}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center space-y-4 py-4"
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2 border border-green-500/20 shadow-lg shadow-green-500/10">
                    <FaCheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-[var(--text-main)] font-extrabold text-xl tracking-tight">{t("checkInbox") || "Check Inbox"}</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-[280px]">
                    {t("emailSentMsg1") || "We have sent a secure password reset link to"} <br />
                    <span className="text-[var(--text-main)] font-bold my-2 block">{email}</span>
                    {t("emailSentMsg2") || "Click the link in the email to set a new password, then return here to log in."}
                  </p>

                  <button
                    onClick={handleBackToLogin}
                    className="w-full py-3.5 mt-6 bg-[var(--primary)] text-black font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                  >
                    {t("backToLogin") || "Back to Login"}
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {view === "login" && (
            <div>
              <div className="flex items-center mb-6">
                <button onClick={() => setView("welcome")} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-2 -ml-2">
                  <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-bold text-[var(--text-main)] ml-2">{t("login") || "Login"}</h1>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3.5 text-[var(--text-muted)] text-sm" />
                  <input
                    type="email"
                    placeholder={t("email") || "Email"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-[var(--text-muted)]"
                  />
                </div>

                <div className="relative">
                  <FaLock className="absolute left-4 top-3.5 text-[var(--text-muted)] text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password") || "Password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl py-3 pl-10 pr-10 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-[var(--text-muted)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-[var(--text-muted)] hover:text-[var(--text-muted)] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <p
                    className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--primary)] transition-colors"
                    onClick={() => {
                      setView("forgotPassword");
                      setIsEmailSent(false);
                    }}
                  >
                    {t("forgot_password") || "Forgot Password"}?
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 mt-2 bg-[var(--primary)] text-black font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-2 ${
                    loading ? "opacity-60 cursor-not-allowed" : "active:scale-95 hover:bg-yellow-500"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="rv-btn-spinner" />
                      {t("signingIn") || "Signing in…"}
                    </>
                  ) : (
                    t("login") || "Login"
                  )}
                </button>
              </form>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Welcome;