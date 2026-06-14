import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FaTractor,
  FaCogs,
  FaCloudUploadAlt,
  FaPen,
  FaArrowLeft
} from "react-icons/fa";

const EditMachine = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    machineName: "",
    rentType: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Machine ID from URL
  const navigate = useNavigate();

  // Automatically fetch existing machine data if you want (optional enhancement)
  // For now, keeping your exact logic


useEffect(() => {
  const fetchMachineData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/machine/machines/${id}`);
      const machine = response.data;

      setFormData({
        machineName: machine.Machine_name || "",
        rentType: machine.RentType || "",
      });

      setPreview(machine.image || null);

    } catch (error) {
      toast.error("Failed to load machine details");
    }
  };
  fetchMachineData();
}, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

    const formDataToSend = new FormData();
    formDataToSend.append("Machine_name", formData.machineName);
    formDataToSend.append("RentType", formData.rentType);
    if (image) {
      formDataToSend.append("image", image);
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/machine/machines/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Machine updated successfully!");
        navigate("/Machinery-Update"); // Using navigate instead of window.location for smoother UX
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to update the machine.";
      setError(errorMsg);
      toast.error("Failed to update the machine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen pb-20 flex flex-col relative overflow-hidden font-sans">

      {/* 1. Top Sticky Header */}
      <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] mt-16 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white p-2 -ml-2 transition-colors">
          <FaArrowLeft size={16} />
        </button>
        <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mr-6">
          {t('updateMachineTitle') || "EDIT MACHINE"}
        </h2>
        <div></div> {/* Spacer */}
      </div>

      {/* 2. Main Form Container */}
      <div className="flex-1 flex justify-center p-4 mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E1E1E] w-full max-w-md rounded-2xl p-5 sm:p-7 border border-[#2C2C2C] shadow-2xl h-fit relative"
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-[50px] pointer-events-none"></div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>

            {/* Machine Name */}
            <div>
              <label htmlFor="MachineName" className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">
                {t('machineNameLabel') || "Machine Name"}
              </label>
              <div className="relative">
                <FaTractor className="absolute left-4 top-3.5 text-gray-500 text-sm" />
                <input
                  type="text"
                  id="MachineName"
                  name="machineName"
                  value={formData.machineName}
                  onChange={handleChange}
                  placeholder={t('machineNamePlaceholder') || "e.g. Harvester 2000"}
                  className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-gray-600"
                  required
                />
              </div>
            </div>

            {/* Rent Type */}
            <div>
              <label htmlFor="rentType" className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">
                {t('rentTypeLabel') || "Rent Type (Pricing Unit)"}
              </label>
              <div className="relative">
                <FaCogs className="absolute left-4 top-3.5 text-gray-500 text-sm z-10" />
                <select
                  id="rentType"
                  name="rentType"
                  value={formData.rentType}
                  onChange={handleChange}
                  className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="text-gray-500">
                    {t('rentTypePlaceholder') || "Select Unit"}
                  </option>
                  <option value="Acre">Per Acre</option>
                    <option value="Hour">Per Hour</option>
                    <option value="Quantity">Per Quantity</option>
                    <option value="Days">Per Day</option>
                    <option value="Contract">Contract Basis</option>
                    <option value="Kilometers">Per Kilometer</option>
                    <option value="Foot">Per Foot</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-4 top-4 pointer-events-none text-gray-500 text-xs">▼</div>
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="pt-2 border-t border-[#333]">
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">
                {t('uploadImageLabel') || "Machine Image"}
              </label>

              <div className="relative w-full h-40 bg-[#121212] border-2 border-dashed border-[#333] hover:border-[var(--primary)]/50 rounded-xl transition-colors overflow-hidden group cursor-pointer">
                <input
                  type="file"
                  id="machineImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt={t('imagePreviewAlt') || "Preview"}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-black/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-white text-xs font-bold backdrop-blur-sm">
                        <FaPen size={10} /> Change Image
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none">
                    <div className="w-12 h-12 bg-[#1E1E1E] rounded-full flex items-center justify-center mb-2 shadow-inner border border-[#333]">
                      <FaCloudUploadAlt size={22} className="text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold">Tap to update photo</span>
                    <span className="text-[9px] mt-1 text-gray-600">Leave blank to keep old image</span>
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
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center transition-all ${isSubmitting
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-[var(--primary)] text-black hover:bg-yellow-500 shadow-[var(--primary)]/20 active:scale-95"
                  }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    {t('updatingButton') || "Saving..."}
                  </div>
                ) : (
                  t('updateButton') || "Save Changes"
                )}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditMachine;