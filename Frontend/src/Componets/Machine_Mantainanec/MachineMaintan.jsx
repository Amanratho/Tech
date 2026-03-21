// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { useTranslation } from "react-i18next";

// const MachineCard = ({ machine, toggleShowDetails, showDetails, rentalData}) => {
//   const totalAmount = rentalData?.reduce((acc, rental) => acc + rental.totalAmount, 0) || 0;
//   const totalPaidAmount = rentalData?.reduce((acc, rental) => acc + rental.paidAmount, 0) || 0;
//   const totalPendingAmount = rentalData?.reduce((acc, rental) => acc + rental.pendingAmount, 0) || 0;
//   const totalWork = rentalData?.reduce((acc, rental) => acc + rental.quantity, 0) || 0;
//   const { t } = useTranslation();
//   return (
//     <motion.div
//       className="flex-shrink-0 bg-[#333333] text-[#F5F5F5] rounded-lg shadow-lg"
//       style={{ width: "14rem" }}
//       whileHover={{ scale: 1.05 }}
//       transition={{ duration: 0.3 }}
//     >
//       <img
//         className="h-36 w-full object-cover rounded-t-lg"
//         src={machine.image || "https://via.placeholder.com/150"}
//         alt={`${t('machineCardTitle')} ${machine.Machine_id}`}
//       />
//       <div className="p-4">
//         <h5 className="text-sm font-semibold text-[#FEC111] flex justify-center items-start">
//           {machine.Machine_name}
//         </h5>
//         <button
//           onClick={() => toggleShowDetails(machine.Machine_id)}
//           className="w-full bg-[#F8981D] text-[#4C4C4D] py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
//         >
//           {showDetails ? t('hideDetailsButton') : t('showDetailsButton')}
//         </button>
//         {showDetails && rentalData && rentalData.length > 0 ? (
//           <div className="mt-4 p-4 bg-gray-700 rounded-lg text-white text-sm">
//             <p><strong>{t('totalIncomeLabel')}</strong> ₹{totalAmount}</p>
//             <p><strong>{t('doneAmountLabel')}</strong> ₹{totalPaidAmount}</p>
//             <p><strong>{t('dueAmountLabel')}</strong> ₹{totalPendingAmount}</p>
//             <p><strong>{t('totalWorkLabel')} {rentalData[0]?.rentType} : {totalWork}</strong></p>
//           </div>
//         ) : (
//           showDetails && <p className="text-red-500">{t('noRentalDataMessage')}</p>
//         )}
//       </div>
//     </motion.div>

//   );
// };

// const MachineMaintenanceApp = () => {
//   const [machines, setMachines] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showDetails, setShowDetails] = useState({});
//   const [rentalData, setRentalData] = useState({});

//   const fetchMachines = async () => {
//     try {
//       const uid = localStorage.getItem("uid");
      
//       const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/machines`, { uid });
//       if (response.data && Array.isArray(response.data)) {
//         setMachines(response.data);
//       } else {
//         throw new Error("Unexpected data structure or no machine data found");
//       }
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchRentalsByMachineId = async (machineId) => {
//     try {
//       if (rentalData[machineId]) return;
  
//       const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rentals-by-machine-id`, { machineId });
  
//       // ✅ Ensure rentalData is always an array
//       setRentalData((prevData) => ({
//         ...prevData,
//         [machineId]: Array.isArray(response.data) ? response.data : [],
//       }));
  
//     } catch (error) {
//       console.error("Error fetching rental data:", error.message);
//       // ✅ If there's an error, still set an empty array to prevent crashes
//       setRentalData((prevData) => ({
//         ...prevData,
//         [machineId]: [],
//       }));
//     }
//   };
  

//   useEffect(() => {
//     fetchMachines();
//   }, []);

//   const toggleShowDetails = (machineId) => {
//     setShowDetails((prev) => ({ ...prev, [machineId]: !prev[machineId] }));
//     if (!rentalData[machineId]) {
//       fetchRentalsByMachineId(machineId);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-700 p-6 mt-12">
//       <h1 className="text-yellow-400 text-center text-3xl font-extrabold mb-6">
//         Machine Status 
//       </h1>
//       <div className="overflow-x-auto overflow-auto scrollbar-none">
//         <div className="flex space-x-4 px-1 py-4">
//           {isLoading ? (
//             <p className="text-white text-center">Loading machines...</p>
//           ) : error ? (
//             <p className="text-red-500 text-center">{error}</p>
//           ) : machines.length > 0 ? (
//               machines.map((machine) => (
//                 <MachineCard
//                   key={machine.Machine_id}
//                   machine={machine}
//                   toggleShowDetails={toggleShowDetails}
//                   showDetails={showDetails[machine.Machine_id] || false}
//                   rentalData={rentalData[machine.Machine_id] || []}
                 
//                 />
//               ))
//           ) : (
//             <p className="text-white text-center">No machines available.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MachineMaintenanceApp;


import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaTools, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaSearch // Added Search Icon
} from "react-icons/fa";

