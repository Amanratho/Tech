// import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { FaUserCircle, FaPencilAlt, FaSignOutAlt, FaCog } from "react-icons/fa";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useTranslation } from "react-i18next";

// const Profile = () => {
//    const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // dispatch({ type: "LOGOUT" });
//     //             localStorage.removeItem("token");
//     //             localStorage.removeItem("uid");
//     //             closeToast();
//     //             window.location.href = "/login";

//     const fetchUserProfile = async () => {
//       const uid = localStorage.getItem("uid");
//       if (!uid) {
//         toast.error("User ID not found. Please log in again.");
//         window.location.href = "/login";
//         return;
//       }

//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`
//         );
//         setUser(response.data);
//       } catch (error) {
//         toast.error("Failed to fetch user profile");
//       }
//     };

//     fetchUserProfile();
//   }, []);

//   const handleLogout = () => {
//     toast(
//       ({ closeToast }) => (
//         <div className="flex flex-col gap-2">
//         <p className="text-gray-800 font-medium">{t("logoutConfirmation")}</p>
//         <div className="flex justify-end gap-4">
//           <button
//             className="bg-yellow-500 text-gray-800 px-4 py-1 rounded hover:bg-yellow-600"
//             onClick={() => {
//               dispatch({ type: "LOGOUT" });
//               localStorage.removeItem("token");
//               localStorage.removeItem("uid");
//               closeToast();
//               window.location.href = "/login";
//             }}
//           >
//             {t("logoutYes")}
//           </button>
//           <button
//             className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
//             onClick={closeToast}
//           >
//             {t("logoutNo")}
//           </button>
//         </div>
//       </div>
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
//     <div className="min-h-screen bg-[#4C4C4D] mt-16 text-[#F5F5F5]">
//     <div className="max-w-6xl mx-auto p-6">
//       {!user ? (
//         <p className="text-center text-[#F5F5F5]">{t('profileLoadingText')}</p>
//       ) : (
//         <>
//           <motion.div
//             className="flex flex-col md:flex-row justify-between items-center mb-10 p-8 bg-[#333333] rounded-xl shadow-lg"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 1 }}
//           >
//             <div className="flex flex-col items-center text-center space-y-4">
//               <motion.div
//                 whileHover={{ scale: 1.1 }}
//                 className="border-4 border-[#FEC111] rounded-full p-6 mb-4"
//               >
//                 <FaUserCircle className="text-6xl text-[#F5F5F5]" />
//               </motion.div>
  
//               <motion.h1
//                 className="text-3xl font-bold text-[#FEC111]"
//                 whileHover={{ scale: 1.1 }}
//               >
//                 {user.username}
//               </motion.h1>
//               <p className="text-lg text-[#F5F5F5]">{user.mobileNo}</p>
//               <p className="text-sm text-[#F5F5F5]">
//                 <b>{user.email}</b>
//               </p>
//               <p className="text-sm text-[#F5F5F5]">
//                 <b>{user.companyName}</b>
//               </p>
//             </div>
  
//             <div className="flex flex-col justify-center text-center mt-8 md:mt-0 space-y-6">
//               <div className="flex flex-col items-center bg-[#333333] py-2 px-8 rounded-lg shadow-md">
//                 {user.qrCodeUrl ? (
//                   <img
//                     src={user.qrCodeUrl}
//                     alt="QR Code Preview"
//                     className="w-32 h-32 object-cover rounded"
//                   />
//                 ) : (
//                   <p className="text-[#F5F5F5] text-sm">{t('qrCodePlaceholder')}</p>
//                 )}
//               </div>
//             </div>
//           </motion.div>
  
//           <motion.div
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 1.2 }}
//           >
//             <Link
//               to={"/Machinery-Update"}
//               className="bg-[#F8981D] text-[#4C4C4D] px-6 no-underline rounded-lg flex items-center justify-center gap-3"
//             >
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 className="bg-[#F8981D] text-[#4C4C4D] px-6 rounded-lg flex items-center justify-center gap-3"
//               >
//                 <FaPencilAlt className="text-xl" />
//                 {t('updateMachineryButton')}
//               </motion.button>
//             </Link>
  
//             <Link
//               to={"/EditProfile"}
//               className="bg-[#F8981D] text-[#4C4C4D] px-6 no-underline rounded-lg flex items-center justify-center gap-3"
//             >
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 className="bg-[#F8981D] text-[#4C4C4D] px-6 rounded-lg flex items-center justify-center gap-3 "
//               >
//                 <FaCog className="text-xl" />
//                 {t('editProfileButton')}
//               </motion.button>
//             </Link>
  
//             <motion.button
//               onClick={handleLogout}
//               className="bg-[#F8981D] text-[#4C4C4D] py-3 px-6 rounded-lg flex items-center justify-center gap-3 hover:bg-[#D9781A]"
//             >
//               <FaSignOutAlt className="text-xl" />
//               {t('logoutButton')}
//             </motion.button>
//           </motion.div>
  
//           <footer className="text-center text-[#F5F5F5] mb-6">
//             <p>&copy; Tech Diary {t('footerText')}</p>
//           </footer>
//         </>
//       )}
//     </div>
//   </div>
  
//   );
// };

// export default Profile;


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
  FaBuilding
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
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
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`
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
        <div className="flex flex-col gap-3">
          <p className="text-gray-200 font-semibold text-sm text-center">
            {t("logoutConfirmation") || "Are you sure you want to log out?"}
          </p>
          <div className="flex justify-center gap-3 mt-2">
            <button
              className="bg-[#2A2A2A] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#333] transition-colors"
              onClick={closeToast}
            >
              {t("logoutNo") || "Cancel"}
            </button>
            <button
              className="bg-red-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
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
      
      {/* 1. Integrated Header Section */}
      <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] px-4 py-4 mb-6">
        <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center">
          {t('profileTitle') || "MY PROFILE"}
        </h2>
      </div>

      <div className="max-w-md mx-auto px-4">
        {!user ? (
          <div className="flex flex-col items-center justify-center mt-20 space-y-4 animate-pulse">
            <div className="w-24 h-24 bg-[#1E1E1E] rounded-full border border-[#333]"></div>
            <div className="h-6 w-32 bg-[#1E1E1E] rounded-md border border-[#333]"></div>
            <div className="h-4 w-48 bg-[#1E1E1E] rounded-md border border-[#333]"></div>
          </div>
        ) : (
          <>
            {/* 2. Seamless User Card with Gradient & Depth */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-br from-[#1E1E1E] to-[#161616] rounded-2xl p-6 border border-[#2C2C2C] flex flex-col items-center shadow-2xl relative overflow-hidden"
            >
              {/* Complex Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-[70px] pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-[#121212] border-2 border-[var(--primary)] rounded-full flex items-center justify-center text-[var(--primary)] shadow-lg shadow-[var(--primary)]/10 mb-4">
                  <FaUserCircle size={60} />
                </div>
                
                {/* Safe wrapped username */}
                <h1 className="text-xl font-extrabold text-white tracking-tight text-center whitespace-normal break-words max-w-[280px]">
                  {user.username}
                </h1>
                
                <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-wider bg-[var(--primary)]/10 px-3 py-1 rounded-full mt-2.5 border border-[var(--primary)]/20">
                  Business Owner
                </p>
              </div>

              {/* Seamless Data Points Section */}
              <div className="w-full mt-7 pt-5 border-t divide-y divide-[#333] border-[#333]">
                <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors">
                  <FaPhoneAlt size={12} className="text-gray-500 w-4"/>
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Mobile</p>
                    <p className="text-sm text-white font-semibold">+91 {user.mobileNo}</p>
                  </div>
                </div>

                {/* Email with Explicit Truncation and maxWidth for overflow */}
                <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors">
                  <FaEnvelope size={12} className="text-gray-500 w-4"/>
                  <div className="overflow-hidden flex-1">
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Email</p>
                    <p className="text-sm text-white font-semibold truncate" title={user.email}>{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors">
                  <FaBuilding size={12} className="text-gray-500 w-4"/>
                  <div className="overflow-hidden flex-1">
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Company</p>
                    <p className="text-sm text-white font-semibold truncate" title={user.companyName}>{user.companyName}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 3. Streamlined Payment QR Bar */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="mt-5 bg-gradient-to-br from-[#1E1E1E] to-[#161616] rounded-2xl p-4 border border-[#2C2C2C] flex items-center shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mr-4">
                <FaQrcode size={18} />
              </div>
              
              <div className="flex-1 overflow-hidden">
                <h3 className="text-white font-bold text-sm mb-0.5">Payment QR</h3>
                <p className="text-[10px] text-gray-500 max-w-[150px] truncate">Customers scan to pay you.</p>
              </div>
              
              <div className="w-14 h-14 bg-white rounded-lg p-1 shadow-inner flex flex-shrink-0 items-center justify-center border border-[#333]">
                {user.qrCodeUrl ? (
                  <img src={user.qrCodeUrl} alt="QR Code" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center text-gray-400">
                     <FaQrcode size={16} className="mx-auto"/>
                     <span className="text-[8px] font-bold">NO QR</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 4. Dashboard-style Actions Menu */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="mt-6 bg-[#1E1E1E] rounded-2xl border border-[#2C2C2C] overflow-hidden shadow-lg divide-y divide-[#2C2C2C]"
            >
              <Link to="/EditProfile" className="flex items-center justify-between p-4.5 hover:bg-[#252525] active:bg-[#333] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                    <FaCog size={14} />
                  </div>
                  <span className="text-sm font-bold text-white">{t('editProfileButton') || "Edit Profile"}</span>
                </div>
                <FaChevronRight size={12} className="text-gray-600" />
              </Link>

              <Link to="/Machinery-Update" className="flex items-center justify-between p-4.5 hover:bg-[#252525] active:bg-[#333] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <FaPencilAlt size={14} />
                  </div>
                  <span className="text-sm font-bold text-white">{t('updateMachineryButton') || "Update Machinery"}</span>
                </div>
                <FaChevronRight size={12} className="text-gray-600" />
              </Link>
            </motion.div>

            {/* 5. Isolated Logout Area */}
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="mt-6 mb-10"
            >
              <button
                onClick={handleLogout}
                className="w-full py-4 bg-[#1E1E1E] border border-red-500/20 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/10 active:scale-[0.98] transition-all"
              >
                <FaSignOutAlt size={16} />
                {t('logoutButton') || "Log Out"}
              </button>
            </motion.div>

            {/* Compact Footer */}
            <div className="text-center pb-8 border-t border-[#333] pt-5">
              <p className="text-[10px] text-gray-600 font-semibold tracking-widest uppercase">Powered By RentVeda</p>
              <p className="text-[9px] text-gray-700 mt-1">&copy; Tech Diary {t('footerText')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;