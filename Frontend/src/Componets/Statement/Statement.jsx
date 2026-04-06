// import React, { useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { FaFilePdf, FaCalendarAlt, FaFilter, FaDownload } from "react-icons/fa";
// import { useTranslation } from "react-i18next";

// const Statement = () => {
//   const { t } = useTranslation();
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [filterType, setFilterType] = useState("All"); // All, Paid, Pending
//   const [isGenerating, setIsGenerating] = useState(false);
//   const today = new Date().toISOString().split("T")[0];

//   const uid = localStorage.getItem("uid");

//   // const generatePDFStatement = async () => {
//   //   if (!startDate || !endDate) {
//   //     toast.error("Please select both Start and End dates.");
//   //     return;
//   //   }

//   //   setIsGenerating(true);
//   //   try {
//   //     // 1. Fetch Data (Yahan tumhara getAllRentals API call hoga)
//   //     const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rentals`, { uid });
//   //     const allRentals = response.data;

//   //     // 2. Filter Data based on Dates and Type
//   //     const start = new Date(startDate);
//   //     const end = new Date(endDate);
//   //     end.setHours(23, 59, 59, 999); // End of the day

//   //     const filteredData = allRentals.filter((item) => {
//   //       const itemDate = new Date(item.createdAt);
//   //       const isWithinDate = itemDate >= start && itemDate <= end;
        
//   //       let matchesType = true;
//   //       if (filterType === "Paid") matchesType = item.pendingAmount === 0;
//   //       if (filterType === "Pending") matchesType = item.pendingAmount > 0;

//   //       return isWithinDate && matchesType;
//   //     });

//   //     if (filteredData.length === 0) {
//   //       toast.warning("No records found for the selected dates.");
//   //       setIsGenerating(false);
//   //       return;
//   //     }

//   //     // 3. Initialize PDF
//   //     const doc = new jsPDF();
//   //     const pageWidth = doc.internal.pageSize.getWidth();

//   //     // --- HEADER ---
//   //     doc.setFontSize(22);
//   //     doc.setTextColor(254, 193, 17); // Primary Yellow
//   //     doc.text("RentVeda", 14, 20);
      
//   //     doc.setFontSize(12);
//   //     doc.setTextColor(100);
//   //     doc.text("Official Account Statement", 14, 28);
      
//   //     doc.setFontSize(10);
//   //     doc.setTextColor(50);
//   //     doc.text(`Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`, 14, 36);
//   //     doc.text(`Type: ${filterType} Bills`, 14, 42);

//   //     // --- TABLE PREPARATION ---
//   //     const tableColumns = ["Date", "Machine", "Customer", "Total Bill", "Paid", "Pending"];
//   //     const tableRows = [];
//   //     let totalBillSum = 0;
//   //     let totalPaidSum = 0;
//   //     let totalPendingSum = 0;

//   //     filteredData.forEach((item) => {
//   //       totalBillSum += item.totalAmount || 0;
//   //       totalPaidSum += item.paidAmount || 0;
//   //       totalPendingSum += item.pendingAmount || 0;

//   //       const rowData = [
//   //         new Date(item.createdAt).toLocaleDateString(),
//   //         item.machineId || "N/A", // Change this to item.machineName if available
//   //         item.customerName || "N/A",
//   //         `Rs. ${item.totalAmount || 0}`,
//   //         `Rs. ${item.paidAmount || 0}`,
//   //         `Rs. ${item.pendingAmount || 0}`
//   //       ];
//   //       tableRows.push(rowData);
//   //     });

//   //     // --- DRAW TABLE ---
//   //     doc.autoTable({
//   //       startY: 50,
//   //       head: [tableColumns],
//   //       body: tableRows,
//   //       theme: 'grid',
//   //       headStyles: { fillColor: [30, 30, 30], textColor: [254, 193, 17] }, // Dark header with yellow text
//   //       styles: { fontSize: 9, cellPadding: 3 },
//   //       alternateRowStyles: { fillColor: [245, 245, 245] },
//   //     });

