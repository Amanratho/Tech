import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  FaUserCircle,
  FaPencilAlt,
  FaSignOutAlt,
  FaCog,
  FaQrcode,
  FaChevronRight,
  FaEnvelope,
  FaPhoneAlt,
  FaBuilding,
  FaHeadset,
  FaInfoCircle
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        toast.error("User ID not found. Please log in again.");
        window.location.href = "/login";
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/${uid}`
        );
        setUser(response.data);
      } catch (error) {
        toast.error("Failed to fetch user profile");
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4 p-2">
          <p className="text-white font-semibold text-sm text-center">
            {t("logoutConfirmation") || "Are you sure you want to log out?"}
          </p>
          <div className="flex justify-center gap-3 mt-1">
            <button
              className="bg-transparent text-gray-400 px-5 py-2.5 rounded-full text-xs font-bold hover:text-white hover:bg-white/5 transition-all"
              onClick={closeToast}
            >
              {t("logoutNo") || "Cancel"}
            </button>
            <button
              className="bg-red-500 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-all"
              onClick={() => {
                dispatch({ type: "LOGOUT" });
                localStorage.removeItem("token");
                localStorage.removeItem("uid");
                closeToast();
                window.location.href = "/login";
              }}
            >
              {t("logoutYes") || "Logout"}
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
        className: "bg-[#1A1A1A] rounded-3xl border-none shadow-2xl", // Boxy toast fixed too
      }
    );
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#121212] pt-2 mt-12 pb-24 font-sans relative overflow-hidden">

      {/* HEADER: Clean, No Borders */}
      <div className="sticky top-0 z-20 bg-[#121212]/80 backdrop-blur-xl px-4 py-3 mb-4">
        <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center w-full m-0">
          {t('profileTitle') || "MY PROFILE"}
        </h2>
      </div>

      <div className="max-w-md mx-auto px-5">
        {!user ? (
          <div className="flex flex-col items-center justify-center mt-20 space-y-5 animate-pulse">
            <div className="w-28 h-28 bg-[#1A1A1A] rounded-full"></div>
            <div className="h-6 w-36 bg-[#1A1A1A] rounded-full"></div>
            <div className="h-4 w-48 bg-[#1A1A1A] rounded-full"></div>
          </div>
        ) : (
          <>
            {/* 1. HERO SECTION (Completely Borderless & Floating) */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center relative mt-6 mb-10"
            >
              {/* Massive Soft Background Glow instead of a box */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Avatar without boxy borders */}
              <div className="relative mb-5 group">
                <div className="w-28 h-28 bg-gradient-to-br from-[#222] to-[#111] rounded-full flex items-center justify-center text-[var(--primary)] shadow-2xl shadow-[var(--primary)]/10 ring-4 ring-[#121212] ring-offset-2 ring-offset-[var(--primary)]/20">
                  <FaUserCircle size={80} className="opacity-90" />
                </div>
              </div>

              <h1 className="text-2xl font-black text-white tracking-tight text-center z-10 mb-2">
                {user.username}
              </h1>

              <p className="text-[10px] text-black font-extrabold uppercase tracking-widest bg-[var(--primary)] px-4 py-1.5 rounded-full z-10 shadow-lg shadow-[var(--primary)]/20">
                Business Owner
              </p>
            </motion.div>

            {/* 2. USER DETAILS (Floating Text Rows, No Boxes, No Borders) */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="space-y-6 px-2 mb-10"
            >
              <div className="flex items-center gap-5 group">
                <FaPhoneAlt size={16} className="text-gray-600 group-hover:text-[var(--primary)] transition-colors" />
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Mobile</p>
                  <p className="text-base text-white font-medium tracking-wide">+91 {user.mobileNo}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <FaEnvelope size={16} className="text-gray-600 group-hover:text-[var(--primary)] transition-colors" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Email</p>
                  <p className="text-base text-white font-medium tracking-wide truncate" title={user.email}>{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <FaBuilding size={16} className="text-gray-600 group-hover:text-[var(--primary)] transition-colors" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Company</p>
                  <p className="text-base text-white font-medium tracking-wide truncate" title={user.companyName}>{user.companyName}</p>
                </div>
              </div>
            </motion.div>

            {/* 3. SETTINGS MENU (Sleek Glass Container, No Internal Dividers) */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-[#181818] rounded-[2rem] p-3 shadow-xl mb-8"
            >
              {/* Payment QR (Integrated smoothly) */}
              <div className="flex items-center p-3 mb-2 bg-[#222]/50 rounded-2xl">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-[var(--primary)] mr-4">
                  <FaQrcode size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm mb-0.5">Payment QR</h3>
                  <p className="text-[10px] text-gray-500">Receive payments</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center">
                  {user.qrCodeUrl ? (
                    <img src={user.qrCodeUrl} alt="QR" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-[8px] font-bold text-gray-400">NO QR</span>
                  )}
                </div>
              </div>

              {/* Menu Links */}
              <Link to="/EditProfile" className="flex items-center justify-between p-4 no-underline rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <FaCog size={18} className="text-gray-400" />
                  <span className="text-sm font-bold text-white tracking-wide">{t('editProfileButton') || "Edit Profile"}</span>
                </div>
                <FaChevronRight size={12} className="text-gray-600" />
              </Link>

              <Link to="/Machinery-Update" className="flex items-center justify-between p-4 no-underline rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <FaPencilAlt size={16} className="text-blue-400" />
                  <span className="text-sm font-bold text-white tracking-wide">{t('updateMachineryButton') || "Update Machinery"}</span>
                </div>
                <FaChevronRight size={12} className="text-gray-600" />
              </Link>

              <Link to="/contact" className="flex items-center justify-between p-4 no-underline rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <FaHeadset size={18} className="text-green-400" />
                  <span className="text-sm font-bold text-white tracking-wide">{t('contactSupport') || "Contact Support"}</span>
                </div>
                <FaChevronRight size={12} className="text-gray-600" />
              </Link>

              <Link to="/about" className="flex items-center justify-between p-4 no-underline rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <FaInfoCircle size={18} className="text-purple-400" />
                  <span className="text-sm font-bold text-white tracking-wide">{t('aboutUs') || "About RentVeda"}</span>
                </div>
                <FaChevronRight size={12} className="text-gray-600" />
              </Link>
            </motion.div>

            {/* 4. LOGOUT (Clean text-button approach) */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-10"
            >
              <button
                onClick={handleLogout}
                className="py-4 px-8 text-red-500 font-extrabold text-sm rounded-full flex items-center gap-2 hover:bg-red-500/10 active:scale-95 transition-all"
              >
                <FaSignOutAlt size={16} />
                {t('logoutButton') || "Log Out from RentVeda"}
              </button>
            </motion.div>

            {/* Ultra-Minimal Footer */}
            <div className="text-center pb-8 opacity-50">
              <p className="text-[9px] text-white font-bold tracking-[0.2em] uppercase">RentVeda V1.0</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;