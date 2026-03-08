// import React, { useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { motion } from "framer-motion";
// // import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// import "react-confirm-alert/src/react-confirm-alert.css";

// const EditProfile = () => {
//   const { t } = useTranslation();
//   const [profileData, setProfileData] = useState({
//     username: "",
//     mobileNo: "",
//     companyName: "",
//   });
//   const [qrCode, setQrCode] = useState(null);
//   const [qrPreview, setQrPreview] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const uid = localStorage.getItem("uid"); // Get UID from localStorage

//   // Handle input change
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setProfileData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Handle QR Code file selection
//   const handleQrCodeChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setQrCode(file);
//       const reader = new FileReader();
//       reader.onload = () => setQrPreview(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle profile update
//   const handleUpdate = async () => {
//     setIsLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("username", profileData.username);
//       formData.append("mobileNo", profileData.mobileNo);
//       formData.append("companyName", profileData.companyName);

//       if (qrCode) {
//         formData.append("qrImage", qrCode);
//       }

//       await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       toast.success("Profile updated successfully!");
      
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       toast.error("Failed to update profile.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteAccount = () => {
//     toast(
//       ({ closeToast }) => (
//         <div className="flex flex-col gap-2">
//           <p className="text-gray-800 font-medium">
//             Are you sure you want to delete your account? This action is <b>irreversible</b>.
//           </p>
//           <div className="flex justify-end gap-4">
//             <button
//               className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
//               onClick={closeToast}
//             >
//               Cancel
//             </button>
//             <button
//               className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
//               onClick={async () => {
//                 try {
//                   await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/user/delete/${uid}`);
//                   toast.success("Your account has been deleted successfully.");
//                   localStorage.removeItem("uid");
//                   closeToast();
//                   window.location.href = "/login";
//                 } catch (error) {
//                   console.error("Error deleting account:", error);
//                   toast.error("Failed to delete account. Please try again.");
//                 }
//               }}
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       ),
//       {
//         position: "top-center",
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         hideProgressBar: true,
//       }
//     );
//   };
  
  

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//       className="min-h-screen bg-[#4C4C4D] flex justify-center items-center p-4 mt-5"
//     >
//       <motion.div
//         initial={{ scale: 0.8 }}
//         animate={{ scale: 1 }}
//         transition={{ duration: 0.5 }}
//         className="bg-[#333333] shadow-lg rounded-lg p-6 w-full max-w-5xl"
//       >
//         <h1 className="text-3xl font-bold text-[#FEC111] text-center mb-8">
//         {t('editProfileTitle')}
//         </h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Left Section */}
//           <div className="space-y-6">
//             {[
//               { key: "username", label: t('nameLabel') },
//               { key: "mobileNo", label: t('mobileLabel') },
//               { key: "companyName", label:t('companyNameLabel') },
//             ].map(({ key, label }) => (
//               <div key={key}>
//                 <label
//                   htmlFor={key}
//                   className="block text-sm font-medium text-[#F5F5F5]"
//                 >
//                   {label}
//                 </label>
//                 <input
//                   type="text"
//                   id={key}
//                   name={key}
//                   value={profileData[key] || ""}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full px-4 py-2 border border-[#F5F5F5] rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   placeholder={label}
//                 />
//               </div>
//             ))}
//           </div>

