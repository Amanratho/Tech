import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "../../utils/toastService";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FaTractor,
  FaCogs,
  FaCloudUploadAlt,
  FaPen,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Machine ID from URL
  const navigate = useNavigate();

  // Automatically fetch & pre-fill existing machine details on mount
  useEffect(() => {
    const fetchMachineDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const uid = localStorage.getItem("uid");
        const response = await axios.post(`${API_BASE_URL}/api/machines`, { uid });
        const machineList = response.data || [];
        const existingMachine = machineList.find(
          (m) => m.Machine_id === id || String(m.Machine_id) === String(id)
        );

        if (existingMachine) {
          setFormData({
            machineName: existingMachine.Machine_name || "",
            rentType: existingMachine.RentType || "",
          });
          if (existingMachine.image) {
            setPreview(existingMachine.image);
          }
        }
      } catch (err) {
        console.error("Error fetching machine details for edit:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachineDetails();
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
        toast.success(t('machineUpdateSuccess') || "Machine updated successfully!");
        navigate("/Machinery-Update");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || (t('machineUpdateFailed') || "Failed to update the machine.");
      setError(errorMsg);
      toast.error(t('machineUpdateFailed') || "Failed to update the machine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen pt-16 pb-28 flex flex-col font-body-md relative">
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border border-[#e2e2e2] shadow-xl relative"
        >
          {/* Header Title inside card */}
          <div className="pb-4 border-b border-[#e2e2e2] mb-5">
            <h2 className="text-[#1a1c1c] text-base font-bold tracking-tight">
              {t("updateMachineTitle") || "Edit Machine Details"}
            </h2>
            <p className="text-[#4f4633] text-xs font-semibold mt-0.5">
              Update name, rental rate unit, or photo
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-[#4f4633] text-xs font-semibold">
              Loading machine details...
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Machine Name */}
              <div>
                <label htmlFor="MachineName" className="block text-[#4f4633] text-xs font-semibold mb-1.5 pl-1">
                  {t("machineNameLabel") || "Machine Name"}
                </label>
                <div className="relative">
                  <FaTractor className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f4633] text-xs" />
                  <input
                    type="text"
                    id="MachineName"
                    name="machineName"
                    value={formData.machineName}
                    onChange={handleChange}
                    placeholder={t("machineNamePlaceholder") || "e.g. Harvester 2000"}
                    className="w-full bg-[#f9f9f9] text-[#1a1c1c] border border-[#e2e2e2] rounded-2xl py-3 pl-9 pr-4 focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all text-xs font-medium placeholder-[#4f4633] shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Rent Type */}
              <div>
                <label htmlFor="rentType" className="block text-[#4f4633] text-xs font-semibold mb-1.5 pl-1">
                  {t("rentTypeLabel") || "Rent Type (Pricing Unit)"}
                </label>
                <div className="relative">
                  <FaCogs className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f4633] text-xs z-10" />
                  <select
                    id="rentType"
                    name="rentType"
                    value={formData.rentType}
                    onChange={handleChange}
                    className="w-full bg-[#f9f9f9] text-[#1a1c1c] border border-[#e2e2e2] rounded-2xl py-3 pl-9 pr-8 focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all text-xs font-medium appearance-none cursor-pointer shadow-inner"
                    required
                  >
                    <option value="" disabled className="text-[#4f4633]">
                      {t("rentTypePlaceholder") || "Select Unit"}
                    </option>
                    <option value="Acre">{t("rentTypeAcre") || "Per Acre"}</option>
                    <option value="Hour">{t("rentTypeHour") || "Per Hour"}</option>
                    <option value="Quantity">{t("rentTypeQuantity") || "Per Quantity"}</option>
                    <option value="Days">{t("rentTypeDays") || "Per Day"}</option>
                    <option value="Contract">{t("rentTypeContract") || "Contract Basis"}</option>
                    <option value="Kilometers">{t("rentTypeKilometers") || "Per Kilometer"}</option>
                    <option value="Foot">{t("rentTypeFoot") || "Per Foot"}</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#4f4633] text-[10px]">▼</div>
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="pt-2">
                <label className="block text-[#4f4633] text-xs font-semibold mb-1.5 pl-1">
                  {t("uploadImageLabel") || "Machine Image"}
                </label>

                <div className="relative w-full h-40 bg-[#f9f9f9] border-2 border-dashed border-[#e2e2e2] hover:border-[#fbc02d] rounded-2xl transition-colors overflow-hidden group cursor-pointer">
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
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:opacity-60 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-white text-xs font-bold backdrop-blur-sm">
                          <FaPen size={10} /> Change Image
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#4f4633] pointer-events-none">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm border border-[#e2e2e2] text-[#795900]">
                        <FaCloudUploadAlt size={20} />
                      </div>
                      <span className="text-xs font-bold">Tap to update photo</span>
                      <span className="text-[10px] mt-0.5 text-[#4f4633]">Leave blank to keep current photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-2xl text-red-600 text-xs text-center font-bold">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/Machinery-Update")}
                  className="flex-1 py-3 bg-[#f9f9f9] border border-[#e2e2e2] text-[#1a1c1c] rounded-2xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#fbc02d] hover:bg-[#f8bd2a] text-[#6c5000] rounded-2xl text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-md shadow-[#fbc02d]/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : (t("updateButton") || "Save Changes")}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EditMachine;