//   //     // --- FOOTER (TOTALS) ---
//   //     const finalY = doc.lastAutoTable.finalY || 50;
//   //     doc.setFontSize(11);
//   //     doc.setTextColor(20);
//   //     doc.text("Summary:", 14, finalY + 10);
      
//   //     doc.setFontSize(10);
//   //     doc.text(`Total Billing: Rs. ${totalBillSum}`, 14, finalY + 18);
//   //     doc.text(`Total Received: Rs. ${totalPaidSum}`, 14, finalY + 24);
//   //     doc.setTextColor(220, 38, 38); // Red color for pending
//   //     doc.text(`Total Pending: Rs. ${totalPendingSum}`, 14, finalY + 30);

//   //     doc.setFontSize(8);
//   //     doc.setTextColor(150);
//   //     doc.text("Generated securely via RentVeda App", pageWidth / 2, 280, { align: "center" });

//   //     // 4. Save and Download PDF
//   //     doc.save(`RentVeda_Statement_${start.toLocaleDateString()}.pdf`);
//   //     toast.success("Statement Downloaded Successfully!");

//   //   } catch (error) {
//   //     console.error("Error generating PDF:", error);
//   //     toast.error("Failed to generate statement.");
//   //   } finally {
//   //     setIsGenerating(false);
//   //   }
//   // };

// const generatePDFStatement = async () => {
//     if (!startDate || !endDate) {
//       toast.error("Please select both Start and End dates.");
//       return;
//     }

//     if (new Date(startDate) > new Date(endDate)) {
//       toast.error("End date cannot be earlier than Start date.");
//       return;
//     }

//     setIsGenerating(true);
//     try {
//       // 1. Fetch Data (Rentals AND Machines dono ek sath fetch karenge)
//       const [rentalsResponse, machinesResponse] = await Promise.all([
//         axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rentals`, { uid }),
//         axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/machines`, { uid }) // Fetching machines to map names
//       ]);

//       const allRentals = rentalsResponse.data;
//       const allMachines = machinesResponse.data;

//       // 🔥 MAGIC STEP: ID ko Name mein convert karne ke liye ek Lookup Dictionary banayenge
//       const machineMap = {};
//       allMachines.forEach(machine => {
//         // ID ko Name ke sath jod diya
//         machineMap[machine.Machine_id] = machine.Machine_name;
//         // Agar tumhara DB _id use karta hai, toh backup ke liye ye bhi daal do:
//         if (machine._id) machineMap[machine._id] = machine.Machine_name; 
//       });

//       // 2. Filter Data based on Dates and Type
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       end.setHours(23, 59, 59, 999); // End of the day

//       const filteredData = allRentals.filter((item) => {
//         const itemDate = new Date(item.createdAt);
//         const isWithinDate = itemDate >= start && itemDate <= end;
        
//         let matchesType = true;
//         if (filterType === "Paid") matchesType = item.pendingAmount === 0;
//         if (filterType === "Pending") matchesType = item.pendingAmount > 0;

//         return isWithinDate && matchesType;
//       });

//       if (filteredData.length === 0) {
//         toast.warning("No records found for the selected dates.");
//         setIsGenerating(false);
//         return;
//       }

//       // 3. Initialize PDF
//       const doc = new jsPDF();
//       const pageWidth = doc.internal.pageSize.getWidth();

//       // --- HEADER ---
//       doc.setFontSize(22);
//       doc.setTextColor(254, 193, 17); // Primary Yellow
//       doc.text("RentVeda", 14, 20);
      
//       doc.setFontSize(12);
//       doc.setTextColor(100);
//       doc.text("Official Account Statement", 14, 28);
      
//       doc.setFontSize(10);
//       doc.setTextColor(50);
//       doc.text(`Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`, 14, 36);
//       doc.text(`Type: ${filterType} Bills`, 14, 42);

//       // --- TABLE PREPARATION ---
//       const tableColumns = ["Date", "Machine", "Customer", "Total Bill", "Paid", "Pending"];
//       const tableRows = [];
//       let totalBillSum = 0;
//       let totalPaidSum = 0;
//       let totalPendingSum = 0;

