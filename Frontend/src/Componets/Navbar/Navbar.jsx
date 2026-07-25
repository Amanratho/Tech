import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useGetPendingRemindersQuery } from "../../redux/functional/paymentApiSlice";
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

import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

function NotificationDropdown({ uid }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch reminders using RTK Query
  const { data: reminders = [] } = useGetPendingRemindersQuery(uid, { skip: !uid });

  // STRICT: Only show reminders where reminderDate <= today (due or overdue)
  const actionableReminders = reminders.filter(rem => {
    if (!rem.reminderDate) return false;
    const reminderDate = new Date(rem.reminderDate);
    // Strip time: compare date-only against start of today
    const today = new Date();
    today.setHours(23, 59, 59, 999); // end of today
    return reminderDate <= today;
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
    <div className="relative flex items-center" ref={dropdownRef} style={{ zIndex: 999 }}>
      {/* Bell Icon with Unread Dot */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 transition-colors rounded-full text-[var(--primary)] active:scale-95 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <FaBell size={20} />
        {hasUnread && (
          <span className="absolute top-[6px] right-[7px] w-2.5 h-2.5 bg-red-500 rounded-full border-[2px] border-white"></span>
        )}
      </button>

      {/* Notification Tray — Light mode */}
      {isOpen && (
        <div
          className="absolute top-[50px] right-0 w-[calc(100vw-32px)] max-w-[340px] rounded-2xl overflow-hidden flex flex-col transform origin-top-right transition-all"
          style={{
            zIndex: 999,
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            isolation: 'isolate',
          }}
        >
          
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--border-color)]" style={{ backgroundColor: '#FFFFFF' }}>
            <h3 className="text-[var(--text-main)] text-sm font-semibold tracking-wide">Pending Collections</h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <FaTimes size={12} />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto no-scrollbar" style={{ backgroundColor: '#FFFFFF' }}>
            {!hasUnread ? (
              <div className="text-center py-8 text-xs text-[var(--text-muted)] font-medium">
                No dues to collect today
              </div>
            ) : (
              displayReminders.map(rem => (
                <div key={rem._id} className="px-4 py-3 border-b border-[var(--border-color)] hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
                  {/* Customer name — owner perspective */}
                  <p className="text-[var(--text-muted)] text-[11px] font-medium tracking-wide mb-0.5">
                    Due from:
                  </p>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[var(--text-main)] text-sm font-semibold truncate max-w-[160px]">{rem.customerName}</p>
                    {/* Amount in green — money incoming to owner */}
                    <p className="text-emerald-600 text-sm font-bold tracking-tight">
                      To Collect: ₹{rem.pendingAmount?.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium tracking-wide">{rem.mobileNumber || rem.customerMobile}</p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {hasUnread && (
            <div className="p-2 flex justify-center border-t border-[var(--border-color)]" style={{ backgroundColor: '#FAFAFA' }}>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate("/pending-payments");
                }}
                className="w-full py-1.5 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] active:scale-95 transition-all"
              >
                View All Pending Dues
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
       

      <div className="fixed top-0 left-0 w-full h-16 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] z-50 flex items-center justify-between px-4 sm:px-6">

        {/* Logo - Updated to RentVeda */}
        <NavLink to="/" className="flex items-center gap-2 no-underline hover:no-underline">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <span className="text-[var(--text-on-primary)] font-black text-lg">R</span>
          </div>
          <span className="text-[var(--text-main)] font-extrabold text-lg tracking-wide">
            Rent<span className="text-[var(--primary)]">Veda</span>
          </span>
        </NavLink>
 
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-bold no-underline hover:no-underline transition-all ${isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
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
            className="flex items-center gap-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-[var(--primary)] px-3 py-1.5 rounded-full transition-all active:scale-95 text-xs font-bold text-[var(--text-main)]"
          >
            <FaLanguage className="text-[var(--primary)]" size={14} />
            {i18n.language === "en" ? "हिन्दी" : "ENG"}
          </button>

          {/* Notification Dropdown Component */}
          <NotificationDropdown uid={uid} />

          {/* Desktop Profile Icon (Hidden on Mobile) */}
          <div className="hidden md:block border-l border-[var(--border-color)] pl-3 ml-1">
            {uid ? (
              <NavLink to="/profile" className="no-underline hover:no-underline">
                <FaUserCircle size={26} className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors" />
              </NavLink>
            ) : (
              <NavLink to="/login" className="bg-[var(--primary)] text-[var(--text-on-primary)] px-4 py-1.5 rounded-lg text-sm font-bold no-underline hover:no-underline hover:bg-[var(--primary-hover)] transition-colors">
                {t("login") || "Login"}
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          2. BOTTOM TAB BAR (Mobile Only)
          ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white/95 backdrop-blur-lg border-t border-[var(--border-color)] z-50 flex justify-around items-center px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">

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
                  className="absolute -top-1 w-8 h-1 bg-[var(--primary)] rounded-b-full shadow-[0_2px_8px_var(--primary)]"
                />
              )}

              <item.icon
                size={isActive ? 22 : 20}
                className={`mb-1 transition-all duration-300 ${isActive ? "text-[var(--primary)]" : "text-[var(--nav-inactive)]"
                  }`}
              />
              <span className={`text-[9px] font-bold no-underline transition-all duration-300 ${isActive ? "text-[var(--primary)]" : "text-[var(--nav-inactive)]"
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
              className="absolute -top-1 w-8 h-1 bg-[var(--primary)] rounded-b-full shadow-[0_2px_8px_var(--primary)]"
            />
          ) : null}

          {uid ? (
            <FaUserCircle size={location.pathname === "/profile" ? 22 : 20} className={`mb-1 transition-all duration-300 ${location.pathname === "/profile" ? "text-[var(--primary)]" : "text-[var(--nav-inactive)]"}`} />
          ) : (
            <FaSignInAlt size={location.pathname === "/login" ? 22 : 20} className={`mb-1 transition-all duration-300 ${location.pathname === "/login" ? "text-[var(--primary)]" : "text-[var(--nav-inactive)]"}`} />
          )}
          <span className={`text-[9px] font-bold no-underline transition-all duration-300 ${location.pathname === "/profile" || location.pathname === "/login" ? "text-[var(--primary)]" : "text-[var(--nav-inactive)]"
            }`}>
            {uid ? (t("profile") || "Profile") : (t("login") || "Login")}
          </span>
        </NavLink>

      </div>
    </>
  );
}

export default Navbar;