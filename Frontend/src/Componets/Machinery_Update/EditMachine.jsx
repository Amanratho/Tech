import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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
  

  useEffect(() => {
    console.log("Machine ID from URL:", id);
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
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/machine/machines/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Machine updated successfully!");
        window.location.href = "/machinery-update";
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to update the machine.");
      toast.error("Failed to update the machine.");
    } finally {
      setIsSubmitting(false);
    }
  };

 


  return (
    <div className="flex justify-center items-center min-h-screen bg-[#4C4C4D] p-5">
    <div className="bg-[#333333] w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/3 flex flex-col p-8 border border-[#FEC111] rounded-2xl shadow-xl">
      <h1 className="text-[#FEC111] text-2xl sm:text-3xl font-bold mb-6 text-center">
        {t('updateMachineTitle')}
      </h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="MachineName"
            className="block text-[#F5F5F5] mb-2 font-bold text-sm sm:text-[18px]"
          >
            {t('machineNameLabel')}
          </label>
          <input
            type="text"
            id="MachineName"
            name="machineName"
            value={formData.machineName || ""}
            onChange={handleChange}
            placeholder={t('machineNamePlaceholder')}
            className="w-full bg-[#4C4C4D] text-[#F5F5F5] placeholder-[#F5F5F5] border border-[#FEC111] rounded-lg p-3 focus:outline-none focus:ring focus:ring-[#FEC111]"
            required
          />
        </div>

        <div>
          <label
            htmlFor="rentType"
            className="block text-[#F5F5F5] mb-2 font-bold text-sm sm:text-[18px]"
          >
            {t('rentTypeLabel')}
          </label>
          <select
            id="rentType"
            name="rentType"
            value={formData.rentType}
            onChange={handleChange}
            className="w-full bg-[#4C4C4D] text-[#F5F5F5] border border-[#FEC111] rounded-lg p-3 focus:outline-none focus:ring focus:ring-[#FEC111]"
            required
          >
            <option value="" disabled>
              {t('rentTypePlaceholder')}
            </option>
            <option value="Acre">{t('rentTypeOptions.acre')}</option>
            <option value="Hour">{t('rentTypeOptions.hour')}</option>
            <option value="Quantity">{t('rentTypeOptions.quantity')}</option>
            <option value="Days">{t('rentTypeOptions.days')}</option>
            <option value="Contract">{t('rentTypeOptions.contract')}</option>
            <option value="Kilometers">{t('rentTypeOptions.kilometers')}</option>
            <option value="Foot">{t('rentTypeOptions.foot')}</option>
          </select>
        </div>

        {error && (
          <div className="text-red-500 bg-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mt-4">
          <label
            htmlFor="machineImage"
            className="block text-[#F5F5F5] font-bold text-sm sm:text-[18px]"
          >
            {t('uploadImageLabel')}
          </label>
          <div className="bg-[#4C4C4D] mt-2 flex items-center justify-between h-16 rounded-lg w-full p-3">
            <input
              type="file"
              id="machineImage"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="machineImage"
              className="text-[#F5F5F5] cursor-pointer w-full"
            >
              {image ? image.name : t('chooseFile')}
            </label>
          </div>

          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt={t('imagePreviewAlt')}
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-[#F8981D] text-gray-900 font-bold py-3 rounded-lg transition duration-300 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-[#D9781A]"
          }`}
        >
          {isSubmitting ? t('updatingButton') : t('updateButton')}
        </button>
      </form>
    </div>
  </div>

  );
};

export default EditMachine;
