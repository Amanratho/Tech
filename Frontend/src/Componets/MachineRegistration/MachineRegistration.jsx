import React, { useState } from "react";
import axios from "axios";

import { v4 as uuidv4 } from "uuid";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';

function MachineRegistration() {
const { t } = useTranslation();

  const notifySuccess = () => {
    toast.success(t('successMessage'), {
      position: "top-right",
      autoClose: 3000, // 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const notifyError = () => {
    toast.error(t('errorMessage'), {
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

  const [image, setImage] = useState(null); // File object
  const [preview, setPreview] = useState(null); // Image preview URL
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setImage(null); // Clear the image state as well
    }
  };

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Reset previous error

    const machineId = uuidv4();

    // Decode the token to get user ID
    const token = localStorage.getItem("token"); // Ensure token is stored here
    const uid = localStorage.getItem("uid"); // Ensure token is stored here
    console.log("uid:", uid);
    if (!uid) {
      toast.success("hello");
      // alert("User ID not found. Please (log in / create account).");
      window.location.href = "/login";
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("Machine_id", machineId);
    formDataToSend.append("Machine_name", formData.machineName);
    formDataToSend.append("RentType", formData.rentType);
    formDataToSend.append("image", image);
    formDataToSend.append("uid", uid); // Add user ID to the request

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/machine/addMachine`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Pass token for authentication
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
        // alert("Machine registered successfully!");
        window.location.href = "/";
      }
    } catch (error) {
      // console.error("Error submitting the form:", error);
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
    <>
      <div className="flex justify-center items-center min-h-screen my-4 bg-[#4C4C4D] p-5">
        <div className="bg-[#333333] w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col p-6 sm:p-8 md:p-10 border border-yellow-500 rounded-2xl shadow-xl">
          <h1 className="text-[#FEC111] text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center">
            {t("registerMachine")}
          </h1>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="MachineName"
                className="block text-[#FEC111] mb-1 sm:mb-2 font-bold text-sm sm:text-base md:text-lg"
              >
                {t("machineName")}
              </label>
              <input
                type="text"
                id="MachineName"
                name="machineName"
                value={formData.machineName}
                onChange={handleChange}
                placeholder={t("enterMachineName")}
                className="w-full bg-gray-700 text-white placeholder-gray-400 border border-yellow-400 rounded-lg p-2 sm:p-3 focus:outline-none focus:ring focus:ring-yellow-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="rentType"
                className="block text-[#FEC111] mb-1 sm:mb-2 font-bold text-sm sm:text-base md:text-lg"
              >
                {t("rentType")}
              </label>
              <select
                id="rentType"
                name="rentType"
                value={formData.rentType}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-yellow-400 rounded-lg p-2 sm:p-3 focus:outline-none focus:ring focus:ring-yellow-500"
                required
              >
                <option value="" disabled>
                  {t("selectRentType")}
                </option>
                <option value="Acre">{t("byAcre")}</option>
                <option value="Hour">{t("byHour")}</option>
                <option value="Quantity">{t("byQuantity")}</option>
                <option value="Days">{t("byDays")}</option>
                <option value="Contract">{t("byContract")}</option>
                <option value="Kilometers">{t("byKilometers")}</option>
                <option value="Foot">{t("byFoot")}</option>
              </select>
            </div>
            {error && (
              <div className="text-red-500 bg-red-100 p-2 sm:p-3 rounded mb-2 sm:mb-4">
                {t("errorMessage")}
              </div>
            )}

            <div className="mt-2 sm:mt-4">
              <label
                htmlFor="machineImage"
                className="block text-[#FEC111] font-bold text-sm sm:text-base md:text-lg"
              >
                {t("uploadMachineImage")}
              </label>
              <div className="bg-gray-700 mt-1 sm:mt-2 flex items-center justify-between h-12 sm:h-16 rounded-lg w-full p-2 sm:p-3">
                <input
                  type="file"
                  id="machineImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="machineImage"
                  className="text-white cursor-pointer w-full text-sm sm:text-base"
                >
                  {image ? image.name : t("chooseFile")}
                </label>
              </div>

              {preview && (
                <div className="mt-2 sm:mt-4">
                  <img
                    src={preview}
                    alt="Machine Preview"
                    className="w-full h-32 sm:h-40 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[#F8981D] font-bold py-2 sm:py-3 rounded-lg transition duration-300 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "bg-[#D9781A]"
              }`}
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default MachineRegistration;
