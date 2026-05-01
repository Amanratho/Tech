import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import {
  FaChevronLeft,
  FaUser,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaHardHat,
  FaWrench,
  FaCalculator,
  FaCheckCircle,
  FaSave
} from "react-icons/fa";

const StartEntry = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { rentType, machineId, machineName } = location.state || {};

  // --- STATE ---
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [jobWork, setJobWork] = useState("");

  const [isCustomerFound, setIsCustomerFound] = useState(false);

  // --- LOGIC: CALCULATION ---
  useEffect(() => {
    if (rentType && price && quantity) {
      handleCalculate();
    }
  }, [rentType, price, quantity]);

  const handleCalculate = () => {
    const priceVal = Number(price) || 0;
    const quantityVal = Number(quantity) || 0;

    if (priceVal < 0 || quantityVal < 0) return;

    let calculatedTotal = 0;

    switch (rentType) {
      case "Acre":
      case "Quantity":
      case "Days":
      case "Contract":
      case "Kilometers":
      case "Foot":
        calculatedTotal = priceVal * quantityVal;
        break;
      case "Hour":
        const hours = Math.floor(quantityVal);
        const minutes = (quantityVal - hours) * 100;
        const totalHours = hours + minutes / 60;
        calculatedTotal = priceVal * totalHours;
        break;
      default:
        return;
    }

    const finalTotal = parseFloat(calculatedTotal.toFixed(2));
    setTotal(finalTotal);
    setPendingAmount(finalTotal);
    setPaidAmount(0);
  };

  const handlePaidAmountChange = (e) => {
    const paid = Number(e.target.value) || 0;
    const validPaidAmount = Math.min(paid, total || 0);
    setPaidAmount(validPaidAmount);
    setPendingAmount((total || 0) - validPaidAmount);
  };

  const handlePendingAmountChange = (e) => {
    const pending = Number(e.target.value) || 0;
    const validPendingAmount = Math.min(pending, total || 0);
    setPendingAmount(validPendingAmount);
    setPaidAmount((total || 0) - validPendingAmount);
  };

  // --- LOGIC: FETCH CUSTOMER ---
  const handleMobileNumberChange = async (e) => {
    const mobile = e.target.value;
    setMobileNumber(mobile);
    setIsCustomerFound(false);

    if (mobile.length === 10) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/rentals/customer/${mobile}`
        );
        if (response.data) {
          setCustomerName(response.data.customerName);
          setAddress(response.data.address);
          setIsCustomerFound(true);
          toast.success("Existing Customer Found!");
        }
      } catch (error) {
        setCustomerName("");
        setAddress("");
      }
    }
  };

  // --- LOGIC: SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !mobileNumber || !price || !quantity) {
      toast.error("Please fill all required fields.");
      return;
    }

    const uid = localStorage.getItem("uid");
    const entryData = {
      customerName,
      mobileNumber,
      address,
      operatorName,
      price: Number(price),
      quantity: Number(quantity),
      paidAmount: Number(paidAmount),
      pendingAmount: Number(pendingAmount),
      rentType: rentType,
      uid: uid,
      machineId: machineId,
      jobWork,
    };

    try {
      await axios.post(
        `${API_BASE_URL}/api/rentals/add-entry`,
        entryData
      );
      toast.success("Entry saved!");
      navigate("/invoice", { state: { entryData, machineName } });
      resetForm();
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setMobileNumber("");
    setAddress("");
    setOperatorName("");
    setJobWork("");
    setPrice("");
    setQuantity("");
    setTotal(null);
    setPaidAmount(0);
    setPendingAmount(null);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-[#121212] min-h-screen flex flex-col pb-20 relative">

      {/* 1. APP HEADER */}
      <div className="sticky top-0 z-30 bg-[#121212] border-b border-[#2C2C2C] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full active:bg-[#2C2C2C] text-white"
        >
          <FaChevronLeft />
        </button>
        <div>
          <h1 className="text-white text-lg font-bold tracking-wide">
            {t('addNewEntry') || "New Entry"}
          </h1>
          <p className="text-[10px] text-[var(--primary)] font-medium uppercase tracking-wider">
            {machineName || "Machine"} • {rentType || "Hourly"}
          </p>
        </div>
      </div>

      {/* 2. FORM CONTAINER */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 px-4 mt-4 space-y-5"
      >

        {/* CUSTOMER DETAILS */}
        <div className="space-y-3">
          <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-1">
            {t('rentalDetails') || "CUSTOMER DETAILS"}
          </h2>

          <motion.div variants={item} className="relative group">
            <div className="absolute top-3.5 left-4 text-gray-500 group-focus-within:text-[var(--primary)]">
              <FaPhoneAlt size={14} />
            </div>
            <input
              type="tel"
              maxLength={10}
              placeholder={t('enterMobileNumber') || "Mobile Number"}
              value={mobileNumber}
              onChange={handleMobileNumberChange}
              className="w-full bg-[#1E1E1E] text-white pl-11 pr-10 py-3 rounded-xl border border-[#333] focus:border-[var(--primary)] outline-none text-sm font-medium tracking-wide transition-all"
            />
            {isCustomerFound && (
              <div className="absolute top-3.5 right-4 text-green-500 animate-bounce">
                <FaCheckCircle size={16} />
              </div>
            )}
          </motion.div>

          <motion.div variants={item} className="relative group">
            <div className="absolute top-3.5 left-4 text-gray-500 group-focus-within:text-[var(--primary)]">
              <FaUser size={14} />
            </div>
            <input
              type="text"
              placeholder={t('enterCustomerName') || "Customer Name"}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#1E1E1E] text-white pl-11 pr-4 py-3 rounded-xl border border-[#333] focus:border-[var(--primary)] outline-none text-sm transition-all"
            />
          </motion.div>

          <motion.div variants={item} className="relative group">
            <div className="absolute top-3.5 left-4 text-gray-500 group-focus-within:text-[var(--primary)]">
              <FaMapMarkerAlt size={14} />
            </div>
            <input
              type="text"
              placeholder={t('clientAddress') || "Address"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#1E1E1E] text-white pl-11 pr-4 py-3 rounded-xl border border-[#333] focus:border-[var(--primary)] outline-none text-sm transition-all"
            />
          </motion.div>
        </div>

        {/* WORK DETAILS */}
        <div className="space-y-3">
          <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-1">
            {t('jobWork') || "WORK DETAILS"}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <motion.div variants={item} className="relative">
              <div className="absolute top-3.5 left-3 text-gray-500">
                <FaHardHat size={12} />
              </div>
              <input
                type="text"
                placeholder={t('operatorName') || "Operator"}
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-[#1E1E1E] text-white pl-9 pr-2 py-3 rounded-xl border border-[#333] focus:border-[var(--primary)] outline-none text-xs"
              />
            </motion.div>

            <motion.div variants={item} className="relative">
              <div className="absolute top-3.5 left-3 text-gray-500">
                <FaWrench size={12} />
              </div>
              <input
                type="text"
                placeholder={t('jobWork') || "Work Type"}
                value={jobWork}
                onChange={(e) => setJobWork(e.target.value)}
                className="w-full bg-[#1E1E1E] text-white pl-9 pr-2 py-3 rounded-xl border border-[#333] focus:border-[var(--primary)] outline-none text-xs"
              />
            </motion.div>
          </div>
        </div>

        {/* CALCULATOR & PAYMENT */}
        <motion.div
          variants={item}
          className="bg-[#1E1E1E] p-4 rounded-2xl border border-[#333] shadow-lg"
        >
          <h2 className="text-[var(--primary)] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <FaCalculator size={10} /> {t('rentalCalculator')}
          </h2>

          {/* Price & Qty Row */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <label className="text-gray-500 text-[10px] font-bold mb-1 block">RATE</label>
              <input
                type="number"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#121212] text-white px-3 py-2 rounded-lg border border-[#333] focus:border-[var(--primary)] outline-none font-bold text-sm"
              />
            </div>

            <div className="flex-1">
              <label className="text-gray-500 text-[10px] font-bold mb-1 block">
                QTY ({rentType})
              </label>
              <input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#121212] text-white px-3 py-2 rounded-lg border border-[#333] focus:border-[var(--primary)] outline-none font-bold text-sm"
              />
            </div>
          </div>

          {/* TOTAL BILL (Center) */}
          <div className="text-center mb-5 pb-5 border-b border-[#333]">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Total Bill Amount</p>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              ₹ {total || 0}
            </div>
          </div>

          {/* PAYMENT SPLIT (Clean Inputs - No Boxes) */}
          {total > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {/* PAID */}
              <div>
                <label className="text-green-500 text-[10px] font-bold mb-1 block uppercase tracking-wider">
                  Paid Amount
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-2 text-green-600 font-bold">₹</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={handlePaidAmountChange}
                    className="w-full bg-transparent text-green-500 pl-4 py-2 border-b border-[#333] focus:border-green-500 outline-none font-bold text-lg placeholder-green-900"
                  />
                </div>
              </div>

              {/* PENDING */}
              <div>
                <label className="text-red-500 text-[10px] font-bold mb-1 block uppercase tracking-wider">
                  Pending Due
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-2 text-red-600 font-bold">₹</span>
                  <input
                    type="number"
                    value={pendingAmount}
                    onChange={handlePendingAmountChange}
                    className="w-full bg-transparent text-red-500 pl-4 py-2 border-b border-[#333] focus:border-red-500 outline-none font-bold text-lg placeholder-red-900"
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

      </motion.div>

      {/* 3. SLEEK SUBMIT BUTTON (Reduced Size) */}
      <div className="p-4 bg-[#121212] sticky bottom-0 border-t border-[#222]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          // Changed: h-12 (standard touch size), simple text-sm font
          className="w-full h-12 rounded-full font-bold text-sm shadow-lg flex items-center justify-center gap-2 text-black bg-[var(--primary)] active:bg-yellow-600 transition-colors"
        >
          <FaSave /> {t('submitEntry') || "SAVE ENTRY"}
        </motion.button>
      </div>

    </div>
  );
};

export default StartEntry;