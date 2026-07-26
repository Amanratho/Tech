
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { toast } from "../../utils/toastService";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { cleanStringInput, cleanNumberInput, blockInvalidNumberKeys } from "../../utils/inputValidation";
import { Capacitor } from "@capacitor/core";
import { Contacts } from "@capacitor-community/contacts";
import {
  FaChevronLeft,
  FaUser,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaHardHat,
  FaWrench,
  FaCalculator,
  FaCheckCircle,
  FaSave,
  FaAddressBook
} from "react-icons/fa";

const StartEntry = () => {
  const { t, i18n } = useTranslation();
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

  const [setReminder, setSetReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");

  // Today's date in YYYY-MM-DD for min attribute on date picker
  const today = new Date().toISOString().split("T")[0];

  // Validated reminder date handler — blocks past dates
  const handleReminderDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate < today) {
      setReminderDate("");
      toast.warn(t('reminderPastDateError') || "Reminder date cannot be in the past", { theme: "light" });
      return;
    }
    setReminderDate(selectedDate);
  };

  // --- LOGIC: CALCULATION ---
  useEffect(() => {
    if (rentType && price && quantity) {
      handleCalculate();
    }
  }, [rentType, price, quantity]);


  useEffect(() => {
    if (!rentType) return;

    if (rentType === "Hour") {
      const savedTime = localStorage.getItem("rentveda_pending_time_entry");
      if (savedTime) {

        const totalSeconds = Number(savedTime);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        const formattedQuantity = `${hours}.${minutes.toString().padStart(2, '0')}`;

        setQuantity(formattedQuantity);

        toast.info(`⏳ ${hours} ${t('trackerHr') || 'hr'} ${minutes} ${t('trackerMin') || 'min'} ${t('trackerAutoFilled') || 'auto-filled from Tracker!'}`, { theme: "light" });

        localStorage.removeItem("rentveda_pending_time_entry");
      }
    }
    else {
      const savedCount = localStorage.getItem("rentveda_pending_count_entry");
      if (savedCount) {
        setQuantity(savedCount);
        toast.info(`🔢 ${t('trackerCountAutoFilled') || 'Count'} (${savedCount}) ${t('trackerAutoFilled') || 'auto-filled from Tracker!'}`, { theme: "light" });

        localStorage.removeItem("rentveda_pending_count_entry");
      }
    }
  }, [rentType]);

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
    const cleanValue = cleanNumberInput(e.target.value);
    const paid = Number(cleanValue) || 0;
    const validPaidAmount = Math.min(paid, total || 0);
    setPaidAmount(validPaidAmount);
    setPendingAmount((total || 0) - validPaidAmount);
  };

  const handlePendingAmountChange = (e) => {
    const cleanValue = cleanNumberInput(e.target.value);
    const pending = Number(cleanValue) || 0;
    const validPendingAmount = Math.min(pending, total || 0);
    setPendingAmount(validPendingAmount);
    setPaidAmount((total || 0) - validPendingAmount);
  };

  const fetchCustomerByMobile = async (mobile, isFromContactPicker = false) => {
    const uid = localStorage.getItem("uid");
    if (!uid) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/rentals/customer/${mobile}`,
        { params: { uid } }
      );
      if (response.data) { 
        setCustomerName(response.data.customerName);
        setAddress(response.data.address);
        setIsCustomerFound(true);
        toast.success(t('existingCustomerFound') || "Existing Customer Found!", { theme: "light" });
      }
    } catch { 
      if (!isFromContactPicker) {
        setCustomerName("");
      }
      setAddress("");  
    }
  };

  const handleMobileNumberChange = async (e) => { 
    const mobile = e.target.value.replace(/\D/g, "");
    setMobileNumber(mobile);
    setIsCustomerFound(false);
    if (!customerMobile || customerMobile === mobileNumber) {
      setCustomerMobile(mobile);
    }
    if (mobile.length === 10) {
      fetchCustomerByMobile(mobile);
    }
  };


  const handleContactPicker = async () => { 
    const currentLang = i18n.language?.startsWith("hi") ? "hi" : "en";

    // ─── WEB FALLBACK: if running in a normal browser (not Capacitor) ───
    if (!Capacitor.isNativePlatform()) {
      // Try the Web Contact Picker API (Chrome Android only)
      if (!navigator.contacts || !navigator.contacts.select) {
        toast.warn(
          currentLang === "hi"
            ? "इस ब्राउज़र पर कॉन्टैक्ट पिकर उपलब्ध नहीं है। कृपया मैनुअली भरें।"
            : (t('contactPickerUnsupported') || "Contact Picker is not supported on this browser. Please enter manually."),
          { theme: "light" }
        );
        return;
      }
      try {
        const contacts = await navigator.contacts.select(
          ["name", "tel"],
          { multiple: false }
        );
        if (!contacts || contacts.length === 0) return;
        const contact = contacts[0];
        const name = Array.isArray(contact.name) && contact.name.length > 0
          ? contact.name[0]
          : typeof contact.name === "string" ? contact.name : "";
        const rawTel = Array.isArray(contact.tel) && contact.tel.length > 0
          ? contact.tel[0]
          : typeof contact.tel === "string" ? contact.tel : "";
        const cleanedTel = rawTel.replace(/[^\d]/g, "").slice(-10);
        if (name) setCustomerName(name);
        if (cleanedTel) {
          setMobileNumber(cleanedTel);
          setCustomerMobile(cleanedTel);
          setIsCustomerFound(false);
          if (cleanedTel.length === 10) fetchCustomerByMobile(cleanedTel, true);
        }
        console.log("[ContactPicker] Web: Selected ->", { name, phone: cleanedTel });
        toast.success(
          `${t('contactImported') || 'Contact'} "${name}" ${t('contactImportedSuffix') || 'imported!'}`,
          { theme: "light" }
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error(
            currentLang === "hi"
              ? "कॉन्टैक्ट लोड करने में समस्या हुई।"
              : (t('contactPickerError') || "Could not open contact picker."),
            { theme: "light" }
          );
        }
      }
      return;
    }

    // ─── NATIVE CAPACITOR PATH (Android) ───
    try {
      // Step 1 & 2: Platform check and check current state first
      const rawCheck = await Contacts.checkPermissions();
      console.log("[ContactPicker] RAW checkPermissions response:", JSON.stringify(rawCheck));
      
      let finalStatus = rawCheck.contacts;

      // Step 3 & 4: Request only if needed, with fallback/safety checks
      if (finalStatus !== "granted") {
        console.log("[ContactPicker] Status is not granted, requesting permission...");
        const rawRequest = await Contacts.requestPermissions();
        console.log("[ContactPicker] RAW requestPermissions response:", JSON.stringify(rawRequest));
        finalStatus = rawRequest.contacts;
      }

      // If still not granted after request, show denial message
      if (finalStatus !== "granted") {
        console.warn(`[ContactPicker] Permission still denied. Status: ${finalStatus}`);
        alert(
          currentLang === "hi"
            ? "कृपया सेटिंग्स में जाकर कॉन्टैक्ट की अनुमति दें।\n\nSettings > Apps > RentVeda > Permissions > Contacts"
            : "Please allow Contact permission from Settings.\n\nSettings > Apps > RentVeda > Permissions > Contacts"
        );
        return;
      }

      // Step 5: Execution (Permission granted)
      console.log("[ContactPicker] Permission granted! Opening native picker...");
      const result = await Contacts.pickContact({
        projection: {
          name: true,
          phones: true,
        },
      });

      // Step 5: Validate result
      if (!result || !result.contact) {
        console.log("[ContactPicker] User cancelled or no contact returned.");
        return;
      }
      const contact = result.contact;

      // Step 6: Extract name (display name > given name > family name)
      const name =
        contact.name?.display ||
        contact.name?.given ||
        contact.name?.family ||
        "";

      // Step 7: Extract & clean phone number (strip spaces, dashes, +91 country code)
      const rawPhone =
        contact.phones && contact.phones.length > 0
          ? contact.phones[0].number || ""
          : "";
      const cleanedTel = rawPhone.replace(/[^\d]/g, "").slice(-10);

      // Step 8: Log selected contact
      console.log("[ContactPicker] Native: Selected ->", {
        name,
        rawPhone,
        cleanedPhone: cleanedTel,
        contactId: contact.contactId,
      });

      // Step 9: Update React state
      if (name) setCustomerName(name);
      if (cleanedTel) {
        setMobileNumber(cleanedTel);
        setCustomerMobile(cleanedTel);
        setIsCustomerFound(false);
        if (cleanedTel.length === 10) {
          fetchCustomerByMobile(cleanedTel, true);
        }
      }

      toast.success(
        `${t('contactImported') || 'Contact'} "${name}" ${t('contactImportedSuffix') || 'imported!'}`,
        { theme: "light" }
      );
    } catch (err) {
      console.error("[ContactPicker] Error:", err);

      // Distinguish user cancellation from real errors
      const errMsg = err?.message || err?.toString() || "";
      if (
        errMsg.includes("canceled") ||
        errMsg.includes("cancelled") ||
        errMsg.includes("RESULT_CANCELED")
      ) {
        // User just tapped "back" on the picker — silently ignore
        console.log("[ContactPicker] User cancelled the picker.");
        return;
      }

      // Real error — show bilingual fallback alert with exact error message
      toast.error(
        currentLang === "hi"
          ? `कॉन्टैक्ट पिकर खोलने में त्रुटि: ${errMsg}`
          : `Could not open contact picker: ${errMsg}`,
        { theme: "light" }
      );
    }
  };

  // --- LOGIC: SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !mobileNumber || !price || !quantity) {
      toast.error(t('fillAllFields') || "Please fill all required fields.");
      return;
    }

    if (setReminder && !reminderDate) {
      toast.error(t('selectReminderDate') || "Please select a reminder date.");
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
      reminderDate: setReminder ? reminderDate : undefined,
      reminderStatus: setReminder ? "PENDING" : undefined,
      customerMobile: setReminder ? (customerMobile || mobileNumber) : undefined,
    };

    try {
      await axios.post(
        `${API_BASE_URL}/api/rentals/add-entry`,
        entryData
      );
      toast.success(t('entrySaved') || "Entry saved!");
      navigate("/invoice", { state: { entryData, machineName } });
      resetForm();
    } catch (error) {
      toast.error((t('entryError') || "Error: ") + (error.response?.data?.message || error.message));
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
    setSetReminder(false);
    setReminderDate("");
    setCustomerMobile("");
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
    <div className="bg-[var(--bg-main)] min-h-screen flex flex-col pb-20 relative">

      {/* 1. APP HEADER */}
      <div className="sticky top-0 z-30 bg-[var(--bg-main)] border-b border-[var(--border-color)] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full active:bg-[var(--bg-input)] text-[var(--text-main)]"
        >
          <FaChevronLeft />
        </button>
        <div>
          <h1 className="text-[var(--text-main)] text-lg font-bold tracking-wide">
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
          <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest pl-1">
            {t('rentalDetails') || "CUSTOMER DETAILS"}
          </h2>

          <motion.div variants={item} className="relative group flex items-center gap-2">
            {/* Mobile number input */}
            <div className="relative flex-1">
              <div className="absolute top-3.5 left-4 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] pointer-events-none">
                <FaPhoneAlt size={14} />
              </div>
              <input
                type="tel"
                maxLength={10}
                placeholder={t('enterMobileNumber') || "Mobile Number"}
                value={mobileNumber}
                onChange={handleMobileNumberChange}
                className="w-full bg-white text-[var(--text-main)] pl-11 pr-10 py-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--primary)] outline-none text-sm font-medium tracking-wide transition-all"
              />
              {isCustomerFound && (
                <div className="absolute top-3.5 right-3 text-green-500 animate-bounce">
                  <FaCheckCircle size={16} />
                </div>
              )}
            </div>

            {/* Contact Book Button */}
            <button
              type="button"
              onClick={handleContactPicker}
              title={t('importFromContacts') || "Import from Contacts"}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-white border border-[var(--border-color)] flex items-center justify-center text-[var(--primary)] active:bg-[var(--bg-input)] hover:border-[var(--primary)] transition-all"
            >
              <FaAddressBook size={16} />
            </button>
          </motion.div>

          <motion.div variants={item} className="relative group">
            <div className="absolute top-3.5 left-4 text-[var(--text-muted)] group-focus-within:text-[var(--primary)]">
              <FaUser size={14} />
            </div>
            <input
              type="text"
              placeholder={t('enterCustomerName') || "Customer Name"}
              value={customerName}
              onChange={(e) => setCustomerName(cleanStringInput(e.target.value))}
              className="w-full bg-white text-[var(--text-main)] pl-11 pr-4 py-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--primary)] outline-none text-sm transition-all"
            />
          </motion.div>

          <motion.div variants={item} className="relative group">
            <div className="absolute top-3.5 left-4 text-[var(--text-muted)] group-focus-within:text-[var(--primary)]">
              <FaMapMarkerAlt size={14} />
            </div>
            <input
              type="text"
              placeholder={t('clientAddress') || "Address"}
              value={address}
              onChange={(e) => setAddress(cleanStringInput(e.target.value))}
              className="w-full bg-white text-[var(--text-main)] pl-11 pr-4 py-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--primary)] outline-none text-sm transition-all"
            />
          </motion.div>
        </div>

        {/* WORK DETAILS */}
        <div className="space-y-3">
          <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest pl-1">
            {t('jobWork') || "WORK DETAILS"}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <motion.div variants={item} className="relative">
              <div className="absolute top-3.5 left-3 text-[var(--text-muted)]">
                <FaHardHat size={12} />
              </div>
              <input
                type="text"
                placeholder={t('operatorName') || "Operator"}
                value={operatorName}
                onChange={(e) => setOperatorName(cleanStringInput(e.target.value))}
                className="w-full bg-white text-[var(--text-main)] pl-9 pr-2 py-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--primary)] outline-none text-xs"
              />
            </motion.div>

            <motion.div variants={item} className="relative">
              <div className="absolute top-3.5 left-3 text-[var(--text-muted)]">
                <FaWrench size={12} />
              </div>
              <input
                type="text"
                placeholder={t('jobWork') || "Work Type"}
                value={jobWork}
                onChange={(e) => setJobWork(cleanStringInput(e.target.value))}
                className="w-full bg-white text-[var(--text-main)] pl-9 pr-2 py-3 rounded-xl border border-[var(--border-color)] focus:border-[var(--primary)] outline-none text-xs"
              />
            </motion.div>
          </div>
        </div>

        {/* CALCULATOR & PAYMENT */}
        <motion.div
          variants={item}
          className="bg-white p-4 rounded-2xl border border-[var(--border-color)] shadow-lg"
        >
          <h2 className="text-[var(--primary)] text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <FaCalculator size={10} /> {t('rentalCalculator')}
          </h2>

          {/* Price & Qty Row */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <label className="text-[var(--text-muted)] text-[10px] font-bold mb-1 block">{t('rateLabel') || "RATE"}</label>
              <input
                type="number"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(cleanNumberInput(e.target.value))}
                onKeyDown={blockInvalidNumberKeys}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2 rounded-lg border border-[var(--border-color)] focus:border-[var(--primary)] outline-none font-bold text-sm"
              />
            </div>

            <div className="flex-1">
              <label className="text-[var(--text-muted)] text-[10px] font-bold mb-1 block">
                {t('qtyLabel') || "QTY"} ({rentType})
              </label>
              <input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(cleanNumberInput(e.target.value))}
                onKeyDown={blockInvalidNumberKeys}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2 rounded-lg border border-[var(--border-color)] focus:border-[var(--primary)] outline-none font-bold text-sm"
              />
            </div>
          </div>

          {/* TOTAL BILL (Center) */}
          <div className="text-center mb-5 pb-5 border-b border-[var(--border-color)]">
            <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-1">{t('totalBillAmount') || "Total Bill Amount"}</p>
            <div className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
              ₹ {total || 0}
            </div>
          </div>

          {/* PAYMENT SPLIT (Clean Inputs - No Boxes) */}
          {total > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* PAID */}
                <div>
                  <label className="text-green-500 text-[10px] font-bold mb-1 block uppercase tracking-wider">
                    {t('paidAmount') || "Paid Amount"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-0 top-2 text-green-600 font-bold">₹</span>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={handlePaidAmountChange}
                      onKeyDown={blockInvalidNumberKeys}
                      className="w-full bg-transparent text-green-500 pl-4 py-2 border-b border-[var(--border-color)] focus:border-green-500 outline-none font-bold text-lg placeholder-green-900"
                    />
                  </div>
                </div>

                {/* PENDING */}
                <div>
                  <label className="text-red-500 text-[10px] font-bold mb-1 block uppercase tracking-wider">
                    {t('pendingDue') || "Pending Due"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-0 top-2 text-red-600 font-bold">₹</span>
                    <input
                      type="number"
                      value={pendingAmount}
                      onChange={handlePendingAmountChange}
                      onKeyDown={blockInvalidNumberKeys}
                      className="w-full bg-transparent text-red-500 pl-4 py-2 border-b border-[var(--border-color)] focus:border-red-500 outline-none font-bold text-lg placeholder-red-900"
                    />
                  </div>
                </div>
              </div>

              {/* REMINDER SECTION */}
              {pendingAmount > 0 && (
                <div className="pt-5 border-t border-[var(--border-color)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[var(--text-main)] text-xs font-bold">{t('setPaymentReminder') || "Set Payment Reminder"}</h4>
                      <p className="text-[10px] text-[var(--text-muted)]">{t('reminderNotifyText') || "Get notified when follow-up is due"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSetReminder(!setReminder);
                        if (!customerMobile) {
                          setCustomerMobile(mobileNumber);
                        }
                      }}
                      className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${setReminder ? "bg-[var(--primary)]" : "bg-gray-300"
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-black transition-all duration-300 ${setReminder ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {setReminder && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[var(--text-muted)] text-[10px] font-bold mb-1 block uppercase tracking-wider">
                              {t('reminderModalDateLabel') || "Reminder Date"}
                            </label>
                            <input
                              type="date"
                              value={reminderDate}
                              min={today}
                              onChange={handleReminderDateChange}
                              className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2 rounded-lg border border-[var(--border-color)] focus:border-[var(--primary)] outline-none text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="text-[var(--text-muted)] text-[10px] font-bold mb-1 block uppercase tracking-wider">
                              {t('smsMobileLabel') || "SMS Mobile (Optional)"}
                            </label>
                            <input
                              type="tel"
                              maxLength={10}
                              value={customerMobile}
                              onChange={(e) => setCustomerMobile(e.target.value)}
                              placeholder={t('smsMobilePlaceholder') || "SMS Mobile"}
                              className="w-full bg-[var(--bg-main)] text-[var(--text-main)] px-3 py-2 rounded-lg border border-[var(--border-color)] focus:border-[var(--primary)] outline-none text-xs font-semibold"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </motion.div>

      </motion.div>

      {/* 3. SLEEK SUBMIT BUTTON (Reduced Size) */}
      <div className="p-4 bg-[var(--bg-main)] sticky bottom-0 border-t border-[var(--border-color)]">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full h-12 rounded-full font-bold text-sm shadow-lg flex items-center justify-center gap-2 text-black bg-[var(--primary)] active:bg-yellow-600 transition-colors"
        >
          <FaSave /> {t('submitEntry') || "SAVE ENTRY"}
        </motion.button>
      </div>

    </div>
  );
};

export default StartEntry;