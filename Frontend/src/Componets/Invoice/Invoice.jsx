import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { openWhatsApp } from "../../utils/capacitorLinks";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowLeft, 
  FaFileInvoiceDollar, 
  FaWhatsapp, 
  FaQrcode,
  FaCheckCircle,
  FaExclamationCircle,
  FaLanguage,
  FaTimes
} from "react-icons/fa";

const Invoice = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  
  // Modal State & Print State
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [pdfLang, setPdfLang] = useState("en");

  const location = useLocation();
  const { entryData, machineName } = location.state || {};

  useEffect(() => {
    const fetchUserProfile = async () => {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        toast.error("User ID not found. Please log in again.");
        window.location.href = "/login";
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${uid}`);
        setUser(response.data);
      } catch (error) {
        toast.error("Failed to fetch user profile");
      }
    };
    fetchUserProfile();
  }, []);

  if (!entryData) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-muted)] text-sm">
        No data found! Please fill the form first.
      </div>
    );
  }

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()}`;
  const totalAmountVal = entryData.paidAmount + entryData.pendingAmount;

  // App ka current URL automatically nikalne ke liye
  const currentAppUrl = window.location.origin;

  // ==========================================
  // PERFECT HINDI PDF LOGIC USING HTML2CANVAS
  // ==========================================
  const triggerDownload = async (lang) => {
    setPdfLang(lang);
    setIsLangModalOpen(false);
    // TODO: Uncomment later if notifications are required here.
    // toast.info(lang === "hi" ? "इनवॉइस बन रहा है, कृपया प्रतीक्षा करें..." : "Generating & Uploading Invoice...");

    // TODO: Uncomment later if notifications are required here.
    // The setTimeout below was only needed to let the toast render before the heavy
    // html2canvas work blocked the main thread. Removing it for instant response.
    // setTimeout(async () => {
    try {
        const element = document.getElementById("hidden-pdf-template");
        
        // FIX: Explicitly sizing the canvas to standard A4 ratio
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            width: 794,
            height: 1123,
            scrollY: 0,
            windowHeight: 1123
        });
        
        const imgData = canvas.toDataURL("image/png");

        // 1. Download PDF Locally
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${entryData.customerName}_Invoice.pdf`); 

        // 2. Upload to Cloudinary & Send WhatsApp
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("file", blob, "invoice.png");
          formData.append("upload_preset", "pdf_uploads"); // Make sure this is correct in Cloudinary
          formData.append("folder", "invoices");

          const cloudinaryResponse = await axios.post("https://api.cloudinary.com/v1_1/dhflsyxxy/image/upload", formData);
          let pdfUrl = cloudinaryResponse.data.secure_url;
          
          // Force download format for Cloudinary
          let downloadUrl = pdfUrl.replace("/upload/", "/upload/fl_attachment/");
          let pngUrl = downloadUrl.replace(".pdf", ".png");

          const greeting = lang === "hi" ? "नमस्ते" : "Hello";
          const bodyText = lang === "hi" 
            ? `यहाँ ${user?.companyName || "हमारी कंपनी"} से आपका इनवॉइस लिंक है: ${pngUrl}\n\nकुल बकाया राशि: ₹${entryData.pendingAmount}`
            : `Here is your invoice link from ${user?.companyName || "our company"}: ${pngUrl}\n\nTotal Due: ₹${entryData.pendingAmount}`;

          // 🔥 BUG FIX: 100% Reliable WhatsApp Mobile Deep Link
          // Uses @capacitor/browser to escape WebView on Android APK
          const whatsappMessage = `${greeting} ${entryData.customerName},\n${bodyText}`;

          await openWhatsApp(entryData.mobileNumber, whatsappMessage);
          
        }, "image/png");

      } catch (error) {
        console.error("Upload/WA Error: ", error);
        toast.error("Failed to generate or upload Invoice.");
      }
    // }, 500); // <-- setTimeout closing brace (commented out with the opener above)
  };

  return (
    // FIX 1: Added pb-40 so the page can scroll completely above the button
    <div className="bg-[var(--bg-main)] min-h-screen pb-40 relative overflow-hidden text-[var(--text-main)] font-sans">
      
      {/* 1. STICKY HEADER FOR MOBILE UI */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[var(--border-color)] mt-16 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1">
            <FaArrowLeft size={14} />
          </button>
          <h2 className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
            {t("invoice") || "INVOICE SUMMARY"}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10px]">
          <FaFileInvoiceDollar size={12} className="text-[var(--primary)]" /> #{Date.now().toString().slice(-6)}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4 max-w-lg mx-auto">
        
        {/* MOBILE UI - CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-3 rounded-xl border border-[var(--border-color)]">
            <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">From</p>
            <h3 className="text-sm font-bold text-[var(--text-main)] leading-tight">{user?.companyName || t("companyName")}</h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{user?.username || "Loading..."}</p>
            <p className="text-[10px] text-[var(--text-muted)]">+91 {user?.mobileNo || "---"}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-3 rounded-xl border border-[var(--border-color)]">
            <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">Bill To</p>
            <h3 className="text-sm font-bold text-[var(--primary)] leading-tight">{entryData.customerName}</h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-1 truncate">{entryData.address || "No Address"}</p>
            <p className="text-[10px] text-[var(--text-muted)]">+91 {entryData.mobileNumber}</p>
          </motion.div>
        </div>

        {/* WORK DETAILS */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-[var(--border-color)] overflow-hidden">
          <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-main)]/50 flex justify-between items-center">
            <span className="text-xs font-bold text-[var(--text-muted)]">Job Details</span>
            <span className="text-[10px] text-[var(--text-muted)]">{formattedDate}</span>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <p className="text-sm font-bold text-[var(--text-main)]">{machineName || "Machine"}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Job: {entryData.jobWork || "---"} • Op: {entryData.operatorName || "---"}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-[var(--border-color)]">
              <div className="text-center">
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Work</p>
                <p className="text-xs font-bold mt-0.5">{entryData.quantity} {entryData.rentType}</p>
              </div>
              <div className="text-center border-l border-r border-[var(--border-color)]">
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Rate</p>
                <p className="text-xs font-bold mt-0.5">₹{entryData.price}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-[var(--text-muted)] uppercase">Amount</p>
                <p className="text-xs font-bold mt-0.5">₹{totalAmountVal}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <div className="flex items-center gap-1.5 text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded-md">
                <FaCheckCircle size={10} /> Paid: ₹{entryData.paidAmount}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded-md">
                <FaExclamationCircle size={10} /> Due: ₹{entryData.pendingAmount}
              </div>
            </div>
          </div>
        </motion.div>

        {/* TOTAL AMOUNT & QR */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
          <div className="w-1/3 bg-white rounded-xl border border-[var(--border-color)] flex flex-col items-center justify-center p-2">
            {user?.qrCodeUrl ? (
              <img src={user.qrCodeUrl} alt="QR" className="w-full h-full object-contain rounded-lg bg-white p-1 mb-1" />
            ) : (
              <FaQrcode size={24} className="mb-1 text-[var(--text-muted)]" />
            )}
            <p className="text-[8px] text-[var(--text-muted)] uppercase font-bold text-center">Scan to Pay</p>
          </div>
          <div className="w-2/3 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-[var(--border-color)] p-4 flex flex-col justify-center relative overflow-hidden shadow-[var(--shadow-card)]">
            <div className="absolute right-0 top-0 w-16 h-16 bg-[var(--primary)]/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">Grand Total</p>
            <h1 className="text-3xl font-extrabold text-[var(--primary)] tracking-tight">₹{totalAmountVal.toLocaleString()}</h1>
          </div>
        </motion.div>
      </div>

      {/* FIX 2: Moved button UP using bottom-[75px] so it avoids Bottom Nav overlap */}
      <div className="fixed bottom-[75px] left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)] to-transparent z-30 pointer-events-none">
        <button
          onClick={() => setIsLangModalOpen(true)}
          className="pointer-events-auto w-full max-w-lg mx-auto bg-green-500 hover:bg-green-600 text-[var(--text-main)] py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <FaWhatsapp size={18} />
          {t("downloadSharePDF") || "Generate PDF & Share"}
        </button>
      </div>

      {/* LANGUAGE SELECTION MODAL */}
      <AnimatePresence>
        {isLangModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    className="bg-white w-full max-w-sm rounded-3xl p-6 border border-[var(--border-color)] mb-4 sm:mb-0"
                >
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-2 text-[var(--text-main)] font-bold">
                            <FaLanguage size={18} className="text-[var(--primary)]" /> Select Language
                        </div>
                        <button onClick={() => setIsLangModalOpen(false)} className="text-[var(--text-muted)] p-1"><FaTimes /></button>
                    </div>
                    <div className="space-y-3">
                        <button onClick={() => triggerDownload("en")} className="w-full py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--primary)] text-[var(--text-main)] rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2">
                            English Invoice
                        </button>
                        <button onClick={() => triggerDownload("hi")} className="w-full py-3.5 bg-[var(--primary)] text-black rounded-xl font-bold text-sm shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                            हिंदी इनवॉइस (Hindi)
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* =======================================================
          HIDDEN HTML TEMPLATE FOR PDF GENERATION (OPTIMIZED SIZES)
          ======================================================= */}
      <div className="absolute top-0 left-[-5000px] z-[-1]">
        <div id="hidden-pdf-template" className="bg-white text-black font-sans relative" style={{ width: '794px', height: '1123px', padding: '40px', boxSizing: 'border-box' }}>
          
          {/* COMPACT Header */}
          <div className="bg-white text-[var(--text-main)] px-6 py-5 rounded-t-xl flex justify-between items-center border-b-4 border-[var(--primary)]">
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--primary)] mb-1 uppercase tracking-wide">{user?.companyName || "COMPANY NAME"}</h1>
              <p className="text-[var(--text-muted)] text-sm">{user?.username || "Owner Name"}</p>
              <p className="text-[var(--text-muted)] text-sm">+91 {user?.mobileNo || "N/A"}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-widest mb-1">
                {pdfLang === "hi" ? "बिल (BILL)" : "INVOICE"}
              </h2>
              <p className="text-[var(--text-muted)] text-xs tracking-wide">Original Copy</p>
            </div>
          </div>

          {/* Details Row (Compact margins) */}
          <div className="flex justify-between items-start mt-6 px-2">
            <div className="w-1/2">
              <p className="text-[var(--text-muted)] font-bold text-xs mb-1">{pdfLang === "hi" ? "बिल किसको (Bill To):" : "Bill To:"}</p>
              <h2 className="text-xl font-bold text-[#1E1E1E] mb-1">{entryData.customerName}</h2>
              <p className="text-sm text-gray-700">+91 {entryData.mobileNumber}</p>
              <p className="text-sm text-gray-700 mt-1 max-w-[250px] leading-snug">{entryData.address}</p>
            </div>
            <div className="w-1/2 text-right">
              <div className="mb-2">
                <p className="text-[var(--text-muted)] font-bold text-sm inline-block mr-2">{pdfLang === "hi" ? "दिनांक (Date):" : "Date:"}</p>
                <span className="text-base font-bold text-[#1E1E1E]">{formattedDate}</span>
              </div>
              <div>
                <p className="text-[var(--text-muted)] font-bold text-sm inline-block mr-2">{pdfLang === "hi" ? "इनवॉइस नंबर:" : "Invoice No:"}</p>
                <span className="text-base font-bold text-[#1E1E1E]">#INV-{Date.now().toString().slice(-5)}</span>
              </div>
            </div>
          </div>

          {/* Job Details Bar */}
          <div className="bg-[#F5F5F5] rounded-lg p-4 mt-6 flex justify-between items-center border border-gray-200">
            <div>
              <p className="text-xs text-[var(--text-muted)] font-bold mb-1">{pdfLang === "hi" ? "मशीन (Machine)" : "Machine"}</p>
              <p className="text-lg font-bold text-black">{machineName || "N/A"}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[var(--text-muted)] font-bold mb-1">{pdfLang === "hi" ? "कार्य (Job Work)" : "Job Work"}</p>
              <p className="text-lg font-bold text-black">{entryData.jobWork || "N/A"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)] font-bold mb-1">{pdfLang === "hi" ? "ऑपरेटर (Operator)" : "Operator"}</p>
              <p className="text-lg font-bold text-black">{entryData.operatorName || "N/A"}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full mt-6 border-collapse">
            <thead>
              <tr className="bg-[var(--primary)] text-black">
                <th className="py-3 px-4 text-left font-bold text-sm">{pdfLang === "hi" ? "विवरण (Description)" : "Description"}</th>
                <th className="py-3 px-4 text-center font-bold text-sm">{pdfLang === "hi" ? `मात्रा (${entryData.rentType})` : `Qty (${entryData.rentType})`}</th>
                <th className="py-3 px-4 text-center font-bold text-sm">{pdfLang === "hi" ? "दर (Rate)" : "Rate"}</th>
                <th className="py-3 px-4 text-right font-bold text-sm">{pdfLang === "hi" ? "कुल राशि (Amount)" : "Amount"}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 text-base font-semibold text-gray-800">{pdfLang === "hi" ? "मशीन किराया शुल्क" : "Machine Rental Charges"}</td>
                <td className="py-4 px-4 text-center text-base">{entryData.quantity}</td>
                <td className="py-4 px-4 text-center text-base">Rs {entryData.price}</td>
                <td className="py-4 px-4 text-right text-base font-bold">Rs {totalAmountVal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Bottom Summary Section */}
          <div className="flex justify-between items-start mt-8">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              {user?.qrCodeUrl ? (
                <>
                  <img src={user.qrCodeUrl} alt="QR" className="w-28 h-28 object-contain border border-gray-200 rounded-lg p-1" crossOrigin="anonymous" />
                  <p className="text-[var(--text-muted)] font-bold mt-1 text-xs">{pdfLang === "hi" ? "भुगतान के लिए स्कैन करें" : "Scan to Pay"}</p>
                </>
              ) : (
                <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-[var(--text-muted)] text-xs">No QR</div>
              )}
            </div>

            {/* Total Box */}
            <div className="bg-[#F5F5F5] rounded-xl p-5 w-72 border border-gray-200">
              <div className="flex justify-between mb-2">
                <p className="text-[var(--text-muted)] font-bold text-sm">{pdfLang === "hi" ? "जमा राशि (Paid):" : "Paid Amount:"}</p>
                <p className="text-green-600 font-bold text-sm">Rs {entryData.paidAmount.toLocaleString()}</p>
              </div>
              <div className="flex justify-between mb-3">
                <p className="text-[var(--text-muted)] font-bold text-sm">{pdfLang === "hi" ? "बकाया राशि (Due):" : "Pending Due:"}</p>
                <p className="text-red-600 font-bold text-sm">Rs {entryData.pendingAmount.toLocaleString()}</p>
              </div>
              <div className="border-t border-gray-300 my-3"></div>
              <div className="flex justify-between items-center">
                <p className="text-gray-800 font-extrabold text-lg">{pdfLang === "hi" ? "कुल (Total):" : "Total:"}</p>
                <p className="text-[var(--primary)] font-black text-xl drop-shadow-sm">Rs {totalAmountVal.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* FIXED FOOTER POSITIONING */}
          <div className="absolute bottom-[40px] left-[40px] right-[40px] text-center border-t-2 border-gray-200 pt-5">
              <p className="text-[var(--text-muted)] font-bold text-lg mb-4">
              {pdfLang === "hi" ? "धन्यवाद! पुनः पधारें।" : "Thank you for your business!"}
              </p>
              {/* Promotion Banner */}
              <div className="bg-gray-100 inline-flex items-center justify-center gap-3 px-6 py-2.5 rounded-full border border-gray-300">
                <span className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-widest">Powered By</span>
                <span className="text-[#1E1E1E] font-black text-xl tracking-tight">Rent<span className="text-[var(--primary)]">Veda</span></span>
                <span className="text-[var(--text-muted)]">|</span>
                <span className="text-blue-600 font-bold text-sm">{currentAppUrl}</span>
              </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Invoice;