//       filteredData.forEach((item) => {
//         totalBillSum += item.totalAmount || 0;
//         totalPaidSum += item.paidAmount || 0;
//         totalPendingSum += item.pendingAmount || 0;

//         // 🔥 Yahan par humne item.machineId ko machineMap se pass kiya hai
//         const actualMachineName = machineMap[item.machineId] || "Unknown Machine";

//         const rowData = [
//           new Date(item.createdAt).toLocaleDateString(),
//           actualMachineName, // Ab ID ki jagah proper Name aayega!
//           item.customerName || "N/A",
//           `Rs. ${item.totalAmount || 0}`,
//           `Rs. ${item.paidAmount || 0}`,
//           `Rs. ${item.pendingAmount || 0}`
//         ];
//         tableRows.push(rowData);
//       });

//       // --- DRAW TABLE ---
//       doc.autoTable({
//         startY: 50,
//         head: [tableColumns],
//         body: tableRows,
//         theme: 'grid',
//         headStyles: { fillColor: [30, 30, 30], textColor: [254, 193, 17] }, // Dark header with yellow text
//         styles: { fontSize: 9, cellPadding: 3 },
//         alternateRowStyles: { fillColor: [245, 245, 245] },
//       });

//       // --- FOOTER (TOTALS) ---
//       const finalY = doc.lastAutoTable.finalY || 50;
//       doc.setFontSize(11);
//       doc.setTextColor(20);
//       doc.text("Summary:", 14, finalY + 10);
      
//       doc.setFontSize(10);
//       doc.text(`Total Billing: Rs. ${totalBillSum}`, 14, finalY + 18);
//       doc.text(`Total Received: Rs. ${totalPaidSum}`, 14, finalY + 24);
//       doc.setTextColor(220, 38, 38); // Red color for pending
//       doc.text(`Total Pending: Rs. ${totalPendingSum}`, 14, finalY + 30);

//       doc.setFontSize(8);
//       doc.setTextColor(150);
//       doc.text("Generated securely via RentVeda App", pageWidth / 2, 280, { align: "center" });

//       // 4. Save and Download PDF
//       doc.save(`RentVeda_Statement_${start.toLocaleDateString()}.pdf`);
//       toast.success("Statement Downloaded Successfully!");

//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       toast.error("Failed to generate statement.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-2xl p-5 shadow-xl max-w-md mx-auto mt-6 font-sans">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
//           <FaFilePdf size={20} />
//         </div>
//         <div>
//           <h2 className="text-white font-extrabold text-lg">Download Statement</h2>
//           <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Generate PDF Report</p>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {/* From Date */}
//         <div>
//           <label className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">From Date</label>
//           <div className="relative">
//             <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
//             <input
//               type="date"
//               value={startDate}
//               max={today} // 3. Aaj se aage ki date select nahi hogi
//               onChange={(e) => setStartDate(e.target.value)}
//               className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none text-sm [color-scheme:dark]"
//             />
//           </div>
//         </div>

//         {/* To Date */}
//         <div>
//           <label className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">To Date</label>
//           <div className="relative">
//             <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
//             <input
//               type="date"
//               value={endDate}
//               min={startDate} // 4. Start date se pehle ki date select nahi hogi
//               max={today}     // 5. Future date yahan bhi allowed nahi hogi
//               onChange={(e) => setEndDate(e.target.value)}
//               className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none text-sm [color-scheme:dark]"
//             />
//           </div>
//         </div>

//         {/* Filter Type */}
//         <div>
//           <label className="block text-gray-400 text-xs font-semibold mb-1.5 pl-1">Record Type</label>
//           <div className="relative">
//             <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               className="w-full bg-[#121212] text-white border border-[#333] rounded-xl py-3 pl-10 pr-4 focus:border-[var(--primary)] outline-none text-sm appearance-none"
//             >
//               <option value="All">All Bills</option>
//               <option value="Paid">Fully Paid Only</option>
//               <option value="Pending">Pending Dues Only</option>
//             </select>
//             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">▼</div>
//           </div>
//         </div>

