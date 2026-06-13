import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useGetPendingRemindersQuery } from "../../redux/functional/paymentApiSlice";
import { isToday, isPast } from "date-fns";
import {
  FaHome,
  FaPhoneAlt,
  FaInfoCircle,
  FaUserCircle,
  FaSignInAlt,
  FaLanguage,
  FaFileInvoice,
  FaCalculator,
  FaBell,
  FaChartBar,
  FaTimes
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

function NotificationDropdown({ uid }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch reminders using RTK Query
  const { data: reminders = [] } = useGetPendingRemindersQuery(uid, { skip: !uid });

  // Filter for today or past
  const actionableReminders = reminders.filter(rem => {
    if (!rem.reminderDate) return false;
    const date = new Date(rem.reminderDate);
    return isToday(date) || (isPast(date) && !isToday(date));
  });

  const displayReminders = actionableReminders.slice(0, 10);
  const hasUnread = actionableReminders.length > 0;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!uid) return null;

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* 1. Bell Icon with Sleek Unread Dot */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 transition-colors rounded-full text-yellow-400 active:scale-95 hover:bg-[#1E1E1E]"
        aria-label="Notifications"
      >
        <FaBell size={20} />
        {hasUnread && (
          <span className="absolute top-[6px] right-[7px] w-2.5 h-2.5 bg-red-500 rounded-full border-[2px] border-[#121212]"></span>
        )}
      </button>

      {/* 2. Premium Native Mobile Pop-up Tray */}
      {isOpen && (
        <div className="absolute top-[50px] right-0 w-[calc(100vw-32px)] max-w-[340px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[100] flex flex-col transform origin-top-right transition-all">
          
          {/* 3. Clean & Professional Heading */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-[#2a2a2a]">
            <h3 className="text-[#E0E0E0] text-sm font-semibold tracking-wide">Notifications</h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-gray-500 hover:text-white transition-colors p-1 rounded-full hover:bg-[#2a2a2a]"
            >
              <FaTimes size={12} />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto no-scrollbar bg-[#1a1a1a]">
            {!hasUnread ? (
              <div className="text-center py-8 text-xs text-gray-500 font-medium">
                No pending notifications
              </div>
            ) : (
              displayReminders.map(rem => (
                <div key={rem._id} className="px-4 py-3 border-b border-[#222] hover:bg-[#222] transition-colors cursor-pointer active:bg-[#2a2a2a]">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-[#f0f0f0] text-sm font-semibold truncate max-w-[160px]">{rem.customerName}</p>
                    <p className="text-red-400 text-sm font-bold tracking-tight">₹{rem.pendingAmount.toLocaleString()}</p>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium tracking-wide">{rem.mobileNumber || rem.customerMobile}</p>
                </div>
              ))
            )}
          </div>

          {/* 4. Small & Minimal Footer Link */}
          {hasUnread && (
            <div className="p-2 bg-[#161616] flex justify-center border-t border-[#2a2a2a]">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate("/pending-payments");
                }}
                className="w-full py-1.5 text-xs font-semibold text-yellow-400 hover:text-yellow-300 active:scale-95 transition-all"
              >
                See All Dues
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    { name: t("home")             || "Home",       path: "/",                icon: FaHome },
    { name: t("navStatement")     || "Statement",  path: "/statement",       icon: FaFileInvoice },
    { name: t("calculator")       || "Calc",       path: "/calculator",      icon: FaCalculator },
    { name: t("navReminders")     || "Reminders",  path: "/pending-payments",icon: FaBell },
    { name: t("navSummary")       || "Summary",    path: "/eod-dashboard",   icon: FaChartBar },
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

          {/* Notification Dropdown Component */}
          <NotificationDropdown uid={uid} />

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