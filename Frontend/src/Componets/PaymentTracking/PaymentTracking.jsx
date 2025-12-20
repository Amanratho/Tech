// import React, { useState } from "react";
// import { useGetPaymentsQuery, useUpdatePaymentMutation } from "../../redux/functional/paymentApiSlice";
// import { toast } from "react-toastify";
// import { useTranslation } from "react-i18next";
// import { format } from "date-fns";

// const PaymentTracking = () => {
//   const { t } = useTranslation();
//   const uid = localStorage.getItem("uid");

  
//   const { data: paymentData = [], error, isLoading, refetch } = useGetPaymentsQuery(uid, { skip: !uid });
//   const [updatePayment] = useUpdatePaymentMutation();

//   const [selectedUserEntries, setSelectedUserEntries] = useState([]);
//   const [uniqueUsers, setUniqueUsers] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedEntry, setSelectedEntry] = useState(null);
//   const [paymentAmount, setPaymentAmount] = useState(0);
//   const [isSummaryVisible, setIsSummaryVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState(""); 
//   const [filterType, setFilterType] = useState("pending");

  
//   React.useEffect(() => {
//     if (paymentData.length > 0) {
//       const users = paymentData.reduce((acc, data) => {
//         const existingUser = acc.find(user => user.mobileNumber === data.mobileNumber);
//         if (existingUser) {
//           existingUser.paidAmount += Number(data.paidAmount);
//           existingUser.pendingAmount += Number(data.pendingAmount);
//           existingUser.totalAmount += Number(data.totalAmount);
//         } else {
//           acc.push({ ...data });
//         }
//         return acc;
//       }, []);

//       setUniqueUsers(users);
//     }
//   }, [paymentData]);

//   const handleViewSummary = (mobileNumber) => {
//     const userEntries = paymentData.filter(data => String(data.mobileNumber) === String(mobileNumber));
//     setSelectedUserEntries(userEntries);
//     setIsSummaryVisible(true);
//   };

//   const handleHideSummary = () => {
//     setIsSummaryVisible(false);
//   };

//   const handleMarkPaid = (entry) => {
//     setSelectedEntry(entry);
//     setPaymentAmount(entry.pendingAmount);
//     setIsModalOpen(true);
//   };

//   const handlePaymentSubmit = async () => {
//     const numericPaymentAmount = Number(paymentAmount);

//     if (numericPaymentAmount > 0) {
//       if (numericPaymentAmount > selectedEntry.pendingAmount) {
//         toast.warn("Payment amount cannot exceed the pending amount.");
//         return;
//       }

//       const newPendingAmount = Math.max(selectedEntry.pendingAmount - numericPaymentAmount, 0);
//       const newPaidAmount = selectedEntry.paidAmount + numericPaymentAmount;

//       try {
//         await updatePayment({
//           _id: selectedEntry._id,
//           pendingAmount: newPendingAmount,
//           paidAmount: newPaidAmount,
//         }).unwrap();

//         toast.success("Payment updated successfully!");
//         setIsModalOpen(false);
//         refetch(); 
//       } catch (error) {
//         console.error("Error updating payment:", error);
//         toast.error("Error updating payment.");
//       }
//     } else {
//       toast.error("Please enter a valid amount.");
//     }
//   };

 
//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Error fetching payment data.</p>;

  
//   const filteredUsers = uniqueUsers.filter(
//     (user) =>
//       (user.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         user.mobileNumber.toString().includes(searchQuery)) &&
//       (filterType === "all" ||
//         (filterType === "pending" && user.pendingAmount > 0) ||
//         (filterType === "paid" && user.pendingAmount === 0))
//   );