const MachineCard = ({ machine, toggleShowDetails, showDetails, rentalData }) => {
  const { t } = useTranslation();

  // Aggregate Data for Card details (Paid & Due)
  const totalPaidAmount = rentalData?.reduce((acc, rental) => acc + rental.paidAmount, 0) || 0;
  const totalPendingAmount = rentalData?.reduce((acc, rental) => acc + rental.pendingAmount, 0) || 0;
  
  // Note: totalAmount aur totalWork ab humne bahar parent component me bhi calculate kiya hai sorting ke liye.
  const totalAmount = machine.calculatedTotalAmount || 0;
  const totalWork = machine.calculatedTotalWork || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-lg flex flex-col"
    >
      {/* Image & Header Section */}
      <div 
        className="relative h-36 w-full cursor-pointer"
        onClick={() => toggleShowDetails(machine.Machine_id)}
      >
        <img
          className="h-full w-full object-cover opacity-80 transition-opacity hover:opacity-100"
          src={machine.image || "https://via.placeholder.com/400x200"}
          alt={`${t('machineCardTitle')} ${machine.Machine_name}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/40 to-transparent"></div>
        
        {/* Title & Quick Stats overlaying the image */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <div className="flex gap-2 items-center mb-1.5">
              <span className="text-[10px] text-[var(--primary)] font-bold tracking-wider bg-[#121212]/80 px-2 py-0.5 rounded border border-[#333] flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                <FaMoneyBillWave size={9} /> ₹{totalAmount.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-300 font-bold tracking-wider bg-[#121212]/80 px-2 py-0.5 rounded border border-[#333] flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                <FaTools size={9} /> {totalWork} <span className="text-[8px] font-normal text-gray-400 uppercase">{rentalData[0]?.rentType || "Units"}</span>
              </span>
            </div>
            
            <h3 className="text-white text-base font-bold drop-shadow-md">
              {machine.Machine_name}
            </h3>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-[#121212]/80 backdrop-blur-sm border border-[#333] flex items-center justify-center text-gray-400 shadow-md">
            {showDetails ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </div>
        </div>
      </div>

      {/* Expanded Details Section */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#1E1E1E]"
          >
            <div className="p-4 border-t border-[#2C2C2C]">
              {rentalData && rentalData.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#121212] p-3 rounded-lg border border-[#333]">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
                      <FaCheckCircle className="text-green-500" /> {t('doneAmountLabel') || "Received"}
                    </p>
                    <p className="text-green-500 text-sm font-bold">₹{totalPaidAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#121212] p-3 rounded-lg border border-[#333]">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
                      <FaExclamationCircle className="text-red-500" /> {t('dueAmountLabel') || "Pending Due"}
                    </p>
                    <p className="text-red-500 text-sm font-bold">₹{totalPendingAmount.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-[#121212] rounded-lg border border-[#333]">
                  <p className="text-red-400 text-xs">{t('noRentalDataMessage') || "No rental data available for this machine."}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MachineMaintenanceApp = () => {
  const { t } = useTranslation();
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [rentalData, setRentalData] = useState({});

  // NEW STATES FOR SEARCH & FILTERS
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'highest_income', 'lowest_income', 'most_active'

  const fetchRentalsByMachineId = async (machineId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rentals-by-machine-id`, { machineId });
      setRentalData((prevData) => ({
        ...prevData,
        [machineId]: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (error) {
      console.error(`Error fetching rental data for ${machineId}:`, error.message);
      setRentalData((prevData) => ({
        ...prevData,
        [machineId]: [],
      }));
    }
  };

  const fetchMachines = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/machines`, { uid });
      
      if (response.data && Array.isArray(response.data)) {
        setMachines(response.data);
        response.data.forEach(machine => {
          fetchRentalsByMachineId(machine.Machine_id);
        });
      } else {
        throw new Error("Unexpected data structure or no machine data found");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const toggleShowDetails = (machineId) => {
    setShowDetails((prev) => ({ ...prev, [machineId]: !prev[machineId] }));
  };

  // --- LOGIC: SEARCH AND FILTER MACHINES ---
  const processedMachines = useMemo(() => {
    // 1. Calculate Total Income & Work for sorting
    let mapped = machines.map(machine => {
      const rData = rentalData[machine.Machine_id] || [];
      const calculatedTotalAmount = rData.reduce((acc, curr) => acc + curr.totalAmount, 0);
      const calculatedTotalWork = rData.reduce((acc, curr) => acc + curr.quantity, 0);
      return { ...machine, calculatedTotalAmount, calculatedTotalWork };
    });

    // 2. Apply Search Filter
    if (searchQuery) {
      mapped = mapped.filter(m => 
        m.Machine_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        String(m.Machine_id).includes(searchQuery)
      );
    }

    // 3. Apply Sorting based on Filter Type
    if (filterType === "highest_income") {
      mapped.sort((a, b) => b.calculatedTotalAmount - a.calculatedTotalAmount);
    } else if (filterType === "lowest_income") {
      mapped.sort((a, b) => a.calculatedTotalAmount - b.calculatedTotalAmount);
    } else if (filterType === "most_active") {
      mapped.sort((a, b) => b.calculatedTotalWork - a.calculatedTotalWork);
    }

    return mapped;
  }, [machines, rentalData, searchQuery, filterType]);

  return (
    <div className="bg-[#121212] min-h-screen pb-20 relative overflow-hidden">
      
      {/* 1. STICKY HEADER WITH SEARCH & FILTERS */}
      <div className="sticky top-0 mt-16 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] pb-2">
        <div className="px-4 py-3 flex justify-between items-center">
          <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            {t('machineStatusTitle') || "MACHINE STATUS"}
          </h2>
          <span className="text-[9px] bg-[#1E1E1E] text-[var(--primary)] px-2 py-0.5 rounded border border-[#333]">
            {processedMachines.length} Machines
          </span>
        </div>

        {/* Search Bar (Same as Payment Tracking) */}
        <div className="px-4 mb-3">
            <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-gray-500 text-xs" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder') || "Search machine..."}
                    className="w-full bg-[#1E1E1E] text-white pl-9 pr-3 py-2 rounded-full text-xs outline-none border border-[#333] focus:border-[var(--primary)] transition-colors placeholder-gray-600"
                />
            </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {[
                { label: "All", val: "all" },
                { label: "Top Earner", val: "highest_income" },
                { label: "Lowest Earner", val: "lowest_income" },
                { label: "Most Active", val: "most_active" },
            ].map((f) => (
                <button
                    key={f.val}
                    onClick={() => setFilterType(f.val)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        filterType === f.val 
                        ? "bg-[var(--primary)] text-black border-[var(--primary)]" 
                        : "bg-transparent text-gray-500 border-[#333]"
                    }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="px-4 mt-3 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 mt-10 text-xs animate-pulse">
            Loading machines...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center">
            {error}
          </div>
        ) : processedMachines.length > 0 ? (
          processedMachines.map((machine) => (
            <MachineCard
              key={machine.Machine_id}
              machine={machine}
              toggleShowDetails={toggleShowDetails}
              showDetails={showDetails[machine.Machine_id] || false}
              rentalData={rentalData[machine.Machine_id] || []}
            />
          ))
        ) : (
          <div className="text-center text-gray-600 mt-10 text-xs">
            No machines found.
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineMaintenanceApp;