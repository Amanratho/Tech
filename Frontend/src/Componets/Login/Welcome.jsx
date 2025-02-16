import React, { useId, useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaImage,
  FaBuilding, FaEye, FaEyeSlash
} from "react-icons/fa";
import { motion } from "framer-motion";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Welcome = () => {
  const [view, setView] = useState("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [otp, setOtp] = useState(""); // For OTP
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // ✅ Password match check (Loading reset fix)
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }
  
    setError(""); // Yeh assume kar raha hoon ki setError state me hai
  
    try {
      // ✅ Step 1: Pehle OTP bhejo
      await handleOtpSend(); // Pehle OTP bhejna chahiye, phir user enter karega
  
      // ✅ Step 2: OTP Verify karo
      const otpRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/otp/verify-otp`,
        { otp, email }
      );
  
      if (!otpRes.data.success) {
        toast.error("Invalid OTP. Please try again.");
        setLoading(false);
        return; // ❌ Aage signup request nahi bhejenge
      }
  
      // ✅ Step 3: OTP verify hone ke baad signup request bhejo
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        { email, password, username, mobileNo, companyName }
      );
  
      if (response.data.success) {
        toast.success("Signup successful! Please verify your email.");
        setOtpSent(true);
      } else {
        toast.error(response.data.message || "Signup failed. Please try again  ha m.");
      }
    } catch (error) {
      // ✅ Proper error handling
      // toast.error(error.response?.data?.message || "Signup failed. Please try again later.");
      // console.error("Signup error:", error);
    } finally {
      setLoading(false); // ✅ Ensure loading state reset ho
    }
  };
  

  const handleOtpSend = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/otp/send-otp`,
        { email }
      );

      if (response.data.success) {
        setOtpSent(true);
        toast.info("OTP sent to your email!");
      } else {
        toast.error("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/otp/verify-otp`,
        { otp, email }
      );

      if (response.data.success) {
        setOtpVerified(true);
        await handleCompleteAccountCreation();
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Error verifying OTP. Please try again.");
    }
  };

  const handleCompleteAccountCreation = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/complete-signup`,
        { email, password, username, mobileNo, companyName }
      );

      if (response.data.success) {
        toast.success("Account created Successfully, Please Login");
        setView("login");
      } else {
        toast.error("Failed to create account after OTP verification.");
      }
    } catch (error) {
      toast.error("This Email is already in use.");
      navigate("/welcome");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        { idToken }
      );

      if (response.status === 200) {
        toast.success("Logged in successfully!");
        
        const userData = response.data.user;
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("uid", userData.uid);
        localStorage.setItem("userData", JSON.stringify(userData));

        window.location.href = "/";
      } else {
        toast.error("Login Failed");
      }
    } catch (error) {
      toast.error("Please Enter Right Information");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.warn("Please enter your email.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/check-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!data.exists) {
        toast.error("Email is not registered.");
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast.success("A reset link has been sent to your email.");
    } catch (error) {
      toast.error("Error sending reset email. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div
      className="flex justify-center items-center h-screen w-full bg-[#4C4C4D]
    "
    >
      <motion.div
        className="w-full max-w-lg p-8 rounded-3xl bg-[#333333]  shadow-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {view === "welcome" && (
          <motion.section
            className="flex flex-col items-center text-center space-y-8"
            variants={containerVariants}
          >
            <h1 className="text-4xl font-bold text-white">Welcome!</h1>

            <div className="space-y-4 w-full">
              <button
                onClick={() => setView("createAccount")}
                className="w-full py-3 bg-[#F8981D] text-base  font-semibold rounded-xl hover:bg-yellow-500 transition"
              >
                Create New Account
              </button>
              <button
                onClick={() => setView("login")}
                className="w-full py-3 bg-gray-700 text-white rounded-xl  hover:bg-gray-800 transition"
              >
                Login
              </button>
            </div>
          </motion.section>
        )}

        {view === "createAccount" && !otpSent && (
          <motion.section className=" backdrop-blur-lg p-1 rounded-3xl shadow-2xl max-w-lg mx-auto ">
            <h1 className="text-3xl font-bold text-white text-center">
              Create an Account
            </h1>
            <form onSubmit={handleCreateAccount} className="space-y-2 mt-4">
              {[
                {
                  label: "Username",
                  icon: FaUser,
                  state: username,
                  setState: setUsername,
                  type: "text",
                },
                {
                  label: "Email",
                  icon: FaEnvelope,
                  state: email,
                  setState: setEmail,
                  type: "email",
                },
                {
                  label: "Mobile Number",
                  icon: FaPhone,
                  state: mobileNo,
                  setState: setMobileNo,
                  type: "tel",
                  maxLength: 10,
                  pattern: "\\d{10}",
                },
                {
                  label: "Password",
                  icon: FaLock,
                  state: password,
                  setState: setPassword,
                  type: "password",
                },
                {
                  label: "Confirm Password",
                  icon: FaLock,
                  state: confirmPassword,
                  setState: setConfirmPassword,
                  type: "password",
                },
                {
                  label: "Company Name",
                  icon: FaBuilding,
                  state: companyName,
                  setState: setCompanyName,
                  type: "text",
                },
              ].map(
                ({
                  label,
                  icon: Icon,
                  state,
                  setState,
                  type,
                  maxLength,
                  pattern,
                }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 bg-slate-50 rounded-2xl  p-2 w-full"
                  >
                    <Icon
                      className={`text-black text-base ${
                        label === "Mobile Number" ? "scale-x-[-1]" : ""
                      }`}
                    />
                    <input
                      type={type}
                      placeholder={label}
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      maxLength={maxLength}
                      pattern={pattern}
                      className="flex-1 bg-transparent text-black p-1 focus:outline-none text-base placeholder-black/90"
                    />
                  </div>
                )
              )}

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-1 bg-[#F8981D] text-gray-900 font-bold rounded-xl hover:shadow-lg transition-all ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Processing..." : "Sign Up"}
              </button>
            </form>
            <button
              onClick={() => setView("welcome")}
              className="block text-center text-white text-sm hover:underline pl-3 mt-2"
            >
              Back
            </button>
          </motion.section>
        )}

        {otpSent && !otpVerified && (
          <motion.section
            className="space-y-6 mt-6"
            variants={containerVariants}
          >
            <h1 className="text-2xl font-bold text-white text-center">
              Verify OTP
            </h1>
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-yellow-400 text-white rounded-xl hover:bg-yellow-500 transition"
              >
                Submit OTP
              </button>
            </form>
          </motion.section>
        )}

        {view === "forgotPassword" && (
          <>
            <form
              onSubmit={handleForgotPassword}
              className="flex flex-col gap-3  justify-between flex-wrap "
            >
              <p className="text-yellow-200 font-thin">
                Enter your email and we'll send you a link to get back into your
                account.
              </p>
              <input
                className="rounded-xl p-2 w-full "
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="border rounded-lg w-1/2 text-white p-1 "
              >
                Send Login Link
              </button>
              <button
                onClick={() => setView("login")}
                className="p-1  no-underline font-thin  text-white flex  "
              >
                Back
              </button>
            </form>
            {isEmailSent && (
              <p className="text-green-500 text-center mt-2">
                A reset link has been sent to your email.
              </p>
            )}
          </>
        )}

        {view === "login" && (
          <motion.section className="space-y-6" variants={containerVariants}>
            <h1 className="text-2xl font-bold text-white text-center">Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-yellow-400" />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 relative">
                <FaLock className="text-yellow-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#F8981D] text-white font-semibold rounded hover:bg-yellow-500 transition"
              >
                Login
              </button>
              <p
                className="text-sm text-yellow-600 font-thin cursor-pointer hover:underline"
                onClick={() => setView("forgotPassword")}
              >
                Forgot Password ?
              </p>
            </form>
            <button
              onClick={() => setView("welcome")}
              className="p-1 no-underline font-thin text-white text-center"
            >
              Back
            </button>
          </motion.section>
        )}
      </motion.div>
    </div>
  );
};

export default Welcome;
