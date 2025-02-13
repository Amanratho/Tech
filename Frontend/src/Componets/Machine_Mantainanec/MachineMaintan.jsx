import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const MachineCard = ({ machine, toggleShowDetails, showDetails, rentalData}) => {
  const totalAmount = rentalData?.reduce((acc, rental) => acc + rental.totalAmount, 0) || 0;
  const totalPaidAmount = rentalData?.reduce((acc, rental) => acc + rental.paidAmount, 0) || 0;
  const totalPendingAmount = rentalData?.reduce((acc, rental) => acc + rental.pendingAmount, 0) || 0;
  const totalWork = rentalData?.reduce((acc, rental) => acc + rental.quantity, 0) || 0;

  return (
    <motion.div
      className="flex-shrink-0 bg-[#333333] text-[#F5F5F5] rounded-lg shadow-lg"
      style={{ width: "14rem" }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <img
        className="h-36 w-full object-cover rounded-t-lg"
        src={machine.image || "https://via.placeholder.com/150"}
        alt={`Machine ${machine.Machine_id}`}
      />
      <div className="p-4">
        <h5 className="text-sm font-semibold text-[#FEC111] flex justify-center items-start">
          {machine.Machine_name}
        </h5>
        <button
          onClick={() => toggleShowDetails(machine.Machine_id)}
          className="w-full bg-[#F8981D] text-[#4C4C4D] py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
        {showDetails && rentalData && rentalData.length > 0 ? (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg text-white text-sm">
            <p><strong>Total income :</strong> ₹{totalAmount}</p>
            <p><strong>Done Amount:</strong> ₹{totalPaidAmount}</p>
            <p><strong>Due Amount:</strong> ₹{totalPendingAmount}</p>
            <p><strong>Total {rentalData[0]?.rentType} : {totalWork}</strong></p>

           

          </div>
        ) : (
          showDetails && <p className="text-red-500">No rental data available</p>
        )}
      </div>
    </motion.div>
  );
};

const MachineMaintenanceApp = () => {
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [rentalData, setRentalData] = useState({});

  const fetchMachines = async () => {
    try {
      const uid = localStorage.getItem("uid");
      
      const response = await axios.post("http://localhost:3000/api/machines", { uid });
      if (response.data && Array.isArray(response.data)) {
        setMachines(response.data);
      } else {
        throw new Error("Unexpected data structure or no machine data found");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRentalsByMachineId = async (machineId) => {
    try {
      if (rentalData[machineId]) return;
  
      const response = await axios.post("http://localhost:3000/api/rentals-by-machine-id", { machineId });
  
      // ✅ Ensure rentalData is always an array
      setRentalData((prevData) => ({
        ...prevData,
        [machineId]: Array.isArray(response.data) ? response.data : [],
      }));
  
    } catch (error) {
      console.error("Error fetching rental data:", error.message);
      // ✅ If there's an error, still set an empty array to prevent crashes
      setRentalData((prevData) => ({
        ...prevData,
        [machineId]: [],
      }));
    }
  };
  

  useEffect(() => {
    fetchMachines();
  }, []);

  const toggleShowDetails = (machineId) => {
    setShowDetails((prev) => ({ ...prev, [machineId]: !prev[machineId] }));
    if (!rentalData[machineId]) {
      fetchRentalsByMachineId(machineId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-700 p-6 mt-12">
      <h1 className="text-yellow-400 text-center text-3xl font-extrabold mb-6">
        Machine Status 
      </h1>
      <div className="overflow-x-auto overflow-auto scrollbar-none">
        <div className="flex space-x-4 px-1 py-4">
          {isLoading ? (
            <p className="text-white text-center">Loading machines...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : machines.length > 0 ? (
              machines.map((machine) => (
                <MachineCard
                  key={machine.Machine_id}
                  machine={machine}
                  toggleShowDetails={toggleShowDetails}
                  showDetails={showDetails[machine.Machine_id] || false}
                  rentalData={rentalData[machine.Machine_id] || []}
                 
                />
              ))
          ) : (
            <p className="text-white text-center">No machines available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineMaintenanceApp;
