import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "../../utils/toastService";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaUser,
  FaPhoneAlt,
  FaBuilding,
  FaQrcode,
  FaCloudUploadAlt,
  FaPen,
  FaArrowLeft,
  FaTrashAlt
} from "react-icons/fa";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

const EditProfile = () => {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState({
    username: "",
    mobileNo: "",
    companyName: "",
  });
  const [qrCode, setQrCode] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const uid = localStorage.getItem("uid");

  // Fetch initial profile data to pre-fill the form
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uid) return;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/${uid}`
        );
        const data = response.data;
        setProfileData({
          username: data.username || "",
          mobileNo: data.mobileNo || "",
          companyName: data.companyName || "",
        });
        if (data.qrCodeUrl) {
          setQrPreview(data.qrCodeUrl);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };
    fetchUserProfile();
  }, [uid]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle QR Code file selection
  const handleQrCodeChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setQrCode(file);
      const reader = new FileReader();
      reader.onload = () => setQrPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", profileData.username);
      formData.append("mobileNo", profileData.mobileNo);
      formData.append("companyName", profileData.companyName);

      if (qrCode) {
        formData.append("qrImage", qrCode);
      }

      await axios.put(`${API_BASE_URL}/api/users/${uid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(t('profileUpdateSuccess') || "Profile updated successfully!");
      setTimeout(() => {
        window.history.back();
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t('profileUpdateFailed') || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  // Opens the danger confirm modal
  const handleDeleteAccount = () => setIsDeleteOpen(true);

  // Executed after user confirms in modal
  const performDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/user/delete/${uid}`);
      toast.success(t('accountDeletedSuccess') || "Your account has been deleted successfully.");
      localStorage.removeItem("uid");
      localStorage.removeItem("token");
      
      // Clear Tracker Data
      localStorage.removeItem("rentveda_timer_status");
      localStorage.removeItem("rentveda_startTime");
      localStorage.removeItem("rentveda_pausedTime");
      localStorage.removeItem("rentveda_count");
      localStorage.removeItem("rentveda_distance");
      localStorage.removeItem("rentveda_activeTab");
      localStorage.removeItem("rentveda_pending_time_entry");
      localStorage.removeItem("rentveda_pending_count_entry");
      localStorage.removeItem("rentveda_pending_km_entry");

      setIsDeleteOpen(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t('accountDeleteFailed') || "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] mt-16 pb-20 relative overflow-hidden font-sans">

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
        <button onClick={() => window.history.back()} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-2 -ml-2 transition-colors">
          <FaArrowLeft size={16} />
        </button>
        <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest text-center mr-6">
          {t('editProfileTitle') || "EDIT PROFILE"}
        </h2>
        <div></div> {/* Empty div for flex spacing */}
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-5 sm:p-6 border border-[var(--border-color)] shadow-2xl relative"
        >
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

            {/* Input Fields */}
            {[
              { key: "username", label: t('nameLabel') || "Full Name", icon: FaUser, type: "text" },
              { key: "mobileNo", label: t('mobileLabel') || "Mobile Number", icon: FaPhoneAlt, type: "tel" },
              { key: "companyName", label: t('companyNameLabel') || "Company Name", icon: FaBuilding, type: "text" },
            ].map(({ key, label, icon: Icon, type }) => (
              <div key={key}>
                <label htmlFor={key} className="block text-[var(--text-muted)] text-xs font-semibold mb-1.5 pl-1">
                  {label}
                </label>
                <div className="relative">
                  <Icon className="absolute left-4 top-3.5 text-[var(--text-muted)] text-sm" />
                  <input
                    type={type}
                    id={key}
                    name={key}
                    value={profileData[key] || ""}
                    onChange={handleInputChange}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-[var(--text-muted)]"
                  />
                </div>
              </div>
            ))}

            {/* QR Code Upload Section */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <label className="block text-[var(--text-muted)] text-xs font-semibold mb-1.5 pl-1 flex items-center gap-2">
                <FaQrcode className="text-[var(--primary)]" /> {t('qrCodeLabel') || "Payment QR Code"}
              </label>

              <div className="relative w-full h-40 bg-[var(--bg-main)] border-2 border-dashed border-[var(--border-color)] hover:border-[var(--primary)]/50 rounded-xl transition-colors overflow-hidden group">
                <input
                  type="file"
                  id="qrCode"
                  accept="image/*"
                  onChange={handleQrCodeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {qrPreview ? (
                  <>
                    <img
                      src={qrPreview}
                      alt="QR Preview"
                      className="w-full h-full object-contain p-2 opacity-90 group-hover:opacity-60 transition-opacity bg-white"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-black/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[var(--text-main)] text-xs font-bold backdrop-blur-sm">
                        <FaPen size={10} /> Change QR
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-muted)] pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-inner border border-[var(--border-color)]">
                      <FaCloudUploadAlt size={22} className="text-[var(--text-muted)]" />
                    </div>
                    <span className="text-xs font-semibold">Tap to upload QR</span>
                    <span className="text-[9px] mt-1 text-[var(--text-muted)]">JPG, PNG up to 2MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center transition-all ${isLoading
                    ? "bg-gray-600 text-[var(--text-muted)] cursor-not-allowed"
                    : "bg-[var(--primary)] text-black hover:bg-yellow-500 shadow-[var(--primary)]/20 active:scale-95"
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    {t('updatingButton') || "Saving Changes..."}
                  </div>
                ) : (
                  t('updateButton') || "Save Profile"
                )}
              </button>

              <button
                onClick={handleDeleteAccount}
                type="button"
                className="w-full py-3.5 bg-transparent border border-red-500/30 text-red-500 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 active:scale-95 transition-all"
              >
                <FaTrashAlt size={12} />
                {t('deleteAccountButton') || "Delete Account"}
              </button>
            </div>

          </form>
        </motion.div>
      </div>

      {/* DELETE ACCOUNT CONFIRM MODAL */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={performDeleteAccount}
        isLoading={isDeleting}
        variant="danger"
        title={t('confirmDeleteAccountTitle') || "Delete Account?"}
        message={
          t('confirmDeleteAccountMessage') ||
          "Are you sure you want to delete your account? This action is <b class=\"text-red-400\">irreversible</b> and all your data will be permanently erased."
        }
        confirmText={t('deleteButton') || "Delete"}
        cancelText={t('cancelButton') || "Cancel"}
      />
    </div>
  );
};

export default EditProfile;