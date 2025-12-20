// import React, { useState, useEffect } from "react";
// import { useGetMachinesQuery } from "../../redux/functional/machineApiSlice";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./Machinary.css";
// import { useTranslation } from "react-i18next";

// function Machinery() {
//   const { t } = useTranslation();

//   const navigate = useNavigate();

//   const uid = localStorage.getItem("uid");


//   const {
//     data: machines = [],
//     error,
//     isLoading,
//     refetch,
//   } = useGetMachinesQuery(uid, {
//     skip: !uid,
//     keepUnusedDataFor: 1000,
//   });

//   const handleButtonClick = (machine) => {
//     navigate("/start-entry", {
//       state: {
//         rentType: machine.RentType,
//         machineId: machine.Machine_id,
//         machineName: machine.Machine_name,
//       },
//     });
//   };

//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Error fetching machine data</p>;

//   return (
//     <div className="bg-[#4C4C4D] px-3 py-2">
//       <h2
//         className="text-center text-[#FEC111] 
//           text-lg sm:text-xl md:text-3xl 
//           font-extrabold mb-6"
//       >
//         {t("exploreMachines")}
//       </h2>

//       <div className="overflow-x-auto overflow-auto scrollbar-none">
//         <div className="flex space-x-4 px-1 py-4">
//           {(machines.length > 0
//             ? machines
//             : [
//                 {
//                   _id: "dummy",
//                   Machine_name: t("addYourMachine"),
//                   image: "/placeholder.jpg",
//                 },
//               ]
//           ).map((item) => (
//             <motion.div
//               key={item._id}
//               className="flex-shrink-0 bg-[#333333] text-[#F5F5F5] rounded-lg shadow-lg"
//               style={{ width: "14rem" }}
//               whileHover={{ scale: 1.05 }}
//               transition={{ duration: 0.3 }}
//             >
//               <img
//                 className="h-36 w-full object-cover rounded-t-lg"
//                 src={item.image}
//                 alt={`Machine ${item._id}`}
//               />
//               <div className="p-4">
//                 <h5 className="text-sm font-semibold text-[#FEC111] flex justify-center items-start">
//                   {item.Machine_name}
//                 </h5>
//                 {item._id === "dummy" ? (
//                   <button
//                     onClick={() => (window.location.href = "/add-machinery")}
//                     className="w-full bg-[#F8981D] text-[#4C4C4D] py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
//                   >
//                     {t("addMachine")}
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => handleButtonClick(item)}
//                     className="w-full bg-[#F8981D] text-[#4C4C4D] py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
//                   >
//                     {t("newEntry")}
//                   </button>
//                 )}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Machinery;

import React from "react";
import { useGetMachinesQuery } from "../../redux/functional/machineApiSlice";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaPlus, FaPlay, FaTractor } from "react-icons/fa";

function Machinery() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const uid = localStorage.getItem("uid");

  const {
    data: machines = [],
    error,
    isLoading,
  } = useGetMachinesQuery(uid, {
    skip: !uid,
    keepUnusedDataFor: 1000,
  });

  const handleButtonClick = (machine) => {
    navigate("/start-entry", {
      state: {
        rentType: machine.RentType,
        machineId: machine.Machine_id,
        machineName: machine.Machine_name,
      },
    });
  };

  // 1. SKELETON LOADING (App-like feel instead of "Loading..." text)
  if (isLoading) {
    return (
      <div className="bg-[#121212] py-4 px-5">
        <div className="h-4 w-24 bg-[#1E1E1E] rounded animate-pulse mb-3"></div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
             <div key={i} className="min-w-[10rem] h-40 bg-[#1E1E1E] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return null; // Hide section if error, don't break UI

  return (
    <div className="bg-[#121212] py-2 border-t border-[#1E1E1E]">
      
      {/* 2. SECTION HEADER (Matches Feature Component) */}
      <div className="px-5 mb-3 flex justify-between items-end">
        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest">
          {t("exploreMachines") || "MY MACHINES"}
        </h2>
        <span className="text-[10px] text-[var(--primary)] font-medium">
            {machines.length} Active
        </span>
      </div>

      {/* 3. HORIZONTAL SCROLL AREA */}
      <div className="overflow-x-auto no-scrollbar px-5 pb-4 flex gap-3 snap-x">
        
        {/* ADD MACHINE CARD (Always First if you want, or handle via array) */}
        {/* If no machines, show this big. If machines exist, show this as the first option */}
        {/* <motion.div 
            onClick={() => navigate("/add-machinery")}
            className="min-w-[9rem] w-36 h-44 flex-shrink-0 bg-[#121212] border-2 border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform snap-start"
            whileTap={{ scale: 0.95 }}
        >
            <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center text-[var(--primary)]">
                <FaPlus />
            </div>
            <span className="text-xs text-gray-400 font-medium text-center px-2">
                {t("addMachine") || "Add New"}
            </span>
        </motion.div> */}

        {/* MACHINE LIST */}
        {machines.map((item) => (
          <motion.div
            key={item._id}
            className="min-w-[10rem] w-40 flex-shrink-0 bg-[#1E1E1E] rounded-xl overflow-hidden shadow-lg border border-[#2C2C2C] snap-start relative group"
            whileTap={{ scale: 0.98 }}
          >
            {/* Image Section */}
            <div className="h-24 w-full bg-[#121212] relative">
                {item.image ? (
                    <img
                        className="h-full w-full object-cover"
                        src={item.image}
                        alt={item.Machine_name}
                    />
                ) : (
                    // Fallback icon if no image
                    <div className="h-full w-full flex items-center justify-center text-gray-600">
                        <FaTractor size={30} />
                    </div>
                )}
                {/* Status Dot */}
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>

            {/* Info Section */}
            <div className="p-3">
              <h5 className="text-sm font-bold text-white truncate mb-1">
                {item.Machine_name}
              </h5>
              <p className="text-[10px] text-gray-500 mb-3 truncate">
                 {item.RentType || "Hourly Rate"}
              </p>

              {/* Action Button */}
              <button
                onClick={() => handleButtonClick(item)}
                className="w-full h-8 rounded-lg bg-[var(--primary)] text-black text-xs font-bold flex items-center justify-center gap-1.5 active:bg-yellow-600 transition-colors"
              >
                <FaPlay size={10} /> {t("newEntry")}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Machinery; 