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
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "../../utils/toastService";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        toast.error(t('userIdNotFound') || "User ID not found. Please log in again.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/${uid}`
        );
        setUser(response.data);
      } catch (error) {
        toast.error(t('fetchProfileFailed') || "Failed to fetch user profile");
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleConfirmLogout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("token");
    localStorage.removeItem("uid");
    localStorage.removeItem("user");
    setIsLogoutModalOpen(false);
    toast.success(t("logoutSuccess") || "Logged out successfully!");
    navigate("/login");
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] pt-2 mt-12 pb-24 font-sans relative overflow-hidden">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl px-4 py-3 mb-4">
        <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest text-center w-full m-0">
          {t('profileTitle') || "MY PROFILE"}
        </h2>
      </div>

      <div className="max-w-md mx-auto px-5">
        {!user ? (
          <div className="flex flex-col items-center justify-center mt-20 space-y-5 animate-pulse">
            <div className="w-28 h-28 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-36 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-48 bg-gray-200 rounded-full"></div>
          </div>
        ) : (
          <>
            {/* 1. HERO SECTION */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center relative mt-6 mb-10"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="relative mb-5 group">
                <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-[var(--primary)] shadow-2xl shadow-[var(--primary)]/10 ring-4 ring-[var(--bg-main)] ring-offset-2 ring-offset-[var(--primary)]/20">
                  <FaUserCircle size={80} className="opacity-90" />
                </div>
              </div>

              <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight text-center z-10 mb-2">
                {user.username}
              </h1>

              <p className="text-[10px] text-black font-extrabold uppercase tracking-widest bg-[var(--primary)] px-4 py-1.5 rounded-full z-10 shadow-lg shadow-[var(--primary)]/20">
                Business Owner
              </p>
            </motion.div>

            {/* 2. USER DETAILS */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="space-y-6 px-2 mb-10"
            >
              <div className="flex items-center gap-5 group">
                <FaPhoneAlt size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                <div className="flex-1">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-0.5">Mobile</p>
                  <p className="text-base text-[var(--text-main)] font-medium tracking-wide">+91 {user.mobileNo}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <FaEnvelope size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-0.5">Email</p>
                  <p className="text-base text-[var(--text-main)] font-medium tracking-wide truncate" title={user.email}>{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <FaBuilding size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-0.5">Company</p>
                  <p className="text-base text-[var(--text-main)] font-medium tracking-wide truncate" title={user.companyName}>{user.companyName}</p>
                </div>
              </div>
            </motion.div>

            {/* 3. SETTINGS MENU */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-3 shadow-xl mb-8 border border-[#e2e2e2]"
            >
              {/* Payment QR */}
              <Link
                to="/EditProfile"
                className="flex items-center p-3 mb-2 bg-[#fffdf0] hover:bg-[#fff9d6] border border-[#fbc02d]/40 rounded-2xl transition-all no-underline cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white border border-[#e2e2e2] rounded-xl flex items-center justify-center text-[#795900] mr-3.5 shadow-sm">
                  <FaQrcode size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[#1a1c1c] font-bold text-sm">
                      {t("paymentQrTitle") || "Payment QR Code"}
                    </h3>
                    {!user.qrCodeUrl && (
                      <span className="text-[9px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full animate-pulse">
                        {t("missingQrBadge") || "Missing"}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#4f4633] font-medium mt-0.5">
                    {user.qrCodeUrl
                      ? (t("tapToUpdateQr") || "Tap to view or update UPI QR Code")
                      : (t("tapToUploadQr") || "⚠️ Tap to upload your UPI QR Code for bills")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center border border-[#e2e2e2] shadow-sm flex-shrink-0">
                  {user.qrCodeUrl ? (
                    <img src={user.qrCodeUrl} alt="QR" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-[9px] font-bold text-[#795900] text-center">ADD</span>
                  )}
                </div>
              </Link>

              {/* Menu Links */}
              <Link to="/EditProfile" className="flex items-center justify-between p-4 no-underline rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <FaCog size={18} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-bold text-[var(--text-main)] tracking-wide">{t('editProfileButton') || "Edit Profile"}</span>
                </div>
                <FaChevronRight size={12} className="text-[var(--text-muted)]" />
              </Link>

              <Link to="/Machinery-Update" className="flex items-center justify-between p-4 no-underline rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <FaPencilAlt size={16} className="text-blue-500" />
                  <span className="text-sm font-bold text-[var(--text-main)] tracking-wide">{t('updateMachineryButton') || "Update Machinery"}</span>
                </div>
                <FaChevronRight size={12} className="text-[var(--text-muted)]" />
              </Link>

              <Link to="/contact" className="flex items-center justify-between p-4 no-underline rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <FaHeadset size={18} className="text-green-500" />
                  <span className="text-sm font-bold text-[var(--text-main)] tracking-wide">{t('contactSupport') || "Contact Support"}</span>
                </div>
                <FaChevronRight size={12} className="text-[var(--text-muted)]" />
              </Link>

              <Link to="/about" className="flex items-center justify-between p-4 no-underline rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <FaInfoCircle size={18} className="text-purple-500" />
                  <span className="text-sm font-bold text-[var(--text-main)] tracking-wide">{t('aboutUs') || "About RentVeda"}</span>
                </div>
                <FaChevronRight size={12} className="text-[var(--text-muted)]" />
              </Link>
            </motion.div>

            {/* 4. LOGOUT BUTTON */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-10"
            >
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full py-3.5 bg-red-50 hover:bg-red-100 border border-red-200 text-[#dc2626] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <FaSignOutAlt size={14} />
                <span>{t('logoutButton') || "Log Out of RentVeda"}</span>
              </button>
            </motion.div>
          </>
        )}
      </div>

      {/* 5. CONFIRM LOGOUT MODAL */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title={t("logoutTitle") || "Log Out of RentVeda?"}
        message={t("logoutConfirmation") || "Are you sure you want to log out of your account?"}
        confirmText={t("logoutButton") || "Log Out"}
        cancelText={t("cancelButton") || "Cancel"}
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default Profile;