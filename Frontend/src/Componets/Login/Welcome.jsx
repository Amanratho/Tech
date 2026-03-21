// import React, { useId, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FaEnvelope,
//   FaLock,
//   FaUser,
//   FaPhone,
//   FaImage,
//   FaBuilding,
//   FaEye,
//   FaEyeSlash,
// } from "react-icons/fa";
// import { motion } from "framer-motion";
// import { auth } from "../../firebase";
// import {
//   signInWithEmailAndPassword,
//   sendPasswordResetEmail,
// } from "firebase/auth";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const Welcome = () => {
//   const { t } = useTranslation();
//   const [view, setView] = useState("welcome");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [username, setUsername] = useState("");
//   const [mobileNo, setMobileNo] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [otp, setOtp] = useState(""); // For OTP
//   const [error, setError] = useState("");
//   const [isEmailSent, setIsEmailSent] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const navigate = useNavigate();

//   const handleCreateAccount = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     if (password !== confirmPassword) {
//       toast.error(t("passwordMismatch"));
//       setLoading(false);
//       return;
//     }

//     // setError("");
//     handleOtpSend();

//     try {
//       const otpres = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/otp/verify-otp`,
//         { otp, email }
//       );

//       if (otpres.data.success) {
//         const response = await axios.post(
//           `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
//           { email, password, username, mobileNo, companyName }
//         );