//   return (
//     <div className="bg-gray-900 min-h-screen flex flex-col items-center py-4 mt-12 px-2">
//       <h2 className="text-yellow-400 text-xl font-bold text-center py-2 px-4 rounded-lg mb-6">
//       {t('paymentTrackingTitle')}
//       </h2>

      
//       <div className="mb-4 w-full flex flex-wrap items-center gap-3 max-w-6xl">
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder={t('searchPlaceholder')}
//           className="w-1/2 p-2 border rounded-lg text-sm focus:ring-yellow-400 focus:border-yellow-400"
//         />
//         <div className="">
//           <select
//             value={filterType}
//             onChange={(e) => setFilterType(e.target.value)}
//             className="p-2 border rounded-lg text-sm focus:ring-yellow-400 focus:border-yellow-400"
//           >
//             <option value="all"> {t('filterAll')}</option>
//             <option value="pending"> {t('filterPending')}</option>
//             <option value="paid"> {t('filterPaid')}</option>
//           </select>
//         </div>
//       </div>

    
//       <div
//         className={`w-full max-w-6xl bg-white shadow-md rounded-lg mb-2 p-2 overflow-x-auto ${
//           isSummaryVisible ? "blur-sm" : ""
//         }`}
//       >
//         <table className="w-full table-auto">
//           <thead className="bg-gray-800 text-white">
//             <tr>
//               <th className="text-center font-bold">{t('customerNamept')}</th>
//               <th className="text-center font-bold">{t('contactNumber')}</th>
//               <th className="text-center font-bold">{t('pendingAmountpt')}</th>
//               <th className="text-center font-bold">{t('paidAmountpt')}</th>
//               <th className="text-center font-bold">{t('totalAmount')}</th>
//               <th className="text-center font-bold">{t('actions')}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredUsers.map((user, index) => (
//               <tr
//                 key={index}
//                 className={`border-b ${
//                   index % 2 === 0 ? "bg-gray-100" : "bg-white"
//                 }`}
//               >
//                 <td className="text-center py-2 text-sm">
//                   {user.customerName}
//                 </td>
//                 <td className="text-center text-sm">
//                   <a
//                     href={`tel:${user.mobileNumber}`}
//                     className="no-underline text-black"
//                   >
//                     {user.mobileNumber}
//                   </a>
//                 </td>
//                 <td className="text-center text-sm text-red-500">
//                   ₹ {user.pendingAmount}
//                 </td>
//                 <td className="text-center text-sm text-green-500">
//                   ₹ {user.paidAmount}
//                 </td>
//                 <td className="text-center text-sm">₹ {user.totalAmount}</td>
//                 <td className="text-center text-sm">
//                   <button
//                     onClick={() => handleViewSummary(user.mobileNumber)}
//                     className="bg-green-500 text-white font-semibold px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-600"
//                   >
//                    {t('viewDetailsButton')}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

      
//       {isSummaryVisible && (
//         <div className="fixed inset-0 flex justify-center items-center z-50">
//           <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6 overflow-hidden">
//             <button
//               onClick={handleHideSummary}
//               className="bg-red-500 text-white px-4 py-1 rounded mb-4"
//             >
//               {t('hideSummaryButton')}
//             </button>
//             <div className="max-h-96 overflow-y-auto">
//               <table className="w-full table-auto">
//                 <thead className="bg-yellow-400 text-gray-800">
//                   <tr>
//                     <th className="text-center font-bold">{t('no')}</th>
//                     <th className="text-center font-bold">{t('customerName')}</th>
//                     <th className="text-center font-bold">{t('date')}</th>
//                     <th className="text-center font-bold">{t('pendingAmount')}</th>
//                     <th className="text-center font-bold">{t('paidAmount')}</th>
//                     <th className="text-center font-bold">{t('totalAmount')}</th>
//                     <th className="text-center font-bold">{t('actions')}</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedUserEntries.length > 0 ? (
//                     selectedUserEntries.map((entry, index) => (
//                       <tr
//                         key={entry._id}
//                         className={`text-sm text-black hover:font-semibold hover:cursor-pointer transition duration-150 ${
//                           index % 2 === 0 ? "bg-gray-300" : "bg-white"
//                         }`}
//                       >
//                         <td className="text-center text-sm">{index + 1}</td>
//                         <td className="text-center text-sm">
//                           {entry.customerName}
//                         </td>
//                         <td className="text-center text-sm">
//                           <a
                            
