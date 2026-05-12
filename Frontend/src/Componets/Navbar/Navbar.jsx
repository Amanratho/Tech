import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaPhoneAlt,
  FaInfoCircle,
  FaUserCircle,
  FaSignInAlt,
  FaLanguage,
  FaFileInvoice,
  FaCalculator  
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation(); // To track current active path
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const uid = localStorage.getItem("uid");

  const { i18n, t } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("selectedLanguage", newLang);
  };

  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    if (storedLoginState === "true" && !isLoggedIn) {
      dispatch({ type: "LOGIN" });
    }
  }, [dispatch, isLoggedIn]);

  // Menu items config for mapping
  const navItems = [
    { name: t("home") || "Home", path: "/", icon: FaHome },
    { name: "Statement", path: "/statement", icon: FaFileInvoice },
    // 🔥 Calculator About ke left mein (pehle) daal diya
    { name: t("calculator") || "Calc", path: "/calculator", icon: FaCalculator }, 
    { name: t("about") || "About", path: "/about", icon: FaInfoCircle },
  ];

  return (
    <>
      <ToastContainer style={{ zIndex: "9999" }} theme="dark" /> 

      <div className="fixed top-0 left-0 w-full h-16 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] z-50 flex items-center justify-between px-4 sm:px-6">

        {/* Logo - Updated to RentVeda */}
        <NavLink to="/" className="flex items-center gap-2 no-underline hover:no-underline">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <span className="text-black font-black text-lg">R</span>
          </div>
          <span className="text-white font-extrabold text-lg tracking-wide">
            Rent<span className="text-[var(--primary)]">Veda</span>
          </span>
        </NavLink>
 
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-bold no-underline hover:no-underline transition-all ${isActive ? "text-[var(--primary)]" : "text-gray-400 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
 
        <div className="flex items-center gap-3">
          {/* Language Toggle Pill */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-[#1E1E1E] border border-[#333] hover:border-[var(--primary)] px-3 py-1.5 rounded-full transition-all active:scale-95 text-xs font-bold text-gray-300"
          >
            <FaLanguage className="text-[var(--primary)]" size={14} />
            {i18n.language === "en" ? "हिन्दी" : "ENG"}
          </button>

          {/* Desktop Profile Icon (Hidden on Mobile) */}
          <div className="hidden md:block border-l border-[#333] pl-3 ml-1">
            {uid ? (
              <NavLink to="/profile" className="no-underline hover:no-underline">
                <FaUserCircle size={26} className="text-gray-400 hover:text-[var(--primary)] transition-colors" />
              </NavLink>
            ) : (
              <NavLink to="/login" className="bg-[var(--primary)] text-black px-4 py-1.5 rounded-lg text-sm font-bold no-underline hover:no-underline hover:bg-yellow-500 transition-colors">
                {t("login") || "Login"}
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          2. BOTTOM TAB BAR (Mobile Only)
          ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#1E1E1E]/95 backdrop-blur-lg border-t border-[#2C2C2C] z-50 flex justify-around items-center px-2 pb-safe">

        {/* Render Nav Items */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center w-16 h-full relative no-underline hover:no-underline focus:no-underline"
            >
              {/* Active Indicator Dot/Glow */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1 w-8 h-1 bg-[var(--primary)] rounded-b-full shadow-[0_2px_10px_var(--primary)]"
                />
              )}

              <item.icon
                size={isActive ? 22 : 20}
                className={`mb-1 transition-all duration-300 ${isActive ? "text-[var(--primary)]" : "text-gray-500"
                  }`}
              />
              <span className={`text-[9px] font-bold no-underline transition-all duration-300 ${isActive ? "text-[var(--primary)]" : "text-gray-500"
                }`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}

        {/* Profile / Login Tab */}
        <NavLink
          to={uid ? "/profile" : "/login"}
          className="flex flex-col items-center justify-center w-16 h-full relative no-underline hover:no-underline focus:no-underline"
        >
          {location.pathname === "/profile" || location.pathname === "/login" ? (
            <motion.div
              layoutId="bottomNavIndicator"
              className="absolute -top-1 w-8 h-1 bg-[var(--primary)] rounded-b-full shadow-[0_2px_10px_var(--primary)]"
            />
          ) : null}

          {uid ? (
            <FaUserCircle size={location.pathname === "/profile" ? 22 : 20} className={`mb-1 transition-all duration-300 ${location.pathname === "/profile" ? "text-[var(--primary)]" : "text-gray-500"}`} />
          ) : (
            <FaSignInAlt size={location.pathname === "/login" ? 22 : 20} className={`mb-1 transition-all duration-300 ${location.pathname === "/login" ? "text-[var(--primary)]" : "text-gray-500"}`} />
          )}
          <span className={`text-[9px] font-bold no-underline transition-all duration-300 ${location.pathname === "/profile" || location.pathname === "/login" ? "text-[var(--primary)]" : "text-gray-500"
            }`}>
            {uid ? (t("profile") || "Profile") : (t("login") || "Login")}
          </span>
        </NavLink>

      </div>
    </>
  );
}

export default Navbar;