//         {/* Download Button */}
//         <button
//           onClick={generatePDFStatement}
//           disabled={isGenerating}
//           className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
//             isGenerating 
//             ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
//             : "bg-[var(--primary)] text-black hover:bg-yellow-500 shadow-lg shadow-[var(--primary)]/20 active:scale-95"
//           }`}
//         >
//           {isGenerating ? (
//             <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
//           ) : (
//             <FaDownload />
//           )}
//           {isGenerating ? "Generating PDF..." : "Download PDF Statement"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Statement;

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFilePdf, FaCalendarAlt, FaFilter, FaDownload, FaHistory } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion"; 

const Statement = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const today = new Date().toISOString().split("T")[0];
  const uid = localStorage.getItem("uid");

  // --- QUICK DATE SETTERS ---
  const setThisMonth = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
    setStartDate(firstDay);
    setEndDate(today);
  };

  const setLastMonth = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1).toISOString().split("T")[0];
    const lastDay = new Date(date.getFullYear(), date.getMonth(), 0).toISOString().split("T")[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const generatePDFStatement = async () => {
    if (!startDate || !endDate) {
      toast.error(t('errorSelectDates') || "Please select both Start and End dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error(t('errorDateRange') || "End date cannot be earlier than Start date.");
      return;
    }

    setIsGenerating(true);
    try {
      const [rentalsResponse, machinesResponse] = await Promise.all([
        axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rentals`, { uid }),
        axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/machines`, { uid })
      ]);

      const allRentals = rentalsResponse.data;
      const allMachines = machinesResponse.data;

      const machineMap = {};
      allMachines.forEach(machine => {
        machineMap[machine.Machine_id] = machine.Machine_name;
        if (machine._id) machineMap[machine._id] = machine.Machine_name; 
      });

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); 

      const filteredData = allRentals.filter((item) => {
        const itemDate = new Date(item.createdAt);
        const isWithinDate = itemDate >= start && itemDate <= end;
        
        let matchesType = true;
        if (filterType === "Paid") matchesType = item.pendingAmount === 0;
        if (filterType === "Pending") matchesType = item.pendingAmount > 0;

        return isWithinDate && matchesType;
      });

      if (filteredData.length === 0) {
        toast.warning(t('warningNoRecords') || "No records found for the selected dates.");
        setIsGenerating(false);
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(22);
      doc.setTextColor(254, 193, 17); 
      doc.text("RentVeda", 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("Official Account Statement", 14, 28);
      
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`, 14, 36);
      doc.text(`Type: ${filterType} Bills`, 14, 42);

      const tableColumns = ["Date", "Machine", "Customer", "Total Bill", "Paid", "Pending"];
      const tableRows = [];
      let totalBillSum = 0;
      let totalPaidSum = 0;
      let totalPendingSum = 0;

      filteredData.forEach((item) => {
        totalBillSum += item.totalAmount || 0;
        totalPaidSum += item.paidAmount || 0;
        totalPendingSum += item.pendingAmount || 0;

        const actualMachineName = machineMap[item.machineId] || "Unknown Machine";

        const rowData = [
          new Date(item.createdAt).toLocaleDateString(),
          actualMachineName, 
          item.customerName || "N/A",
          `Rs. ${item.totalAmount || 0}`,
          `Rs. ${item.paidAmount || 0}`,
          `Rs. ${item.pendingAmount || 0}`
        ];
        tableRows.push(rowData);
      });

      doc.autoTable({
        startY: 50,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 30, 30], textColor: [254, 193, 17] }, 
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      const finalY = doc.lastAutoTable.finalY || 50;
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.text("Summary:", 14, finalY + 10);
      
      doc.setFontSize(10);
      doc.text(`Total Billing: Rs. ${totalBillSum}`, 14, finalY + 18);
      doc.text(`Total Received: Rs. ${totalPaidSum}`, 14, finalY + 24);
      doc.setTextColor(220, 38, 38); 
      doc.text(`Total Pending: Rs. ${totalPendingSum}`, 14, finalY + 30);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Generated securely via RentVeda App", pageWidth / 2, 280, { align: "center" });

      doc.save(`RentVeda_Statement_${start.toLocaleDateString()}.pdf`);
      toast.success(t('successStatementDownloaded') || "Statement Downloaded Successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(t('errorGenerateStatement') || "Failed to generate statement.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-[#121212] min-h-screen pb-24 pt-4 mt-12 font-sans relative overflow-hidden"
    >
      
      {/* STICKY TOP HEADER */}
      <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] px-4 py-2 flex items-center justify-between mb-4 shadow-sm">
        <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center w-full m-0">
          {t('statementTitle') || "ACCOUNT STATEMENT"}
        </h2>
      </div>

      <div className="px-4 max-w-md mx-auto">
        
        {/* PREMIUM HERO CARD */}
        <div className="relative bg-gradient-to-br from-[#1E1E1E] to-[#161616] rounded-2xl p-4 mb-6 border border-[#2C2C2C] shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/10 rounded-full blur-[30px] pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121212] border border-[#333] flex items-center justify-center text-[var(--primary)] shadow-md shadow-[var(--primary)]/10">
              <FaFilePdf size={18} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight m-0 leading-tight">
                {t('generateReport') || "Generate Report"}
              </h1>
              <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mt-0.5 m-0">
                {t('downloadPdfDesc') || "Download PDF Statements"}
              </p>
            </div>
          </div>
        </div>

        {/* INPUT FORM SECTION */}
        <div className="space-y-4">
          
          {/* Quick Date Pills */}
          <div className="flex gap-2">
            <button 
              onClick={setThisMonth}
              className="flex-1 py-2 bg-[#1E1E1E] border border-[#333] hover:border-[var(--primary)] rounded-xl text-gray-300 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FaHistory className="text-[var(--primary)]" /> {t('thisMonth') || "This Month"}
            </button>
            <button 
              onClick={setLastMonth}
              className="flex-1 py-2 bg-[#1E1E1E] border border-[#333] hover:border-[var(--primary)] rounded-xl text-gray-300 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FaHistory className="text-gray-500" /> {t('lastMonth') || "Last Month"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* From Date */}
            <div>
              <label className="block text-gray-400 text-[10px] font-semibold mb-1 pl-1">
                {t('fromDate') || "From Date"}
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                <input
                  type="date"
                  value={startDate}
                  max={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1E1E1E] text-white border border-[#333] rounded-xl py-2.5 pl-8 pr-2 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs transition-all [color-scheme:dark] shadow-inner"
                />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-gray-400 text-[10px] font-semibold mb-1 pl-1">
                {t('toDate') || "To Date"}
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1E1E1E] text-white border border-[#333] rounded-xl py-2.5 pl-8 pr-2 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs transition-all [color-scheme:dark] shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Filter Type */}
          <div>
            <label className="block text-gray-400 text-[10px] font-semibold mb-1 pl-1">
              {t('recordType') || "Record Type"}
            </label>
            <div className="relative">
              <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--primary)] text-xs z-10" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-[#1E1E1E] text-[var(--primary)] font-bold border border-[#333] rounded-xl py-2.5 pl-9 pr-4 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs appearance-none transition-all cursor-pointer shadow-inner"
              >
                <option value="All" className="bg-[#121212] text-white">{t('allBills') || "All Bills"}</option>
                <option value="Paid" className="bg-[#121212] text-white">{t('fullyPaidOnly') || "Fully Paid Only"}</option>
                <option value="Pending" className="bg-[#121212] text-white">{t('pendingDuesOnly') || "Pending Dues Only"}</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-[10px] pointer-events-none">▼</div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={generatePDFStatement}
            disabled={isGenerating}
            className={`w-full mt-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isGenerating 
              ? "bg-[#333] text-gray-400 cursor-not-allowed" 
              : "bg-[var(--primary)] text-black hover:bg-yellow-500 shadow-md shadow-[var(--primary)]/20 active:scale-95"
            }`}
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaDownload size={14} />
            )}
            {isGenerating 
              ? (t('generatingPdf') || "Generating...") 
              : (t('downloadPdfBtn') || "Download PDF Statement")
            }
          </button>
          
        </div>
      </div>
    </motion.div>
  );
};

export default Statement;