//                             className="no-underline text-black"
//                           >
//                              {format(new Date(entry.createdAt), "dd-MM-yyyy")}
//                           </a>
//                         </td>
//                         <td className="text-center text-sm text-red-600">
//                           ₹ {entry.pendingAmount}
//                         </td>
//                         <td className="text-sm text-center text-green-600">
//                           ₹ {entry.paidAmount}
//                         </td>
//                         <td className="text-sm text-center">
//                           ₹ {entry.totalAmount}
//                         </td>
//                         <td className="py-1 text-sm text-center">
//                           <button
//                             onClick={() => handleMarkPaid(entry)}
//                             className={`px-3 py-1 rounded text-xs sm:text-sm ${
//                               entry.pendingAmount === 0
//                                 ? "bg-gray-400 text-white cursor-not-allowed"
//                                 : "bg-green-500 text-white hover:bg-green-600"
//                             }`}
//                             disabled={entry.pendingAmount === 0}
//                           >
//                            {entry.pendingAmount === 0 ? t('doneButton') : t('dueButton')}
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" className="py-3 px-4 text-center">
//                       {t('noPaymentData')}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

 
//       {isModalOpen && selectedEntry && (
//         <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-500 bg-opacity-50">
//           <div className="bg-white p-8 rounded-lg shadow-lg w-96">
//             <h3 className="text-lg font-bold mb-4">
//             {t('markPaymentTitle')} {selectedEntry.customerName}
//             </h3>
//             <input
//               type="number"
//               min={0}
//               value={paymentAmount}
//               onChange={(e) => setPaymentAmount(e.target.value)}
//               className="w-full p-2 border rounded mb-4"
//               placeholder= {t('enterPaymentAmount')}
//             />
//             <div className="flex justify-between">
//               <button
//                 onClick={handlePaymentSubmit}
//                 className="bg-green-500 text-white px-4 py-2 rounded"
//               >
//                  {t('submitButton')}
//               </button>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//               >
//                  {t('closeButton')}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentTracking;


import React, { useState } from "react";
import { useGetPaymentsQuery, useUpdatePaymentMutation } from "../../redux/functional/paymentApiSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, 
  FaUser, 
  FaPhoneAlt, 
  FaChevronRight, 
  FaArrowLeft, 
  FaMoneyBillWave,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";