//         if (response.data.success) {
//           toast.success(t("signup_success"));
//           setOtpSent(true);
//         } else {
//           toast.error(t("signup_failed"));
//         }
//       } else {
//         toast.error(t("invalid_otp"));
//       }
//     } catch (error) {
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpSend = async () => {
//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/otp/send-otp`,
//         { email }
//       );

//       if (response.data.success) {
//         setOtpSent(true);
//         toast.info(t("otpSentSuccess"));
//       } else {
//         toast.error(t("otpSendFail"));
//       }
//     } catch (error) {
//       toast.error(t("otpSendFail"));
//     }
//   };

//   const handleOtpVerify = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/otp/verify-otp`,
//         { otp, email }
//       );

//       if (response.data.success) {
//         setOtpVerified(true);
//         await handleCompleteAccountCreation();
//       } else {
//         toast.error(t("invalidOtp"));
//       }
//     } catch (error) {
//       toast.error(t("verificationError"));
//     }
//   };

//   const handleCompleteAccountCreation = async () => {
//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/auth/complete-signup`,
//         { email, password, username, mobileNo, companyName },
//         { timeout: 10000 } // 10-second timeout
//       );

//       console.log("Backend Response:", response.data); // Debugging log

//       if (response.data?.success) {
//         toast.success(t("account_created_success"));
//         setView("login");
//       } else {
//         toast.error(t("failed_to_create_account"));
//       }
//     } catch (error) {
//       // console.error("Signup Error:", error);

//       if (error.code === "ECONNABORTED") {
//         toast.error(t("server_timeout"));
//       } else if (error?.response?.data?.message) {
//         toast.error(error.response.data.message);
//       } else if (error.response) {
//         // console.error("Unexpected Backend Error:", error.response.data);
//         toast.error(t("unexpected_backend_error"));
//       } else {
//         toast.error(t("general_error"));
//       }
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const idToken = await userCredential.user.getIdToken();

//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
//         { idToken }
//       );

//       if (response.status === 200) {
//         toast.success(t("login_success"));

//         const userData = response.data.user;
//         localStorage.setItem("token", response.data.token);
//         localStorage.setItem("uid", userData.uid);
//         localStorage.setItem("userData", JSON.stringify(userData));

//         window.location.href = "/";
//       } else {
//         toast.error(t("login_failed"));
//       }
//     } catch (error) {
//       toast.error(t("invalid_credentials"));
//     }
//   };

//   const handleForgotPassword = async (e) => {
//     e.preventDefault();

//     if (!email) {
//       toast.warn(t("enter_email"));
//       return;
//     }

//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/auth/check-email`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email }),
//         }
//       );

//       const data = await response.json();

//       if (!data.exists) {
//         toast.error(t("email_not_registered"));
//         return;
//       }

//       await sendPasswordResetEmail(auth, email);
//       setIsEmailSent(true);
//       toast.success(t("reset_link_sent"));
//     } catch (error) {
//       toast.error(t("reset_email_error"));
//     }
//   };

//   const containerVariants = {
//     hidden: { opacity: 0, y: -50 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//   };

//   return (
//     <div
//       className="flex justify-center items-center h-screen w-full bg-[#4C4C4D]
//     "
//     >
//       <motion.div
//         className="w-full max-w-lg p-8 rounded-3xl bg-[#333333]  shadow-lg"
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//       >
//         {view === "welcome" && (
//           <motion.section
//             className="flex flex-col items-center text-center space-y-8"
//             variants={containerVariants}
//           >
//             <h1 className="text-4xl font-bold text-white">{t("welcome")}</h1>

//             <div className="space-y-4 w-full">
//               <button
//                 onClick={() => setView("createAccount")}
//                 className="w-full py-3 bg-[#F8981D] text-base font-semibold rounded-xl hover:bg-yellow-500 transition"
//               >
//                 {t("create_account")}
//               </button>
//               <button
//                 onClick={() => setView("login")}
//                 className="w-full py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition"
//               >
//                 {t("login")}
//               </button>
//             </div>
//           </motion.section>
//         )}

//         {view === "createAccount" && !otpSent && (
//           <motion.section className="backdrop-blur-lg p-1 rounded-3xl shadow-2xl max-w-lg mx-auto">
//             <h1 className="text-3xl font-bold text-white text-center">
//               {t("create_account")}
//             </h1>
//             <form onSubmit={handleCreateAccount} className="space-y-2 mt-4">
//               {[
//                 {
//                   label: t("username"),
//                   icon: FaUser,
//                   state: username,
//                   setState: setUsername,
//                   type: "text",
//                 },
//                 {
//                   label: t("email"),
//                   icon: FaEnvelope,
//                   state: email,
//                   setState: setEmail,
//                   type: "email",
//                 },
//                 {
//                   label: t("mobile_number"),
//                   icon: FaPhone,
//                   state: mobileNo,
//                   setState: setMobileNo,
//                   type: "tel",
//                   maxLength: 10,
//                   pattern: "\\d{10}",
//                 },
//                 {
//                   label: t("password"),
//                   icon: FaLock,
//                   state: password,
//                   setState: setPassword,
//                   type: "password",
//                   minLength: 6,
//                 },
//                 {
//                   label: t("confirm_password"),
//                   icon: FaLock,
//                   state: confirmPassword,
//                   setState: setConfirmPassword,
//                   type: "password",
//                   minLength: 6,
//                 },
//                 {
//                   label: t("company_name"),
//                   icon: FaBuilding,
//                   state: companyName,
//                   setState: setCompanyName,
//                   type: "text",
//                 },
//               ].map(
//                 ({
//                   label,
//                   icon: Icon,
//                   state,
//                   setState,
//                   type,
//                   maxLength,
//                   pattern,
//                 }) => (
//                   <div
//                     key={label}
//                     className="flex items-center gap-2 bg-slate-50 rounded-2xl p-2 w-full"
//                   >
//                     <Icon
//                       className={`text-black text-base ${
//                         label === t("mobile_number") ? "scale-x-[-1]" : ""
//                       }`}
//                     />
//                     <input
//                       type={type}
//                       placeholder={label}
//                       required
//                       value={state}
//                       onChange={(e) => setState(e.target.value)}
//                       maxLength={maxLength}
//                       pattern={pattern}
//                       className="flex-1 bg-transparent text-black p-1 focus:outline-none text-base placeholder-black/90"
//                     />
//                   </div>
//                 )
//               )}

//               {error && (
//                 <p className="text-red-500 text-sm text-center">{error}</p>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`w-full py-1 bg-[#F8981D] text-gray-900 font-bold rounded-xl hover:shadow-lg transition-all ${
//                   loading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               >
//                 {loading ? t("processing") : t("sign_up")}
//               </button>
//             </form>
//             <button
//               onClick={() => setView("welcome")}
//               className="block text-center text-white text-sm hover:underline pl-3 mt-2"
//             >
//               {t("back")}
//             </button>
//           </motion.section>
//         )}

//         {otpSent && !otpVerified && (
//           <motion.section
//             className="space-y-6 mt-6"
//             variants={containerVariants}
//           >
//             <h1 className="text-2xl font-bold text-white text-center">
//               {t("verify_otp")}
//             </h1>
//             <form onSubmit={handleOtpVerify} className="space-y-4">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="text"
//                   placeholder={t("enter_otp")}
//                   required
//                   className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                 />
//               </div>
//               <button
//                 type="submit"
//                 className="w-full py-3 bg-yellow-400 text-white rounded-xl hover:bg-yellow-500 transition"
//               >
//                 {t("submit_otp")}
//               </button>
//             </form>
//           </motion.section>
//         )}

//         {view === "forgotPassword" && (
//           <>
//             <form
//               onSubmit={handleForgotPassword}
//               className="flex flex-col gap-3 justify-between flex-wrap"
//             >
//               <p className="text-yellow-200 font-thin">
//                 {t("forgot_password_description")}
//               </p>
//               <input
//                 className="rounded-xl p-2 w-full"
//                 type="email"
//                 placeholder={t("enter_email")}
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <button
//                 type="submit"
//                 className="border rounded-lg w-1/2 text-white p-1"
//               >
//                 {t("send_login_link")}
//               </button>
//               <button
//                 onClick={() => setView("login")}
//                 className="p-1 no-underline font-thin text-white flex"
//               >
//                 {t("back")}
//               </button>
//             </form>
//             {isEmailSent && (
//               <p className="text-green-500 text-center mt-2">
//                 {t("reset_link_sent")}
//               </p>
//             )}
//           </>
//         )}

//         {view === "login" && (
//           <motion.section className="space-y-6" variants={containerVariants}>
//             <h1 className="text-2xl font-bold text-white text-center">
//               {t("login")}
//             </h1>
//             <form onSubmit={handleLogin} className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <FaEnvelope className="text-yellow-400" />
//                 <input
//                   type="email"
//                   placeholder={t("email")}
//                   required
//                   className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>
//               <div className="flex items-center gap-3 relative">
//                 <FaLock className="text-yellow-400" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder={t("password")}
//                   required
//                   className="w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 text-gray-500 hover:text-gray-300"
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </button>
//               </div>
//               <button
//                 type="submit"
//                 className="w-full py-2 bg-[#F8981D] text-white font-semibold rounded hover:bg-yellow-500 transition"
//               >
//                 {t("login")}
//               </button>
//               <p
//                 className="text-sm text-yellow-600 font-thin cursor-pointer hover:underline"
//                 onClick={() => setView("forgotPassword")}
//               >
//                 {t("forgot_password")}
//               </p>
//             </form>
//             <button
//               onClick={() => setView("welcome")}
//               className="p-1 no-underline font-thin text-white text-center"
//             >
//               {t("back")}
//             </button>
//           </motion.section>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default Welcome;


import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaArrowLeft
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
  const [isEmailSent, setIsEmailSent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  // --- LOGIC REMAINS UNCHANGED ---
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error(t("passwordMismatch") || "Passwords do not match!");
      setLoading(false);
      return;
    }

    handleOtpSend();

    try {
      const otpres = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/otp/verify-otp`,
        { otp, email }
      );

      if (otpres.data.success) {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
          { email, password, username, mobileNo, companyName }
        );

        if (response.data.success) {
          toast.success(t("signup_success"));
          setOtpSent(true);
        } else {
          toast.error(t("signup_failed"));
        }
      } else {
        toast.error(t("invalid_otp"));
      }
    } catch (error) {
    } finally {
      setLoading(false);
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
        `${import.meta.env.VITE_BACKEND_URL}/api/otp/verify-otp`,
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
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/complete-signup`,
        { email, password, username, mobileNo, companyName },
        { timeout: 10000 }
      );

      if (response.data?.success) {
        toast.success(t("account_created_success"));
        setView("login");
      } else {
        toast.error(t("failed_to_create_account"));
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        toast.error(t("server_timeout"));
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("general_error"));
      }
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
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warn(t("enter_email"));
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
        toast.error(t("email_not_registered"));
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast.success(t("reset_link_sent"));
    } catch (error) {
      toast.error(t("reset_email_error"));
    }
  };

  // --- ANIMATIONS ---
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[#121212] p-4 font-sans relative overflow-hidden">
      
      {/* Background Blur Elements for Premium Feel */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#1E1E1E] border border-[#2C2C2C] shadow-2xl relative z-10"
        >
          {/* =========================================
              VIEW: WELCOME
              ========================================= */}
          {view === "welcome" && (
            <div className="flex flex-col items-center text-center space-y-8 py-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                  Welcome to <span className="text-[var(--primary)]">RentVeda</span>
                </h1>
                <p className="text-gray-400 text-sm">{t("welcome") || "Manage your machinery effortlessly"}</p>
              </div>

              <div className="space-y-4 w-full pt-4">
                <button
                  onClick={() => setView("createAccount")}
                  className="w-full py-3.5 bg-[var(--primary)] text-black text-sm font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                >
                  {t("create_account")}
                </button>
                <button
                  onClick={() => setView("login")}
                  className="w-full py-3.5 bg-[#121212] border border-[#333] text-white text-sm font-bold rounded-xl hover:border-[var(--primary)] active:scale-95 transition-all"
                >
                  {t("login")}
                </button>
              </div>
            </div>
          )}

          {/* =========================================
              VIEW: CREATE ACCOUNT
              ========================================= */}
          {view === "createAccount" && !otpSent && (
            <div>
              <div className="flex items-center mb-6">
                <button onClick={() => setView("welcome")} className="text-gray-500 hover:text-white transition-colors p-2 -ml-2">
                  <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-bold text-white ml-2">{t("create_account")}</h1>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                {[
                  { label: t("username"), icon: FaUser, state: username, setState: setUsername, type: "text" },
                  { label: t("email"), icon: FaEnvelope, state: email, setState: setEmail, type: "email" },
                  { label: t("mobile_number"), icon: FaPhone, state: mobileNo, setState: setMobileNo, type: "tel", maxLength: 10, pattern: "\\d{10}" },
                  { label: t("company_name"), icon: FaBuilding, state: companyName, setState: setCompanyName, type: "text" },
                  { label: t("password"), icon: FaLock, state: password, setState: setPassword, type: "password", minLength: 6 },
                  { label: t("confirm_password"), icon: FaLock, state: confirmPassword, setState: setConfirmPassword, type: "password", minLength: 6 },
                ].map(({ label, icon: Icon, state, setState, type, maxLength, pattern }) => (
                  <div key={label} className="relative">
                    <Icon className={`absolute left-4 top-3.5 text-gray-500 text-sm ${label === t("mobile_number") ? "scale-x-[-1]" : ""}`} />
                    <input
                      type={type}
                      placeholder={label}
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      maxLength={maxLength}
                      pattern={pattern}
                      className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-gray-600"
                    />
                  </div>
                ))}

                {error && <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 mt-2 bg-[var(--primary)] text-black font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 transition-all ${
                    loading ? "opacity-70 cursor-not-allowed" : "active:scale-95 hover:bg-yellow-500"
                  }`}
                >
                  {loading ? t("processing") : t("sign_up")}
                </button>
              </form>
            </div>
          )}

          {/* =========================================
              VIEW: OTP VERIFICATION
              ========================================= */}
          {otpSent && !otpVerified && (
            <div className="py-4">
               <div className="flex items-center mb-6">
                <button onClick={() => setOtpSent(false)} className="text-gray-500 hover:text-white transition-colors p-2 -ml-2">
                  <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-bold text-white ml-2">{t("verify_otp")}</h1>
              </div>

              <p className="text-gray-400 text-xs mb-6 text-center">We've sent an OTP to <span className="text-white font-bold">{email}</span></p>

              <form onSubmit={handleOtpVerify} className="space-y-4">
                <input
                  type="text"
                  placeholder={t("enter_otp")}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-[#121212] text-white text-center tracking-[0.5em] font-bold border border-[#333] rounded-xl py-3 px-4 focus:border-[var(--primary)] outline-none transition-colors text-lg placeholder-gray-600 placeholder:tracking-normal placeholder:font-normal"
                />
                
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[var(--primary)] text-black font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                >
                  {t("submit_otp")}
                </button>
              </form>
            </div>
          )}

          {/* =========================================
              VIEW: FORGOT PASSWORD
              ========================================= */}
          {view === "forgotPassword" && (
            <div className="py-2">
              <div className="flex items-center mb-6">
                <button onClick={() => setView("login")} className="text-gray-500 hover:text-white transition-colors p-2 -ml-2">
                  <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-bold text-white ml-2">Reset Password</h1>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <p className="text-gray-400 text-xs leading-relaxed">
                  {t("forgot_password_description") || "Enter your registered email address. We'll send you a link to reset your password."}
                </p>
                
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3.5 text-gray-500 text-sm" />
                  <input
                    type="email"
                    placeholder={t("enter_email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-gray-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#121212] border border-[#333] text-white font-bold rounded-xl hover:border-[var(--primary)] active:scale-95 transition-all"
                >
                  {t("send_login_link")}
                </button>
              </form>
              
              {isEmailSent && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center flex items-center justify-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <p className="text-green-400 text-xs font-semibold">{t("reset_link_sent")}</p>
                </div>
              )}
            </div>
          )}

          {/* =========================================
              VIEW: LOGIN
              ========================================= */}
          {view === "login" && (
            <div>
              <div className="flex items-center mb-6">
                <button onClick={() => setView("welcome")} className="text-gray-500 hover:text-white transition-colors p-2 -ml-2">
                  <FaArrowLeft size={16} />
                </button>
                <h1 className="text-xl font-bold text-white ml-2">{t("login")}</h1>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3.5 text-gray-500 text-sm" />
                  <input
                    type="email"
                    placeholder={t("email")}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-gray-600"
                  />
                </div>

                <div className="relative">
                  <FaLock className="absolute left-4 top-3.5 text-gray-500 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password")}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-10 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <p
                    className="text-xs text-[var(--primary)] cursor-pointer hover:underline"
                    onClick={() => setView("forgotPassword")}
                  >
                    {t("forgot_password")}?
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-[var(--primary)] text-black font-bold rounded-xl shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                >
                  {t("login")}
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