import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";

import "react-confirm-alert/src/react-confirm-alert.css";

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    username: "",
    mobileNo: "",
    companyName: "",
  });
  const [qrCode, setQrCode] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const uid = localStorage.getItem("uid"); // Get UID from localStorage

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

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully!");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <p className="text-gray-800 font-medium">
            Are you sure you want to delete your account? This action is <b>irreversible</b>.
          </p>
          <div className="flex justify-end gap-4">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
              onClick={closeToast}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
              onClick={async () => {
                try {
                  await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/user/delete/${uid}`);
                  toast.success("Your account has been deleted successfully.");
                  localStorage.removeItem("uid");
                  closeToast();
                  window.location.href = "/login";
                } catch (error) {
                  console.error("Error deleting account:", error);
                  toast.error("Failed to delete account. Please try again.");
                }
              }}
            >
              Delete
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
      }
    );
  };
  
  

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#4C4C4D] flex justify-center items-center p-4 mt-5"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#333333] shadow-lg rounded-lg p-6 w-full max-w-5xl"
      >
        <h1 className="text-3xl font-bold text-[#FEC111] text-center mb-8">
          Edit Profile
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Section */}
          <div className="space-y-6">
            {[
              { key: "username", label: "Name" },
              { key: "mobileNo", label: "Mobile No" },
              { key: "companyName", label: "Company Name" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-[#F5F5F5]"
                >
                  {label}
                </label>
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={profileData[key] || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border border-[#F5F5F5] rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={`Enter your ${label}`}
                />
              </div>
            ))}
          </div>

          {/* Right Section (QR Code) */}
          <div className="space-y-6 flex flex-col items-center">
            {qrPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-4"
              >
                <img
                  src={qrPreview}
                  alt="QR Code Preview"
                  className="w-40 h-40 rounded-lg border border-[#F5F5F5]"
                />
              </motion.div>
            )}
            <div className="w-full">
              <label
                htmlFor="qrCode"
                className="block text-sm font-medium text-[#F5F5F5]"
              >
                Upload QR Code
              </label>
              <input
                type="file"
                id="qrCode"
                name="qrCode"
                accept="image/*"
                onChange={handleQrCodeChange}
                className="mt-1 block w-full px-4 py-2 border border-[#F5F5F5] rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center mt-8 w-full ">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex justify-center"
          >
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className={`w-1/2 py-2   ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#F8981D] hover:bg-[#D9781A]"
              } text-white font-semibold rounded-lg shadow-md transition duration-300`}
            >
              {isLoading ? "Updating..." : "Update "}
            </button>
          </motion.div>

          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditProfile;
