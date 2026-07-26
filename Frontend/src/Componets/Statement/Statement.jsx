import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "../../utils/toastService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FaFilePdf,
  FaDownload,
  FaHistory,
  FaArrowLeft,
} from "react-icons/fa";
import {
  MdUpdate,
  MdCalendarMonth,
  MdEvent,
  MdFilterList,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Statement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isGenerating, setIsGenerating] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const uid = localStorage.getItem("uid");

  // ── QUICK DATE SETTERS ──
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

  // ── PDF GENERATOR LOGIC ──
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen font-body-md pb-[90px]"
    >
      {/* ── STICKY TOP APP BAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e2e2e2] shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-[#f9f9f9] hover:bg-[#e8e8e8] text-[#795900] flex items-center justify-center transition-colors cursor-pointer border border-[#e2e2e2]"
              aria-label="Back"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div>
              <h1 className="text-[#1a1c1c] text-base font-bold tracking-tight leading-tight">
                {t('statementTitle') || "Account Statement"}
              </h1>
              <span className="text-[#4f4633] text-[10px] uppercase font-semibold tracking-wider block">
                PDF Generator & Reports
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#fbc02d] text-[#6c5000] flex items-center justify-center shadow-sm">
            <FaFilePdf className="text-base text-[#6c5000]" />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CANVAS ── */}
      <main className="w-full max-w-2xl mx-auto px-4 pt-5 pb-24 space-y-5">
        {/* Hero Section Banner */}
        <section className="bg-gradient-to-br from-white via-[#fffbeb] to-[#fbc02d]/20 border border-[#fbc02d] rounded-2xl p-4 shadow-sm relative overflow-hidden flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fbc02d] text-[#6c5000] flex items-center justify-center shadow-md flex-shrink-0">
            <FaFilePdf className="text-xl text-[#6c5000]" />
          </div>
          <div>
            <h2 className="text-[#1a1c1c] text-sm font-bold">
              {t('generateReport') || "Generate Official Statement"}
            </h2>
            <p className="text-[#4f4633] text-xs mt-0.5">
              {t('downloadPdfDesc') || "Download PDF statements for your billing & financial records."}
            </p>
          </div>
        </section>

        {/* Quick Select Period */}
        <section className="space-y-2.5">
          <h3 className="text-[#4f4633] text-xs font-bold uppercase tracking-widest pl-1">
            {t('quickSelect') || "Quick Select Period"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={setThisMonth}
              className="flex items-center justify-center gap-2 bg-white hover:bg-[#fffdf0] border border-[#e2e2e2] hover:border-[#fbc02d] rounded-2xl p-3.5 transition-all shadow-sm active:scale-95 cursor-pointer text-xs font-bold text-[#1a1c1c]"
            >
              <FaHistory className="text-[#795900] text-sm" />
              <span>{t('thisMonth') || "This Month"}</span>
            </button>
            <button
              type="button"
              onClick={setLastMonth}
              className="flex items-center justify-center gap-2 bg-white hover:bg-[#fffdf0] border border-[#e2e2e2] hover:border-[#fbc02d] rounded-2xl p-3.5 transition-all shadow-sm active:scale-95 cursor-pointer text-xs font-bold text-[#1a1c1c]"
            >
              <MdUpdate className="text-[#795900] text-base" />
              <span>{t('lastMonth') || "Last Month"}</span>
            </button>
          </div>
        </section>

        {/* Custom Date Range (Curved Inputs) */}
        <section className="space-y-2.5">
          <h3 className="text-[#4f4633] text-xs font-bold uppercase tracking-widest pl-1">
            {t('customRange') || "Custom Date Range"}
          </h3>
          <div className="bg-white border border-[#e2e2e2] rounded-2xl p-4 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* From Date */}
              <div>
                <label className="block text-[#4f4633] text-xs font-semibold mb-1.5" htmlFor="fromDate">
                  {t('fromDate') || "From Date"}
                </label>
                <div className="relative">
                  <MdCalendarMonth className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f4633] text-base pointer-events-none" />
                  <input
                    id="fromDate"
                    name="fromDate"
                    type="date"
                    value={startDate}
                    max={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#f9f9f9] text-[#1a1c1c] pl-10 pr-3 py-2.5 rounded-2xl text-xs font-medium border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all cursor-pointer shadow-inner"
                  />
                </div>
              </div>

              {/* To Date */}
              <div>
                <label className="block text-[#4f4633] text-xs font-semibold mb-1.5" htmlFor="toDate">
                  {t('toDate') || "To Date"}
                </label>
                <div className="relative">
                  <MdEvent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4f4633] text-base pointer-events-none" />
                  <input
                    id="toDate"
                    name="toDate"
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#f9f9f9] text-[#1a1c1c] pl-10 pr-3 py-2.5 rounded-2xl text-xs font-medium border border-[#e2e2e2] focus:border-[#fbc02d] focus:ring-2 focus:ring-[#fbc02d] outline-none transition-all cursor-pointer shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Record Type Filter Pills */}
        <section className="space-y-2.5">
          <h3 className="text-[#4f4633] text-xs font-bold uppercase tracking-widest pl-1">
            {t('recordType') || "Bill Filter Type"}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: "All", label: t('allBills') || "All Bills" },
              { val: "Paid", label: t('fullyPaidOnly') || "Fully Paid" },
              { val: "Pending", label: t('pendingDuesOnly') || "Pending Dues" },
            ].map((f) => (
              <button
                key={f.val}
                type="button"
                onClick={() => setFilterType(f.val)}
                className={`py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                  filterType === f.val
                    ? "bg-[#fbc02d] text-[#6c5000] border-[#795900] font-bold shadow-sm"
                    : "bg-white text-[#4f4633] border-[#e2e2e2] hover:bg-[#f9f9f9]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* ── FIXED BOTTOM ACTION BUTTON ── */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#e2e2e2] p-4 shadow-[0px_-4px_16px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={generatePDFStatement}
            disabled={isGenerating}
            className={`w-full bg-[#fbc02d] hover:bg-[#f8bd2a] text-[#6c5000] font-bold text-sm py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-md shadow-[#fbc02d]/20 flex items-center justify-center gap-2 cursor-pointer ${
              isGenerating ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-[#6c5000] border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaDownload className="text-base text-[#6c5000]" />
            )}
            <span>
              {isGenerating
                ? (t('generatingPdf') || "Generating Statement...")
                : (t('downloadPdfBtn') || "Download PDF Statement")}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Statement;