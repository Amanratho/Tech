import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { v4 as uuidv4 } from "uuid";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import {
  FaTractor,
  FaCogs,
  FaCloudUploadAlt,
  FaPen,
  FaArrowLeft
} from "react-icons/fa";

function MachineRegistration() {
  const { t } = useTranslation();

  const notifySuccess = () => {
    toast.success(t('successMessage') || "Machine registered successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark", // Changed to dark theme
    });
  };

  const notifyError = () => {
    toast.error(t('errorMessage') || "Failed to register.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };

  const [formData, setFormData] = useState({
    machineName: "",
    rentType: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    } else {
      setPreview(null);
      setImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const machineId = uuidv4();
    const token = localStorage.getItem("token");
    const uid = localStorage.getItem("uid");

    if (!uid) {
      window.location.href = "/login";
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("Machine_id", machineId);
    formDataToSend.append("Machine_name", formData.machineName);
    formDataToSend.append("RentType", formData.rentType);
    formDataToSend.append("image", image);
    formDataToSend.append("uid", uid);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/machine/addMachine`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFormData({
          machineName: "",
          rentType: "",
        });
        setImage(null);
        setPreview(null);
        notifySuccess();
        window.location.href = "/";
      }
    } catch (error) {
      notifyError();
      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to register the machine."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen pb-20 flex flex-col relative overflow-hidden">

      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] mt-16 px-4 py-3 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white p-1">
          <FaArrowLeft size={14} />
        </button>
        <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
          {t("registerMachine") || "REGISTER MACHINE"}
        </h2>
      </div>

      <div className="flex-1 flex justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1E1E] w-full max-w-md rounded-2xl p-5 border border-[#2C2C2C] shadow-lg mt-2 h-fit"
        >
          <div className="mb-6 text-center">
            <h1 className="text-white text-xl font-bold mb-1">Add New Machine</h1>
            <p className="text-gray-500 text-xs">Enter details to list your machine for rent</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Machine Name */}
            <div>
              <label htmlFor="MachineName" className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">
                {t("machineName") || "Machine Name"}
              </label>
              <div className="relative">
                <FaTractor className="absolute left-3.5 top-3.5 text-gray-500 text-sm" />
                <input
                  type="text"
                  id="MachineName"
                  name="machineName"
                  value={formData.machineName}
                  onChange={handleChange}
                  placeholder={t("enterMachineName") || "e.g. John Deere 5310"}
                  className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all text-sm placeholder-gray-600"
                  required
                />
              </div>
            </div>

            {/* Rent Type */}
            <div>
              <label htmlFor="rentType" className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">
                {t("rentType") || "Rent Type (Pricing Unit)"}
              </label>
              <div className="relative">
                <FaCogs className="absolute left-3.5 top-3.5 text-gray-500 text-sm z-10" />
                <select
                  id="rentType"
                  name="rentType"
                  value={formData.rentType}
                  onChange={handleChange}
                  className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all text-sm appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="text-gray-500">{t("selectRentType") || "Select Unit"}</option>
                  <option value="Acre">{t("byAcre") || "Per Acre"}</option>
                  <option value="Hour">{t("byHour") || "Per Hour"}</option>
                  <option value="Quantity">{t("byQuantity") || "Per Quantity"}</option>
                  <option value="Days">{t("byDays") || "Per Day"}</option>
                  <option value="Contract">{t("byContract") || "Contract Basis"}</option>
                  <option value="Kilometers">{t("byKilometers") || "Per Kilometer"}</option>
                  <option value="Foot">{t("byFoot") || "Per Foot"}</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-4 top-4 pointer-events-none text-gray-500 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">
                {t("uploadMachineImage") || "Machine Image"}
              </label>

              <div className="relative w-full h-36 bg-[#121212] border-2 border-dashed border-[#333] hover:border-gray-500 rounded-xl transition-colors overflow-hidden group">
                <input
                  type="file"
                  id="machineImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required={!preview}
                />

                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-70 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-black/60 px-3 py-1.5 rounded-lg flex items-center gap-2 text-white text-xs font-bold backdrop-blur-sm">
                        <FaPen size={10} /> Change Image
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none">
                    <div className="w-10 h-10 bg-[#1E1E1E] rounded-full flex items-center justify-center mb-2 shadow-inner">
                      <FaCloudUploadAlt size={20} className="text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold">Tap to upload photo</span>
                    <span className="text-[9px] mt-1 text-gray-600">JPG, PNG, GIF up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-red-400 text-xs text-center flex items-center justify-center gap-2">
                <span className="font-bold">!</span> {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[var(--primary)]/10 flex items-center justify-center transition-all ${isSubmitting
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-[var(--primary)] text-black active:scale-[0.98] hover:bg-yellow-500"
                }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  {t("submitting") || "Saving..."}
                </div>
              ) : (
                t("submit") || "Register Machine"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default MachineRegistration;