//           {/* Right Section (QR Code) */}
//           <div className="space-y-6 flex flex-col items-center">
//             {qrPreview && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.5 }}
//                 className="mt-4"
//               >
//                 <img
//                   src={qrPreview}
//                   alt="QR Code Preview"
//                   className="w-40 h-40 rounded-lg border border-[#F5F5F5]"
//                 />
//               </motion.div>
//             )}
//             <div className="w-full">
//               <label
//                 htmlFor="qrCode"
//                 className="block text-sm font-medium text-[#F5F5F5]"
//               >
//                 {t('qrCodeLabel')}
//               </label>
//               <input
//                 type="file"
//                 id="qrCode"
//                 name="qrCode"
//                 accept="image/*"
//                 onChange={handleQrCodeChange}
//                 className="mt-1 block w-full px-4 py-2 border border-[#F5F5F5] rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-between items-center mt-8 w-full ">
//           <motion.div
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="w-full flex justify-center"
//           >
//             <button
//               onClick={handleUpdate}
//               disabled={isLoading}
//               className={`w-1/2 py-2   ${
//                 isLoading
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-[#F8981D] hover:bg-[#D9781A]"
//               } text-white font-semibold rounded-lg shadow-md transition duration-300`}
//             >
//               {isLoading ? t('updatingButton') : t('updateButton')}
//             </button>
//           </motion.div>

//           {/* <button
//             onClick={handleDeleteAccount}
//             className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
//           >
//             Delete
//           </button> */}
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default EditProfile;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
import "react-confirm-alert/src/react-confirm-alert.css";

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

  const uid = localStorage.getItem("uid");

  // Fetch initial profile data to pre-fill the form
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uid) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`
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

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully!");
      setTimeout(() => {
        window.history.back(); // Go back to profile after successful update
      }, 1500);
      
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
        <div className="flex flex-col gap-3">
          <p className="text-gray-200 font-semibold text-sm text-center">
             Are you sure you want to delete your account? This action is <b className="text-red-500">irreversible</b>.
          </p>
          <div className="flex justify-center gap-3 mt-2">
            <button
              className="bg-[#2A2A2A] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#333] transition-colors"
              onClick={closeToast}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
              onClick={async () => {
                try {
                  await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/user/delete/${uid}`);
                  toast.success("Your account has been deleted successfully.");
                  localStorage.removeItem("uid");
                  localStorage.removeItem("token");
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
        className: "bg-[#1E1E1E] border border-[#333] rounded-2xl",
      }
    );
  };

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#121212] mt-16 pb-20 relative overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] px-4 py-3 flex items-center justify-between">
        <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white p-2 -ml-2 transition-colors">
          <FaArrowLeft size={16} />
        </button>
        <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center mr-6">
          {t('editProfileTitle') || "EDIT PROFILE"}
        </h2>
        <div></div> {/* Empty div for flex spacing */}
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="bg-[#1E1E1E] rounded-2xl p-5 sm:p-6 border border-[#2C2C2C] shadow-2xl relative"
        >
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Input Fields */}
            {[
              { key: "username", label: t('nameLabel') || "Full Name", icon: FaUser, type: "text" },
              { key: "mobileNo", label: t('mobileLabel') || "Mobile Number", icon: FaPhoneAlt, type: "tel" },
              { key: "companyName", label: t('companyNameLabel') || "Company Name", icon: FaBuilding, type: "text" },
            ].map(({ key, label, icon: Icon, type }) => (
              <div key={key}>
                <label htmlFor={key} className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">
                  {label}
                </label>
                <div className="relative">
                  <Icon className="absolute left-4 top-3.5 text-gray-500 text-sm" />
                  <input
                    type={type}
                    id={key}
                    name={key}
                    value={profileData[key] || ""}
                    onChange={handleInputChange}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none transition-colors text-sm placeholder-gray-600"
                  />
                </div>
              </div>
            ))}

            {/* QR Code Upload Section */}
            <div className="pt-2 border-t border-[#333]">
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1 flex items-center gap-2">
                <FaQrcode className="text-[var(--primary)]"/> {t('qrCodeLabel') || "Payment QR Code"}
              </label>
              
              <div className="relative w-full h-40 bg-[#121212] border-2 border-dashed border-[#333] hover:border-[var(--primary)]/50 rounded-xl transition-colors overflow-hidden group">
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
                      <div className="bg-black/80 px-3 py-1.5 rounded-lg flex items-center gap-2 text-white text-xs font-bold backdrop-blur-sm">
                        <FaPen size={10} /> Change QR
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 pointer-events-none">
                    <div className="w-12 h-12 bg-[#1E1E1E] rounded-full flex items-center justify-center mb-2 shadow-inner border border-[#333]">
                      <FaCloudUploadAlt size={22} className="text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold">Tap to upload QR</span>
                    <span className="text-[9px] mt-1 text-gray-600">JPG, PNG up to 2MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center transition-all ${
                  isLoading 
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
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
                Delete Account
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;