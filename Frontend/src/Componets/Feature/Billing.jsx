

import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useTranslation } from "react-i18next";
import { useGetPaymentsQuery, useEditRentalMutation, useDeleteRentalsMutation } from "../../redux/functional/paymentApiSlice";
import { openPhoneDialer } from "../../utils/capacitorLinks";
import hindiFont from "../../assets/fonts/hindiFont"; // Make sure this path is correct
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaFilePdf,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSortAmountDown,
  FaUserTie,
  FaTimes,
  FaLanguage,
  FaEdit,
  FaTrashAlt,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle
} from "react-icons/fa";

const Billing = () => {
  const { t } = useTranslation();
  const [billData, setBillData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchField, setSearchField] = useState("customerName");
  const [sortOrder, setSortOrder] = useState("desc");

  // Language Modal State
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const uid = localStorage.getItem("uid");
  const { data: paymentData = [], refetch } = useGetPaymentsQuery(uid, { skip: !uid });
  const [editRental, { isLoading: isEditing }] = useEditRentalMutation();
  const [deleteRentals, { isLoading: isDeleting }] = useDeleteRentalsMutation();

  useEffect(() => {
    if (!uid) return;
    const fetchRentals = async () => {
      try {
        setIsLoading(true);
        const formattedData = paymentData.map((bill) => ({
          ...bill,
          paidAmount: bill.paidAmount || 0,
          pendingAmount: bill.pendingAmount || 0,
          customerAddress: bill.address || "N/A",
          operatorName: bill.operatorName || "N/A",
        }));
        const sortedData = formattedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBillData(sortedData);
        setFilteredData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRentals();
  }, [uid, paymentData]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = billData.filter((bill) =>
      bill[searchField]?.toString().toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleFilterChange = (field) => {
    setSearchField(field);
    setSearchTerm("");
    setFilteredData(billData);
  };

  const toggleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    const sorted = [...filteredData].sort((a, b) => {
      return newOrder === "asc"
        ? a.paidAmount - b.paidAmount
        : b.paidAmount - a.paidAmount;
    });
    setFilteredData(sorted);
  };

  // --- TOAST HELPER ---
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // --- DELETE FLOW ---
  const handleDeleteClick = (bill) => {
    setBillToDelete(bill);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!billToDelete) return;
    try {
      await deleteRentals({ ids: [billToDelete._id] }).unwrap();
      showToast("Bill deleted successfully!", "success");
      setIsDeleteModalOpen(false);
      setBillToDelete(null);
    } catch (err) {
      showToast(err?.data?.message || "Failed to delete bill", "error");
    }
  };

  // --- EDIT FLOW ---
  const handleEditClick = (bill) => {
    setEditFormData({
      _id: bill._id,
      customerName: bill.customerName || "",
      mobileNumber: bill.mobileNumber || "",
      address: bill.address || bill.customerAddress || "",
      operatorName: bill.operatorName || "",
      price: bill.price || 0,
      quantity: bill.quantity || 0,
      paidAmount: bill.paidAmount || 0,
      pendingAmount: bill.pendingAmount || 0,
      jobWork: bill.jobWork || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-recalculate totalAmount when price or quantity changes
      if (field === "price" || field === "quantity") {
        updated.totalAmount = (Number(updated.price) || 0) * (Number(updated.quantity) || 0);
      }
      return updated;
    });
  };

  const handleEditSave = async () => {
    try {
      await editRental(editFormData).unwrap();
      showToast("Bill updated successfully!", "success");
      setIsEditModalOpen(false);
      setEditFormData({});
    } catch (err) {
      showToast(err?.data?.message || "Failed to update bill", "error");
    }
  };

  // --- PDF GENERATION LOGIC ---
  const handlePdfClick = (bill) => {
    setSelectedBill(bill);
    setIsLangModalOpen(true);
  };

  const downloadPDF = (lang) => {
    if (!selectedBill) return;
    const bill = selectedBill;
    const doc = new jsPDF();

    // Add & Set Hindi Font globally for this doc
    doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", hindiFont);
    doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSans", "normal");
    doc.setFont("NotoSans");

    // Colors
    const primaryColor = [254, 193, 17]; // #FEC111
    const darkHeaderColor = [25, 25, 25]; // Dark Grey

    // 1. Header Background
    doc.setFillColor(...darkHeaderColor);
    doc.rect(0, 0, 210, 35, "F");

    // 2. Title
    doc.setTextColor(...primaryColor);
    doc.setFontSize(22);
    const title = lang === "hi" ? "इनवॉइस / INVOICE" : "INVOICE";
    doc.text(title, 105, 22, { align: "center" });

    // 3. Date
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    const dateLabel = lang === "hi" ? "दिनांक (Date):" : "Date:";
    doc.text(`${dateLabel} ${new Date().toLocaleDateString()}`, 195, 22, { align: "right" });

    // 4. Bill To Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const billToLabel = lang === "hi" ? "बिल किसको (Bill To):" : "Bill To:";
    doc.text(billToLabel, 14, 50);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const nameLabel = lang === "hi" ? "नाम (Name):" : "Name:";
    const phoneLabel = lang === "hi" ? "मोबाइल (Mobile):" : "Phone:";
    const addressLabel = lang === "hi" ? "पता (Address):" : "Address:";

    doc.text(`${nameLabel} ${bill.customerName}`, 14, 60);
    doc.text(`${phoneLabel} ${bill.mobileNumber}`, 14, 67);
    doc.text(`${addressLabel} ${bill.customerAddress}`, 14, 74);

    // 5. Table Data Labels
    const descLabel = lang === "hi" ? "विवरण (Description)" : "Description";
    const amtLabel = lang === "hi" ? "राशि (Amount)" : "Amount";
    const paidRow = lang === "hi" ? "जमा राशि (Paid Amount)" : "Paid Amount";
    const pendingRow = lang === "hi" ? "बकाया राशि (Pending Due)" : "Pending Due";
    const totalRow = lang === "hi" ? "कुल राशि (Grand Total)" : "Grand Total";

    // 6. Generate Table
    doc.autoTable({
      startY: 90,
      head: [[descLabel, amtLabel]],
      body: [
        [paidRow, `Rs ${bill.paidAmount.toLocaleString()}`],
        [pendingRow, `Rs ${bill.pendingAmount.toLocaleString()}`]
      ],
      theme: "grid",
      styles: {
        font: "NotoSans", // Crucial for Hindi rendering in table
        fontSize: 11,
        cellPadding: 6
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [0, 0, 0],
        fontStyle: "bold"
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 'auto', halign: 'right' }
      }
    });

    // 7. Grand Total Box
    const finalY = doc.lastAutoTable.finalY || 130;
    doc.setFillColor(245, 245, 245);
    doc.rect(120, finalY + 10, 76, 12, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`${totalRow}:`, 125, finalY + 18);
    doc.setFontSize(12);
    doc.text(`Rs ${(bill.paidAmount + bill.pendingAmount).toLocaleString()}`, 190, finalY + 18, { align: "right" });

    // 8. Footer Message
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const footerMsg = lang === "hi" ? "हमारे साथ व्यापार करने के लिए धन्यवाद!" : "Thank you for your business!";
    doc.text(footerMsg, 105, 280, { align: "center" });

    // Save and close modal
    doc.save(`${bill.customerName}_Invoice.pdf`);
    setIsLangModalOpen(false);
  };

  const listContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const listItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-[var(--bg-main)] mt-16 min-h-screen pb-20 relative">

      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] pb-2">
        <div className="px-4 py-2 flex justify-between items-center">
          <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
            {t('billingHistoryTitle') || "BILLING HISTORY"}
          </h2>
          <span className="text-[9px] bg-white text-[var(--primary)] px-2 py-0.5 rounded border border-[var(--border-color)]">
            Total: {filteredData.length}
          </span>
        </div>

        <div className="px-4 mb-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-2.5 text-[var(--text-muted)] text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={`Search by ${searchField.replace('Name', '')}...`}
              className="w-full bg-white text-[var(--text-main)] pl-9 pr-3 py-2 rounded-full text-xs outline-none border border-[var(--border-color)] focus:border-[var(--primary)] transition-colors placeholder-[var(--text-muted)]"
            />
          </div>
        </div>

        <div className="px-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {[
            { label: t("customerNamept") || "Customer", id: "customerName" },
            { label: t("operatorName") || "Operator", id: "operatorName" },
            { label: t("searchByCustomerAddress") || "Address", id: "customerAddress" }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border transition-all ${searchField === filter.id
                  ? "bg-[var(--primary)] text-black border-[var(--primary)]"
                  : "bg-transparent text-[var(--text-muted)] border-[var(--border-color)]"
                }`}
            >
              {filter.label}
            </button>
          ))}
          <button
            onClick={toggleSort}
            className="ml-auto w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-white border border-[var(--border-color)] text-[var(--text-muted)] active:text-[var(--primary)]"
          >
            <FaSortAmountDown size={10} />
          </button>
        </div>
      </div>

      {/* --- CONTENT LIST --- */}
      <div className="px-3 mt-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-white rounded-lg animate-pulse border border-[var(--border-color)]" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-muted)] text-xs">
            <p>No bills found</p>
          </div>
        ) : (
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {filteredData.map((bill) => (
              <motion.div
                key={bill._id || bill.id}
                variants={listItem}
                className="bg-white p-2.5 rounded-xl border border-[var(--border-color)] flex justify-between items-center active:bg-gray-100"
              >
                {/* Left Side: INFO + CALL BUTTON */}
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <button
                    onClick={(e) => { e.stopPropagation(); openPhoneDialer(bill.mobileNumber); }}
                    className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0 text-green-500 active:bg-green-600 active:text-[var(--text-main)] transition-colors"
                  >
                    <FaPhoneAlt size={12} />
                  </button>

                  <div className="min-w-0">
                    <h3 className="text-[var(--text-main)] text-xs font-bold truncate">
                      {bill.customerName}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
                        <FaMapMarkerAlt size={8} />
                        <span className="truncate max-w-[70px]">{bill.customerAddress}</span>
                      </div>
                      <span className="text-gray-700 text-[8px]">•</span>
                      <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
                        <FaUserTie size={8} />
                        <span className="truncate max-w-[50px]">{bill.operatorName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Amount & Actions */}
                <div className="flex items-center gap-2 pl-1">
                  <div className="text-right">
                    <span className="block text-[10px] text-[var(--text-muted)]">Total</span>
                    <span className="block text-xs font-bold text-[var(--primary)]">
                      ₹{(bill.paidAmount + bill.pendingAmount).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleEditClick(bill)}
                    className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 active:bg-blue-500 active:text-[var(--text-main)] transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={11} />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(bill)}
                    className="w-7 h-7 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 active:bg-red-500 active:text-[var(--text-main)] transition-colors"
                    title="Delete"
                  >
                    <FaTrashAlt size={11} />
                  </button>

                  <button
                    onClick={() => handlePdfClick(bill)}
                    className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 active:bg-orange-500 active:text-[var(--text-main)] transition-colors"
                    title="PDF"
                  >
                    <FaFilePdf size={11} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* --- LANGUAGE SELECTION MODAL --- */}
      <AnimatePresence>
        {isLangModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 border border-[var(--border-color)] mb-4 sm:mb-0"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2 text-[var(--text-main)] font-bold">
                  <FaLanguage size={18} className="text-[var(--primary)]" />
                  Select Language
                </div>
                <button onClick={() => setIsLangModalOpen(false)} className="text-[var(--text-muted)] p-1">
                  <FaTimes />
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-4 text-center">
                Choose the language in which you want to generate the PDF invoice for <strong className="text-[var(--text-main)]">{selectedBill?.customerName}</strong>.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => downloadPDF("en")}
                  className="w-full py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--primary)] text-[var(--text-main)] rounded-xl font-bold text-sm transition-all"
                >
                  English Invoice
                </button>
                <button
                  onClick={() => downloadPDF("hi")}
                  className="w-full py-3.5 bg-[var(--primary)] text-black rounded-xl font-bold text-sm shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                >
                  हिंदी में डाउनलोड करें (Hindi)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 border border-[var(--border-color)] mb-4 sm:mb-0"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <FaExclamationTriangle size={24} className="text-red-500" />
                </div>
                <h3 className="text-[var(--text-main)] font-bold text-base mb-2">{t('deleteBillTitle')}</h3>
                <p className="text-[var(--text-muted)] text-xs mb-1">
                  {t('deleteBillMessage')}
                </p>
                <p className="text-[var(--primary)] font-bold text-sm mb-1">
                  {billToDelete?.customerName}
                </p>
                <p className="text-[var(--text-muted)] text-[10px] mb-5">
                  {t('billAmount')}{((billToDelete?.paidAmount || 0) + (billToDelete?.pendingAmount || 0)).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setIsDeleteModalOpen(false); setBillToDelete(null); }}
                  className="flex-1 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  {t('cancelButton')}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-500 text-[var(--text-main)] rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><FaSpinner className="animate-spin" size={14} /> {t('deleting')}</>
                  ) : (
                    <><FaTrashAlt size={12} /> {t('deleteButton')}</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT BILL MODAL --- */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[var(--bg-main)] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex justify-between items-center">
              <h2 className="text-[var(--text-main)] font-bold text-sm flex items-center gap-2">
                <FaEdit className="text-[var(--primary)]" /> Edit Bill
              </h2>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditFormData({}); }}
                className="w-8 h-8 rounded-full bg-white border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-4 py-4 space-y-4 pb-28">
              {/* Customer Info Section */}
              <div className="bg-white rounded-2xl p-4 border border-[var(--border-color)] space-y-3">
                <h3 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2">Customer Info</h3>

                <div>
                  <label className="text-[var(--text-muted)] text-[10px] block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editFormData.customerName || ""}
                    onChange={(e) => handleEditFormChange("customerName", e.target.value)}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2.5 rounded-xl text-xs border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[var(--text-muted)] text-[10px] block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editFormData.mobileNumber || ""}
                    onChange={(e) => handleEditFormChange("mobileNumber", e.target.value)}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2.5 rounded-xl text-xs border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[var(--text-muted)] text-[10px] block mb-1">Address</label>
                  <input
                    type="text"
                    value={editFormData.address || ""}
                    onChange={(e) => handleEditFormChange("address", e.target.value)}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2.5 rounded-xl text-xs border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[var(--text-muted)] text-[10px] block mb-1">Operator Name</label>
                  <input
                    type="text"
                    value={editFormData.operatorName || ""}
                    onChange={(e) => handleEditFormChange("operatorName", e.target.value)}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2.5 rounded-xl text-xs border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-white rounded-2xl p-4 border border-[var(--border-color)] space-y-3">
                <h3 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2">Pricing</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[var(--text-muted)] text-[10px] block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={editFormData.price || ""}
                      onChange={(e) => handleEditFormChange("price", e.target.value)}
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2.5 rounded-xl text-xs border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[var(--text-muted)] text-[10px] block mb-1">Quantity</label>
                    <input
                      type="number"
                      value={editFormData.quantity || ""}
                      onChange={(e) => handleEditFormChange("quantity", e.target.value)}
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2.5 rounded-xl text-xs border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Auto-calculated Total */}
                <div className="bg-[var(--bg-main)] rounded-xl p-3 border border-[var(--border-color)] flex justify-between items-center">
                  <span className="text-[var(--text-muted)] text-[10px]">Total Amount</span>
                  <span className="text-[var(--primary)] font-bold text-sm">
                    ₹{((Number(editFormData.price) || 0) * (Number(editFormData.quantity) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white rounded-2xl p-4 border border-[var(--border-color)] space-y-3">
                <h3 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mb-2">Payment</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[var(--text-muted)] text-[10px] block mb-1">Paid (₹)</label>
                    <input
                      type="number"
                      value={editFormData.paidAmount || ""}
                      onChange={(e) => handleEditFormChange("paidAmount", e.target.value)}
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2.5 rounded-xl text-xs border border-[var(--border-color)] focus:border-green-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[var(--text-muted)] text-[10px] block mb-1">Pending (₹)</label>
                    <input
                      type="number"
                      value={editFormData.pendingAmount || ""}
                      onChange={(e) => handleEditFormChange("pendingAmount", e.target.value)}
                      className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2.5 rounded-xl text-xs border border-[var(--border-color)] focus:border-red-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[var(--text-muted)] text-[10px] block mb-1">Job Work</label>
                  <input
                    type="text"
                    value={editFormData.jobWork || ""}
                    onChange={(e) => handleEditFormChange("jobWork", e.target.value)}
                    className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2.5 rounded-xl text-xs border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Bottom Save/Cancel Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[var(--border-color)] p-4 flex gap-3 z-10">
              <button
                onClick={() => { setIsEditModalOpen(false); setEditFormData({}); }}
                className="flex-1 py-3.5 bg-white border border-[var(--border-color)] text-[var(--text-main)] rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={isEditing}
                className="flex-1 py-3.5 bg-[var(--primary)] text-black rounded-xl font-bold text-sm shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isEditing ? (
                  <><FaSpinner className="animate-spin" size={14} /> Saving...</>
                ) : (
                  <><FaCheck size={12} /> Save Changes</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className={`fixed bottom-20 left-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold shadow-xl border ${toast.type === "success"
                ? "bg-green-900/90 text-green-300 border-green-700"
                : "bg-red-900/90 text-red-300 border-red-700"
              }`}
          >
            {toast.type === "success" ? <FaCheck size={14} /> : <FaExclamationTriangle size={14} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Billing;