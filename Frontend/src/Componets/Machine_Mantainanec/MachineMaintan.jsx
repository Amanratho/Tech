import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FaChevronDown,
  FaChevronUp,
  FaTools,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationCircle,
  FaSearch,
} from "react-icons/fa";
import FinancialTracker from "./FinancialTracker";

const MachineCard = ({ machine, toggleShowDetails, showDetails, rentalData }) => {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");
  const totalPaidAmount = rentalData?.reduce((acc, rental) => acc + rental.paidAmount, 0) || 0;
  const totalPendingAmount = rentalData?.reduce((acc, rental) => acc + rental.pendingAmount, 0) || 0;

  const totalAmount = machine.calculatedTotalAmount || 0;
  const totalWork = machine.calculatedTotalWork || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden shadow-lg flex flex-col"
    >
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
            <div className="p-4 border-t border-[#2C2C2C] space-y-3">
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

              {/* Financial Tracker Component */}
              <FinancialTracker machineId={machine.Machine_id} uid={uid} />
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fetchRentalsByMachineId = async (machineId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/rentals-by-machine-id`, { machineId });
      setRentalData((prevData) => ({
        ...prevData,
        [machineId]: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (error) {
      console.error(`Error fetching rental data for ${machineId}:`, error.message);
      setRentalData((prevData) => ({ ...prevData, [machineId]: [] }));
    }
  };

  const fetchMachines = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const response = await axios.post(`${API_BASE_URL}/api/machines`, { uid });
      if (response.data && Array.isArray(response.data)) {
        setMachines(response.data);
        response.data.forEach(machine => fetchRentalsByMachineId(machine.Machine_id));
      } else {
        throw new Error("Unexpected data structure or no machine data found");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMachines(); }, []);

  const toggleShowDetails = (machineId) => {
    setShowDetails((prev) => ({ ...prev, [machineId]: !prev[machineId] }));
  };

  const processedMachines = useMemo(() => {
    let mapped = machines.map(machine => {
      const rData = rentalData[machine.Machine_id] || [];
      const calculatedTotalAmount = rData.reduce((acc, curr) => acc + curr.totalAmount, 0);
      const calculatedTotalWork = rData.reduce((acc, curr) => acc + curr.quantity, 0);
      return { ...machine, calculatedTotalAmount, calculatedTotalWork };
    });

    if (searchQuery) {
      mapped = mapped.filter(m =>
        m.Machine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(m.Machine_id).includes(searchQuery)
      );
    }

    if (filterType === "highest_income") mapped.sort((a, b) => b.calculatedTotalAmount - a.calculatedTotalAmount);
    else if (filterType === "lowest_income") mapped.sort((a, b) => a.calculatedTotalAmount - b.calculatedTotalAmount);
    else if (filterType === "most_active") mapped.sort((a, b) => b.calculatedTotalWork - a.calculatedTotalWork);

    return mapped;
  }, [machines, rentalData, searchQuery, filterType]);

  return (
    <div className="bg-[#121212] min-h-screen pb-20 relative overflow-hidden">
      {/* STICKY HEADER */}
      <div className="sticky top-0 mt-16 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] pb-2">
        <div className="px-4 py-3 flex justify-between items-center">
          <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            {t('machineStatusTitle')}
          </h2>
          <span className="text-[9px] bg-[#1E1E1E] text-[var(--primary)] px-2 py-0.5 rounded border border-[#333]">
            {processedMachines.length} {t('machinesCount')}
          </span>
        </div>

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

        <div className="px-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {[
            { label: t("filterAllLabel"), val: "all" },
            { label: t("filterTopEarner"), val: "highest_income" },
            { label: t("filterLowestEarner"), val: "lowest_income" },
            { label: t("filterMostActive"), val: "most_active" },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setFilterType(f.val)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${filterType === f.val
                  ? "bg-[var(--primary)] text-black border-[var(--primary)]"
                  : "bg-transparent text-gray-500 border-[#333]"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-4 mt-3 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500 mt-10 text-xs animate-pulse">
            {t('loadingMachines')}
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
            {t('noMachinesFound')}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineMaintenanceApp;