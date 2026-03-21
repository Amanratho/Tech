// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "../Machinery/Machinary.css";
// import { useTranslation } from "react-i18next";


// const MachineryUpdate = () => {
//   const { t } = useTranslation(); 
//   const [machines, setMachines] = useState([]);
//   const navigate = useNavigate();
//   const [machineryName, setMachineryName] = useState("");
//   const [rentType, setRentType] = useState("");
//   const [machineryImg, setMachineryImg] = useState("");

//   useEffect(() => {
//     const fetchMachines = async () => {
//       try {
//         const uid = localStorage.getItem("uid");
//         const response = await axios.post(
//           `${import.meta.env.VITE_BACKEND_URL}/api/machines`,
//           { uid }
//         );
//         console.log("client data :", response);

//         setMachines(response.data);
//       } catch (error) {
//         console.log("Error fetching machine data:", error);
        
//       }
//     };

//     fetchMachines();
//   }, []);

//   const handleEditClick = (item) => {
   
//     navigate(`/Machinery-Update/edit-machine/${item.Machine_id}`);
//   };

//   const handleDeleteClick = (Machine_id) => {
//     toast(
//       ({ closeToast }) => (
//         <div className="flex flex-col gap-2">
//   <p className="text-gray-800 font-medium">
//     {t('deleteConfirmation')}
//   </p>
//   <div className="flex justify-end gap-4">
//     <button
//       className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
//       onClick={() => {
//         toast.info(t('cancelToastMessage'));
//         closeToast();
//       }}
//     >
//       {t('cancelButton')}
//     </button>
//     <button
//       className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
//       onClick={async () => {
//         try {
//           const response = await axios.delete(
//             `${import.meta.env.VITE_BACKEND_URL}/api/machine/machines/${Machine_id}`
//           );
//           if (response.status === 200) {
//             setMachines((machines) =>
//               machines.filter(
//                 (machine) => machine.Machine_id !== Machine_id
//               )
//             );
//             toast.success(t('deleteSuccessToast'));
//           }
//         } catch (error) {
//           console.log("Error deleting machine:", error);
//           toast.error(t('deleteErrorToast'));
//         }
//         closeToast();
//       }}
//     >
//       {t('deleteButton')}
//     </button>
//   </div>
// </div>

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
//     <div className="bg-[#4C4C4D] py-12 px-1 mt-10">
//   <h2
//     className="text-center text-[#FEC111] 
//       text-lg sm:text-xl md:text-3xl 
//       font-extrabold mb-6"
//   >
//     {t('deleteUpdateMachinesTitle')}
//   </h2>

//   <div className="overflow-x-auto overflow-auto scrollbar-none">
//     <div className="flex space-x-4 py-4">
//       {machines.map((item) => (
//         <motion.div
//           key={item.Machine_id}
//           className="flex-shrink-0 bg-[#333333] text-[#F5F5F5] rounded-lg shadow-lg"
//           style={{ width: "14rem" }}
//           whileHover={{ scale: 1.05 }}
//           transition={{ duration: 0.3 }}
//         >
//           <img
//             className="h-36 w-full object-cover rounded-t-lg"
//             src={item.image}
//             alt={`Machine ${item.Machine_id}`}
//           />
//           <div className="p-4">
//             <h5 className="text-sm font-semibold text-[#FEC111] flex justify-center items-start">
//               {item.Machine_name}
//             </h5>
//             <div className="flex justify-between">
//               <button
//                 onClick={() => handleEditClick(item)}
//                 className="w-1/2 bg-[#F8981D] text-black py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
//               >
//                 {t('editButton')}
//               </button>
//               <button
//                 onClick={() => handleDeleteClick(item.Machine_id)}
//                 className="w-1/3 bg-red-600 text-black py-1 rounded-md font-semibold hover:bg-red-700 transition-all"
//               >
//                 {t('deleteButton')}
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   </div>
// </div>

//   );
// };

// export default MachineryUpdate;


import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { FaPen, FaTrashAlt, FaArrowLeft } from "react-icons/fa";

const MachineryUpdate = () => {
  const { t } = useTranslation();
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setIsLoading(true);
        const uid = localStorage.getItem("uid");
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/machines`,
          { uid }
        );
        setMachines(response.data);
      } catch (error) {
        console.error("Error fetching machine data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachines();
  }, []);

  const handleEditClick = (item) => {
    navigate(`/Machinery-Update/edit-machine/${item.Machine_id}`);
  };

  const handleDeleteClick = (Machine_id) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <p className="text-gray-200 font-semibold text-sm text-center">
            {t('deleteConfirmation') || "Are you sure you want to delete this machine?"}
          </p>
          <div className="flex justify-center gap-3 mt-2">
            <button
              className="bg-[#2A2A2A] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#333] transition-colors"
              onClick={() => {
                toast.info(t('cancelToastMessage') || "Deletion cancelled", { theme: "dark" });
                closeToast();
              }}
            >
              {t('cancelButton') || "Cancel"}
            </button>
            <button
              className="bg-red-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
              onClick={async () => {
                try {
                  const response = await axios.delete(
                    `${import.meta.env.VITE_BACKEND_URL}/api/machine/machines/${Machine_id}`
                  );
                  if (response.status === 200) {
                    setMachines((prev) => prev.filter((m) => m.Machine_id !== Machine_id));
                    toast.success(t('deleteSuccessToast') || "Machine deleted successfully", { theme: "dark" });
                  }
                } catch (error) {
                  console.error("Error deleting machine:", error);
                  toast.error(t('deleteErrorToast') || "Failed to delete machine", { theme: "dark" });
                }
                closeToast();
              }}
            >
              {t('deleteButton') || "Delete"}
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

  return (
    <div className="bg-[#121212] min-h-screen pb-20 relative overflow-hidden font-sans">
      
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] mt-16 px-4 py-3 flex items-center justify-between">
        <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white p-2 -ml-2 transition-colors">
          <FaArrowLeft size={14} />
        </button>
        <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center mr-6">
          {t('deleteUpdateMachinesTitle') || "MANAGE MACHINERY"}
        </h2>
        <div></div> {/* Flex spacer */}
      </div>

      <div className="px-4 mt-4 max-w-md mx-auto space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-40 bg-[#1E1E1E] rounded-xl animate-pulse border border-[#2C2C2C]"></div>
            ))}
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-xs">
            No machines found. Register a new machine first.
          </div>
        ) : (
          <AnimatePresence>
            {machines.map((item, index) => (
              <motion.div
                key={item.Machine_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-lg relative group"
              >
                {/* Image Section */}
                <div className="relative h-40 w-full">
                  <img
                    className="h-full w-full object-cover opacity-80"
                    src={item.image || "https://via.placeholder.com/400x200"}
                    alt={item.Machine_name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
                  
                  {/* Top Left Badge: ID */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] text-[var(--primary)] font-bold uppercase tracking-wider bg-[#121212]/80 px-2 py-0.5 rounded border border-[#333] backdrop-blur-sm shadow-md">
                      ID: {item.Machine_id}
                    </span>
                  </div>

                  {/* Bottom Info Title */}
                  <div className="absolute bottom-3 left-3 right-20">
                    <h3 className="text-white text-lg font-bold drop-shadow-md truncate">
                      {item.Machine_name}
                    </h3>
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="w-9 h-9 rounded-full bg-[#121212]/80 backdrop-blur-sm border border-[var(--primary)] text-[var(--primary)] flex items-center justify-center shadow-lg active:bg-[var(--primary)] active:text-black transition-all"
                    >
                      <FaPen size={12} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClick(item.Machine_id)}
                      className="w-9 h-9 rounded-full bg-red-500/10 backdrop-blur-sm border border-red-500/50 text-red-500 flex items-center justify-center shadow-lg hover:bg-red-500/20 active:bg-red-500 active:text-white transition-all"
                    >
                      <FaTrashAlt size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MachineryUpdate;