import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "../../utils/toastService";
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
        axios.post(`${API_BASE_URL}/api/rentals`, { uid }),
        axios.post(`${API_BASE_URL}/api/machines?includeArchived=true`, { uid })
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
      className="bg-[var(--bg-main)] min-h-screen pb-24 pt-4 mt-12 font-sans relative overflow-hidden"
    >

      {/* STICKY TOP HEADER */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-2 flex items-center justify-between mb-4 shadow-sm">
        <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest text-center w-full m-0">
          {t('statementTitle') || "ACCOUNT STATEMENT"}
        </h2>
      </div>

      <div className="px-4 max-w-md mx-auto">

        {/* PREMIUM HERO CARD */}
        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 mb-6 border border-[var(--border-color)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/10 rounded-full blur-[30px] pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center text-[var(--primary)] shadow-md shadow-[var(--primary)]/10">
              <FaFilePdf size={18} />
            </div>
            <div>
              <h1 className="text-[var(--text-main)] font-bold text-lg tracking-tight m-0 leading-tight">
                {t('generateReport') || "Generate Report"}
              </h1>
              <p className="text-[var(--text-muted)] text-[9px] uppercase font-bold tracking-wider mt-0.5 m-0">
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
              className="flex-1 py-2 bg-white border border-[var(--border-color)] hover:border-[var(--primary)] rounded-xl text-[var(--text-muted)] text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FaHistory className="text-[var(--primary)]" /> {t('thisMonth') || "This Month"}
            </button>
            <button
              onClick={setLastMonth}
              className="flex-1 py-2 bg-white border border-[var(--border-color)] hover:border-[var(--primary)] rounded-xl text-[var(--text-muted)] text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FaHistory className="text-[var(--text-muted)]" /> {t('lastMonth') || "Last Month"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* From Date */}
            <div>
              <label className="block text-[var(--text-muted)] text-[10px] font-semibold mb-1 pl-1">
                {t('fromDate') || "From Date"}
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
                <input
                  type="date"
                  value={startDate}
                  max={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white text-[var(--text-main)] border border-[var(--border-color)] rounded-xl py-2.5 pl-8 pr-2 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs transition-all [color-scheme:dark] shadow-inner"
                />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-[var(--text-muted)] text-[10px] font-semibold mb-1 pl-1">
                {t('toDate') || "To Date"}
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white text-[var(--text-main)] border border-[var(--border-color)] rounded-xl py-2.5 pl-8 pr-2 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs transition-all [color-scheme:dark] shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Filter Type */}
          <div>
            <label className="block text-[var(--text-muted)] text-[10px] font-semibold mb-1 pl-1">
              {t('recordType') || "Record Type"}
            </label>
            <div className="relative">
              <FaFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--primary)] text-xs z-10" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-white text-[var(--primary)] font-bold border border-[var(--border-color)] rounded-xl py-2.5 pl-9 pr-4 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-xs appearance-none transition-all cursor-pointer shadow-inner"
              >
                <option value="All" className="bg-[var(--bg-main)] text-[var(--text-main)]">{t('allBills') || "All Bills"}</option>
                <option value="Paid" className="bg-[var(--bg-main)] text-[var(--text-main)]">{t('fullyPaidOnly') || "Fully Paid Only"}</option>
                <option value="Pending" className="bg-[var(--bg-main)] text-[var(--text-main)]">{t('pendingDuesOnly') || "Pending Dues Only"}</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px] pointer-events-none">▼</div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={generatePDFStatement}
            disabled={isGenerating}
            className={`w-full mt-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isGenerating
              ? "bg-gray-300 text-[var(--text-muted)] cursor-not-allowed"
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