const PaymentTracking = () => {
  const { t } = useTranslation();
  const uid = localStorage.getItem("uid");

  const { data: paymentData = [], error, isLoading, refetch } = useGetPaymentsQuery(uid, { skip: !uid });
  const [updatePayment] = useUpdatePaymentMutation();

  const [uniqueUsers, setUniqueUsers] = useState([]); 
  const [selectedUserEntries, setSelectedUserEntries] = useState([]); 
  
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null); 
  const [paymentAmount, setPaymentAmount] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState(""); 
  const [filterType, setFilterType] = useState("all");

  // --- LOGIC: AGGREGATE DATA ---
  React.useEffect(() => {
    if (paymentData.length > 0) {
      const users = paymentData.reduce((acc, data) => {
        const existingUser = acc.find(user => user.mobileNumber === data.mobileNumber);
        if (existingUser) {
          existingUser.paidAmount += Number(data.paidAmount);
          existingUser.pendingAmount += Number(data.pendingAmount);
          existingUser.totalAmount += Number(data.totalAmount);
        } else {
          acc.push({ 
              ...data, 
              paidAmount: Number(data.paidAmount),
              pendingAmount: Number(data.pendingAmount),
              totalAmount: Number(data.totalAmount)
          }); 
        }
        return acc;
      }, []);
      setUniqueUsers(users);
    }
  }, [paymentData]);

  // --- HANDLERS ---
  const handleViewSummary = (mobileNumber) => {
    const userEntries = paymentData.filter(data => String(data.mobileNumber) === String(mobileNumber));
    userEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setSelectedUserEntries(userEntries);
    setIsSummaryVisible(true);
  };

  const handleHideSummary = () => {
    setIsSummaryVisible(false);
    setSelectedUserEntries([]);
  };

  const handleMarkPaid = (entry) => {
    setSelectedEntry(entry);
    setPaymentAmount(entry.pendingAmount);
    setIsModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    const numericPaymentAmount = Number(paymentAmount);

    if (numericPaymentAmount > 0) {
      if (numericPaymentAmount > selectedEntry.pendingAmount) {
        toast.warn("Payment amount cannot exceed the pending amount.");
        return;
      }

      const newPendingAmount = Math.max(selectedEntry.pendingAmount - numericPaymentAmount, 0);
      const newPaidAmount = selectedEntry.paidAmount + numericPaymentAmount;

      try {
        await updatePayment({
          _id: selectedEntry._id,
          pendingAmount: newPendingAmount,
          paidAmount: newPaidAmount,
        }).unwrap();

        toast.success("Payment updated successfully!");
        setIsModalOpen(false);
        refetch(); 
        
        const updatedEntries = selectedUserEntries.map(entry => 
            entry._id === selectedEntry._id 
            ? { ...entry, pendingAmount: newPendingAmount, paidAmount: newPaidAmount }
            : entry
        );
        setSelectedUserEntries(updatedEntries);

      } catch (error) {
        console.error("Error updating payment:", error);
        toast.error("Error updating payment.");
      }
    } else {
      toast.error("Please enter a valid amount.");
    }
  };

  // --- FILTER LOGIC ---
  const filteredUsers = uniqueUsers.filter(
    (user) =>
      (user.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.mobileNumber.toString().includes(searchQuery)) &&
      (filterType === "all" ||
        (filterType === "pending" && user.pendingAmount > 0) ||
        (filterType === "paid" && user.pendingAmount <= 0))
  );

  const slideUp = {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } },
    exit: { y: "100%" }
  };

  if (isLoading) return <div className="p-5 text-white">Loading Khata...</div>;
  if (error) return <div className="p-5 text-red-500">Error loading data</div>;

  return (
    <div className="bg-[#121212] min-h-screen pb-20 relative overflow-hidden">
      
      {/* 1. MAIN SCREEN */}
      <div className="sticky top-0 mt-16 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] pb-2">
        <div className="px-4 py-3 flex justify-between items-center">
            <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                {t('paymentTrackingTitle') || "PAYMENT TRACKING"}
            </h2>
            <span className="text-[9px] bg-[#1E1E1E] text-[var(--primary)] px-2 py-0.5 rounded border border-[#333]">
                {filteredUsers.length} Clients
            </span>
        </div>

        <div className="px-4 mb-3">
            <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-gray-500 text-xs" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder') || "Search client..."}
                    className="w-full bg-[#1E1E1E] text-white pl-9 pr-3 py-2 rounded-full text-xs outline-none border border-[#333] focus:border-[var(--primary)] transition-colors placeholder-gray-600"
                />
            </div>
        </div>

        <div className="px-4 flex gap-2">
            {[
                { label: t("filterAll") || "All Clients", val: "all" },
                { label: t("filterPending") || "Pending Due", val: "pending" },
                { label: t("filterPaid") || "Fully Paid", val: "paid" },
            ].map((f) => (
                <button
                    key={f.val}
                    onClick={() => setFilterType(f.val)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
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

      <div className="px-3 mt-3 space-y-2">
        {filteredUsers.length === 0 ? (
             <div className="text-center text-gray-600 mt-10 text-xs">No clients found</div>
        ) : (
            filteredUsers.map((user, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleViewSummary(user.mobileNumber)}
                    className="bg-[#1E1E1E] p-3 rounded-xl border border-[#2C2C2C] active:bg-[#252525] flex justify-between items-center group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#333] flex items-center justify-center text-gray-400">
                            <FaUser />
                        </div>
                        <div>
                            <h3 className="text-white text-sm font-bold">{user.customerName}</h3>
                            <a 
                                href={`tel:${user.mobileNumber}`}
                                onClick={(e) => e.stopPropagation()} 
                                className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"
                            >
                                <FaPhoneAlt size={8} /> {user.mobileNumber}
                            </a>
                        </div>
                    </div>

                    {/* STATUS SECTION (Cleaned Up) */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            {user.pendingAmount > 0 ? (
                                <>
                                    <span className="block text-[9px] text-red-400 uppercase font-bold tracking-wider">Pending</span>
                                    <span className="block text-sm font-bold text-red-500">
                                        ₹{user.pendingAmount.toLocaleString()}
                                    </span>
                                </>
                            ) : (
                                // No "Status" label here, just the badge
                                <span className="block text-xs font-bold text-green-500  px-3 py-1">
                                  Paid
                                </span>
                            )}
                        </div>
                        <FaChevronRight className="text-gray-600 text-xs" />
                    </div>
                </motion.div>
            ))
        )}
      </div>

      {/* 2. SUMMARY VIEW */}
      <AnimatePresence>
        {isSummaryVisible && (
            <motion.div
                variants={slideUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-40 bg-[#121212] flex flex-col"
            >
                <div className="px-4 mt-16 py-3 border-b border-[#2C2C2C] flex items-center gap-3 bg-[#121212]">
                    <button onClick={handleHideSummary} className="p-2 -ml-2 text-white">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h2 className="text-white text-sm font-bold">
                            {selectedUserEntries[0]?.customerName || "Client"}
                        </h2>
                        <p className="text-[10px] text-gray-500">Transaction History</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {selectedUserEntries.map((entry) => (
                        <div key={entry._id} className="bg-[#1E1E1E] p-3 rounded-xl border border-[#2C2C2C]">
                            
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-400 text-[10px]">
                                    {format(new Date(entry.createdAt), "dd MMM yyyy")}
                                </span>
                                
                                {entry.pendingAmount <= 0 ? (
                                    <span className="flex items-center gap-1 text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                        <FaCheckCircle size={10}/> Paid
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                        <FaExclamationCircle size={10} /> Due
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <p className="text-[10px] text-gray-500">Total Bill</p>
                                    <p className="text-white text-sm font-bold">₹{entry.totalAmount}</p>
                                </div>
                                <div className="text-right">
                                    {entry.pendingAmount > 0 ? (
                                        <>
                                            <p className="text-[10px] text-gray-500">Pending Due</p>
                                            <p className="text-red-500 text-base font-bold">₹{entry.pendingAmount}</p>
                                        </>
                                    ) : (
                                        // Changed: No "Amount Paid" text needed if fully paid, simplifies view
                                        <span className="text-green-500 text-sm font-bold">Paid</span>
                                    )}
                                </div>
                            </div>

                            {entry.pendingAmount > 0 && (
                                <button
                                    onClick={() => handleMarkPaid(entry)}
                                    className="w-full py-2 bg-[var(--primary)] text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 active:bg-yellow-600"
                                >
                                    <FaMoneyBillWave /> {t('dueButton') || "Collect Payment"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 3. PAYMENT MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedEntry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1E1E1E] w-full max-w-xs rounded-2xl p-5 border border-[#333]"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white text-sm font-bold">Collect Payment</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500"><FaTimes /></button>
                    </div>

                    <p className="text-gray-400 text-xs mb-1">Pending Amount</p>
                    <p className="text-red-500 text-lg font-bold mb-4">₹{selectedEntry.pendingAmount}</p>

                    <label className="text-gray-400 text-xs mb-1 block">{t('enterPaymentAmount')}</label>
                    <div className="relative mb-6">
                        <span className="absolute left-3 top-2 text-gray-400">₹</span>
                        <input
                            type="number"
                            min={0}
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="w-full bg-[#121212] text-white border border-[#333] rounded-lg py-2 pl-7 pr-3 focus:border-[var(--primary)] outline-none"
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={handlePaymentSubmit}
                        className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
                    >
                        {t('submitButton') || "Confirm Payment"}
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PaymentTracking;