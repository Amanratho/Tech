// import React from "react";
// import { jsPDF } from "jspdf";
// import { useLocation } from "react-router-dom";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useTranslation } from "react-i18next";
// // import { b } from "framer-motion/client";

// const Invoice = () => {
//   const { t } = useTranslation();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       const uid = localStorage.getItem("uid");
//       if (!uid) {
//         toast.error("User ID not found. Please log in again.");
//         window.location.href = "/login";
//         return;
//       }

//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`
//         );
//         setUser(response.data);
//       } catch (error) {
//         toast.error("Failed to fetch user profile");
//       }
//     };

//     fetchUserProfile();
//   }, []);

//   const currentDate = new Date();

//   const day = currentDate.getDate();
//   const month = currentDate.getMonth() + 1;
//   const year = currentDate.getFullYear();

//   let hours = currentDate.getHours();
//   const minutes = currentDate.getMinutes().toString().padStart(2, "0");
//   const ampm = hours >= 12 ? "PM" : "AM";

//   hours = hours % 12 || 12;

//   const formattedDate = `${day}/${month}/${year}`;
//   const formattedTime = `${hours}:${minutes} ${ampm}`;

//   const location = useLocation();
//   const { entryData, machineName } = location.state || {};

//   if (!entryData) {
//     return <div>No data found! Please fill the form first.</div>;
//   }

//   const billData = [
//     {
//       hours: entryData.quantity,
//       price: entryData.price,
//       quantity: entryData.quantity,
//       operatorName: entryData.operatorName,
//       amount: entryData.paidAmount + entryData.pendingAmount,
//       paid: entryData.paidAmount,
//       pending: entryData.pendingAmount,
//       rentType: entryData.rentType,
//       jobwork: entryData.jobWork,
//     },
//   ];

//   const generatePDF = async () => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.width;
//     const margin = 20;

//     // Set Background Color (Gray-800)
//     doc.setFillColor(55, 65, 81); // Gray-800
//     doc.rect(0, 0, pageWidth, doc.internal.pageSize.height, "F");

//     // Add Title (Yellow-400)
//     doc.setFontSize(20);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(234, 179, 8); // Yellow-400
//     doc.text(`${user.companyName}`, pageWidth / 2, margin, { align: "center" });

//     // Company Info Section
//     doc.setFontSize(12);
//     doc.setFont("helvetica", "normal");
//     doc.setTextColor(255, 255, 255); // White
//     doc.text(`Date: ${formattedDate}`, margin, margin + 10);
//     doc.text(`Owner Name: ${user.username}`, margin, margin + 20);
//     doc.text(`Company Name: ${user.companyName}`, margin, margin + 30);
//     doc.text(`Phone No.: +91 ${user.mobileNo}`, margin, margin + 40);
//     entryData.operatorName &&
//       doc.text(`Operator Name: ${entryData.operatorName}`, margin, margin + 50);
   

//     let qrCodeImage;

//     // Check if user.qrCodeUrl exists and is a string
//     if (user?.qrCodeUrl?.startsWith?.("http")) {
//       try {
//         const response = await fetch(user.qrCodeUrl);
//         const blob = await response.blob();
//         const reader = new FileReader();

//         qrCodeImage = await new Promise((resolve, reject) => {
//           reader.onloadend = () => resolve(reader.result);
//           reader.onerror = reject;
//           reader.readAsDataURL(blob);
//         });
//       } catch (error) {
//         console.error("Failed to load QR code image:", error);
//         qrCodeImage = "No QR Code Uploaded"; // Default message
//       }
//     } else {
//       qrCodeImage = user?.qrCodeUrl || "No QR Code Uploaded"; // Default message
//     }

//     // Add QR Code Image
//     if (qrCodeImage) {
//       doc.text("Pay On", margin, margin + 155);
//       doc.addImage(qrCodeImage, "JPEG", 20, 180, 50, 50);
//     } else {
//       doc.setTextColor(239, 68, 68); // Red
//       doc.text("QR Code could not be loaded", 20, 180);
//     }

//     // Rest of the code remains unchanged...
//     // Add separator
//     doc.setLineWidth(0.5);
//     doc.setDrawColor(234, 179, 8); // Yellow-400
//     doc.line(margin, margin + 55, pageWidth - margin, margin + 55);

//     // Bill To Section
//     doc.setTextColor(255, 255, 255); // White
//     doc.text("Bill To:", margin, margin + 70);
//     doc.text(`Name : ${entryData.customerName}`, margin, margin + 80);
//     doc.text(`Address: ${entryData.address}`, margin, margin + 90);
//     doc.text(`Phone No.: ${entryData.mobileNumber}`, margin, margin + 100);
//     doc.text(`Machine Name : ${machineName}`, margin, margin + 110);
//     doc.text(`Job Work : ${entryData.jobWork}`, margin, margin + 115);
    
//     // Add Separator
//     doc.line(margin, margin + 120, pageWidth - margin, margin + 120);

//     // Rent Charges Table Header
//     const tableStartY = margin + 130;
//     doc.setFontSize(12);
//     doc.setTextColor(234, 179, 8); // Yellow-400
//     doc.text(`${entryData.rentType}`, margin, tableStartY);
//     doc.text(`Per / ${entryData.rentType}`, margin + 30, tableStartY);
//     doc.text(`Paid`, margin + 70, tableStartY);
//     doc.text(`Pending`, margin + 100, tableStartY);
//     doc.text("Amount", margin + 130, tableStartY);

//     // Table Rows
//     billData.forEach((bill, index) => {
//       const yPosition = tableStartY + (index + 1) * 10;

//       // Alternate Row Background
//       if (index % 2 === 0) {
//         doc.setFillColor(75, 85, 99); // Gray-600
//         doc.rect(
//           margin - 5,
//           yPosition - 5,
//           pageWidth - 2 * margin + 10,
//           10,
//           "F"
//         );
//       }

//       // Hours
//       doc.setTextColor(255, 255, 255); // White
//       doc.text(String(bill.hours), margin, yPosition);

//       // Price
//       doc.text(String(bill.price), margin + 30, yPosition);

//       // Paid
//       if (bill.paid > 0) {
//         doc.setTextColor(34, 197, 94); // Green-500
//       } else {
//         doc.setTextColor(239, 68, 68); // Red-500
//       }
//       doc.text(String(bill.paid), margin + 68, yPosition);

//       // Pending
//       if (bill.pending > 0) {
//         doc.setTextColor(250, 204, 21); // Yellow-500
//       } else {
//         doc.setTextColor(34, 197, 94); // Green-500
//       }
//       doc.text(String(bill.pending), margin + 104, yPosition);

//       // Amount
//       doc.setTextColor(255, 255, 255); // White
//       doc.text(String(bill.amount), margin + 130, yPosition);
//     });

//     // Final Total
//     const totalAmount = billData.reduce(
//       (total, bill) => total + bill.amount,
//       0
//     );
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(234, 179, 8); // Yellow-400
//     doc.text(
//       `Total: ${totalAmount}`,
//       margin,
//       tableStartY + (billData.length + 1) * 10
//     );

//     // PDF Output (Optional: Image conversion or saving)
//     const pdfImage = doc.output("dataurlstring", { format: "png", width: 800 });

//     // Convert dataurlstring to Blob
//     const base64Data = pdfImage.split(",")[1]; // Extract base64 part
//     const binaryData = atob(base64Data);
//     const arrayBuffer = new Uint8Array(binaryData.length);
//     for (let i = 0; i < binaryData.length; i++) {
//       arrayBuffer[i] = binaryData.charCodeAt(i);
//     }
//     const blob = new Blob([arrayBuffer], { type: "png" });

//     const formData = new FormData();
//     formData.append("file", blob, "invoice.png"); // Append Blob as file
//     formData.append("upload_preset", "pdf_uploads");
//     formData.append("folder", "invoices"); // Folder path for Cloudinary

//     try {
//       // Cloudinary par PNG upload karte hain
//       const response = await axios.post(
//         "https://api.cloudinary.com/v1_1/dhflsyxxy/image/upload",
//         formData
//       );

//       // Cloudinary se PNG ka URL mil gaya
//       let pdfUrl = response.data.secure_url;
//       let downloadUrl = pdfUrl.replace("/upload/", "/upload/fl_attachment/");
//       let pngUrl = downloadUrl
//         .replace("/upload/", "/upload/f_auto,q_auto/")
//         .replace(".pdf", ".png");

//       // alert("Invoice uploaded successfully!");
//       // console.log("Invoice URL:", pngUrl);

//       // Customer ko WhatsApp par message bhejna
//       const whatsappMessage = `Click on the link to view your invoice (Tech Diary): ${pngUrl}`;
//       const customerMobile = entryData.mobileNumber;

//       // WhatsApp link banate hain
//       const whatsappUrl = `https://wa.me/91${customerMobile}?text=${encodeURIComponent(
//         whatsappMessage
//       )}`;

//       doc.save(`${entryData.customerName} invoice.pdf`);
//       // Automatically WhatsApp link open karte hain
//       window.open(whatsappUrl, "_blank");
//       window.location.href = "/";
//       // window.location.href = whatsappUrl;
//     } catch (error) {
//       // console.error("Error uploading Invoice:", error);
//       // alert("Failed to upload Invoice to Cloudinary.");
//     }
//   };

//   return (
//     <div className="p-4 sm:p-6 mt-6 sm:mt-12 bg-gray-100 flex justify-center">
//     <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-4 sm:p-6">
     
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-red-600">{t("invoice")}</h1>
//           <p className="text-gray-500 text-sm sm:text-base">{t("date")}: {formattedDate}</p>
//         </div>
//         <div className="text-left sm:text-right mt-2 sm:mt-0">
//           <h2 className="text-base sm:text-lg font-bold text-gray-700">
//             {user?.companyName || t("companyName")}
//           </h2>
//           <p className="text-gray-500 text-sm">{t("owner")}: {user?.username || "Loading..."}</p>
//           <p className="text-gray-500 text-sm">{t("contact")}: +91 {user?.mobileNo || "Loading..."}</p>
//         </div>
//       </div>

     
//       <div className="mt-4">
//         <h2 className="text-lg sm:text-xl font-bold text-gray-700">{t("billTo")}:</h2>
//         <p className="text-gray-600 text-sm sm:text-base">{t("name")}: <b>{entryData.customerName}</b></p>
//         <p className="text-gray-600 text-sm sm:text-base">{t("address")}: <b>{entryData.address}</b></p>
//         <p className="text-gray-600 text-sm sm:text-base">{t("contact")}: <b>{entryData.mobileNumber}</b></p>
//       </div>

     
//       <div className="mt-4 sm:mt-6 border rounded-lg overflow-auto">
//         <table className="w-full border-collapse text-xs sm:text-sm">
//           <thead className="bg-gray-800 text-white">
//             <tr>
//               <th className="p-2">{t("machineName")}</th>
//               <th className="p-2">{t("operator")}</th>
//               <th className="p-2">{t("jobWork")}</th>
//               <th className="p-2">{entryData.rentType}</th>
//               <th className="p-2">{t("price")}</th>
//               <th className="p-2 text-red-500">{t("pending")}</th>
//               <th className="p-2 text-green-500">{t("paid")}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {billData.map((item, index) => (
//               <tr key={index} className="border-b text-center">
//                 <td className="p-2">{machineName || "---"}</td>
//                 <td className="p-2">{item.operatorName || "---"}</td>
//                 <td className="p-2">{item.jobwork || "---"}</td>
//                 <td className="p-2">{item.quantity || "0"}</td>
//                 <td className="p-2">₹ {item.price || "0"}</td>
//                 <td className="p-2 text-red-600">₹ {item.pending || "0"}</td>
//                 <td className="p-2 text-green-600">₹ {item.paid || "0"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

   
//       <div className="mt-4 sm:mt-6">
//         <h2 className="text-base sm:text-lg font-bold">{t("paymentDetails")}:</h2>
//         {user?.qrCodeUrl ? (
//           <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
//             <img
//               src={user.qrCodeUrl}
//               alt="QR Code"
//               className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-gray-300 rounded-lg"
//             />
//             <p className="text-gray-600 text-sm">{t("scanToPay")}</p>
//           </div>
//         ) : (
//           <p className="text-gray-500 text-sm">{t("noQRCode")}</p>
//         )}
//       </div>


//       <div className="mt-4 sm:mt-6 flex justify-end">
//         <div>
//           <h3 className="text-base sm:text-lg font-bold">{t("totalAmount")}:</h3>
//           <p className="text-xl sm:text-2xl text-black font-bold">
//             ₹ {entryData.pendingAmount + entryData.paidAmount}
//           </p>
//         </div>
//       </div>


//       <div className="mt-4 sm:mt-6 flex justify-center">
//         <button
//           onClick={generatePDF}
//           className="bg-gray-800 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-yellow-400 transition-all text-sm sm:text-base"
//         >
//           {t("downloadSharePDF")}
//         </button>
//       </div>
//     </div>
//   </div>
//   );
// };

// export default Invoice;


import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
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
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`);
        setUser(response.data);
      } catch (error) {
        toast.error("Failed to fetch user profile");
      }
    };
    fetchUserProfile();
  }, []);

  if (!entryData) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-gray-500 text-sm">
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
    toast.info(lang === "hi" ? "इनवॉइस बन रहा है..." : "Generating your Premium Invoice...");

    setTimeout(async () => {
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

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${entryData.customerName}_Invoice.pdf`); 

        // Upload to Cloudinary & Send WhatsApp
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("file", blob, "invoice.png");
          formData.append("upload_preset", "pdf_uploads");
          formData.append("folder", "invoices");

          const cloudinaryResponse = await axios.post("https://api.cloudinary.com/v1_1/dhflsyxxy/image/upload", formData);
          let pdfUrl = cloudinaryResponse.data.secure_url;
          let downloadUrl = pdfUrl.replace("/upload/", "/upload/fl_attachment/");
          let pngUrl = downloadUrl.replace("/upload/", "/upload/f_auto,q_auto/").replace(".pdf", ".png");

          const greeting = lang === "hi" ? "नमस्ते" : "Hello";
          const bodyText = lang === "hi" 
            ? `यहाँ ${user?.companyName || "हमारी कंपनी"} से आपका इनवॉइस लिंक है: ${pngUrl}\n\nकुल बकाया राशि: ₹${entryData.pendingAmount}`
            : `Here is your invoice link from ${user?.companyName || "our company"}: ${pngUrl}\n\nTotal Due: ₹${entryData.pendingAmount}`;

          const whatsappMessage = `${greeting} ${entryData.customerName},\n${bodyText}`;
          const whatsappUrl = `https://wa.me/91${entryData.mobileNumber}?text=${encodeURIComponent(whatsappMessage)}`;

          window.open(whatsappUrl, "_blank");
          window.location.href = "/";
        }, "image/png");

      } catch (error) {
        console.error(error);
        toast.error("Failed to generate or upload Invoice.");
      }
    }, 500); 
  };

  return (
    <div className="bg-[#121212] min-h-screen pb-24 relative overflow-hidden text-white font-sans">
      
      {/* 1. STICKY HEADER FOR MOBILE UI */}
      <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] mt-16 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white p-1">
            <FaArrowLeft size={14} />
          </button>
          <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            {t("invoice") || "INVOICE SUMMARY"}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
          <FaFileInvoiceDollar size={12} className="text-[var(--primary)]" /> #{Date.now().toString().slice(-6)}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4 max-w-lg mx-auto">
        
        {/* MOBILE UI - CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-[#1E1E1E] p-3 rounded-xl border border-[#2C2C2C]">
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">From</p>
            <h3 className="text-sm font-bold text-white leading-tight">{user?.companyName || t("companyName")}</h3>
            <p className="text-[10px] text-gray-400 mt-1">{user?.username || "Loading..."}</p>
            <p className="text-[10px] text-gray-400">+91 {user?.mobileNo || "---"}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-[#1E1E1E] p-3 rounded-xl border border-[#2C2C2C]">
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Bill To</p>
            <h3 className="text-sm font-bold text-[var(--primary)] leading-tight">{entryData.customerName}</h3>
            <p className="text-[10px] text-gray-400 mt-1 truncate">{entryData.address || "No Address"}</p>
            <p className="text-[10px] text-gray-400">+91 {entryData.mobileNumber}</p>
          </motion.div>
        </div>

        {/* WORK DETAILS */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
          <div className="p-3 border-b border-[#2C2C2C] bg-[#121212]/50 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-300">Job Details</span>
            <span className="text-[10px] text-gray-500">{formattedDate}</span>
          </div>
          <div className="p-3 space-y-3">
            <div>
              <p className="text-sm font-bold text-white">{machineName || "Machine"}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Job: {entryData.jobWork || "---"} • Op: {entryData.operatorName || "---"}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#333]">
              <div className="text-center">
                <p className="text-[9px] text-gray-500 uppercase">Work</p>
                <p className="text-xs font-bold mt-0.5">{entryData.quantity} {entryData.rentType}</p>
              </div>
              <div className="text-center border-l border-r border-[#333]">
                <p className="text-[9px] text-gray-500 uppercase">Rate</p>
                <p className="text-xs font-bold mt-0.5">₹{entryData.price}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gray-500 uppercase">Amount</p>
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
          <div className="w-1/3 bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] flex flex-col items-center justify-center p-2">
            {user?.qrCodeUrl ? (
              <img src={user.qrCodeUrl} alt="QR" className="w-full h-full object-contain rounded-lg bg-white p-1 mb-1" />
            ) : (
              <FaQrcode size={24} className="mb-1 text-gray-600" />
            )}
            <p className="text-[8px] text-gray-400 uppercase font-bold text-center">Scan to Pay</p>
          </div>
          <div className="w-2/3  from-[#1E1E1E] to-[#121212] rounded-xl border border-[#2C2C2C] p-4 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 bg-[var(--primary)]/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Grand Total</p>
            <h1 className="text-3xl font-extrabold text-[var(--primary)] tracking-tight">₹{totalAmountVal.toLocaleString()}</h1>
          </div>
        </motion.div>
      </div>

      {/* STICKY BOTTOM ACTION BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#121212] via-[#121212] to-transparent z-30">
        <button
          onClick={() => setIsLangModalOpen(true)}
          className="w-full max-w-lg mx-auto bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
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
                    className="bg-[#1E1E1E] w-full max-w-sm rounded-3xl p-6 border border-[#333] mb-4 sm:mb-0"
                >
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <FaLanguage size={18} className="text-[var(--primary)]" /> Select Language
                        </div>
                        <button onClick={() => setIsLangModalOpen(false)} className="text-gray-500 p-1"><FaTimes /></button>
                    </div>
                    <div className="space-y-3">
                        <button onClick={() => triggerDownload("en")} className="w-full py-3.5 bg-[#121212] border border-[#333] hover:border-[var(--primary)] text-white rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2">
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
      {/* FIX: 
        1. Used fixed A4 dimensions: 794px by 1123px 
        2. Set position explicitly away from view but correctly sized 
      */}
      <div className="absolute top-0 left-[-5000px] z-[-1]">
        <div id="hidden-pdf-template" className="bg-white text-black font-sans relative" style={{ width: '794px', height: '1123px', padding: '40px', boxSizing: 'border-box' }}>
          
          {/* COMPACT Header */}
          <div className="bg-[#1E1E1E] text-white px-6 py-5 rounded-t-xl flex justify-between items-center border-b-4 border-[var(--primary)]">
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--primary)] mb-1 uppercase tracking-wide">{user?.companyName || "COMPANY NAME"}</h1>
              <p className="text-gray-300 text-sm">{user?.username || "Owner Name"}</p>
              <p className="text-gray-300 text-sm">+91 {user?.mobileNo || "N/A"}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1">
                {pdfLang === "hi" ? "बिल (BILL)" : "INVOICE"}
              </h2>
              <p className="text-gray-400 text-xs tracking-wide">Original Copy</p>
            </div>
          </div>

          {/* Details Row (Compact margins) */}
          <div className="flex justify-between items-start mt-6 px-2">
            <div className="w-1/2">
              <p className="text-gray-500 font-bold text-xs mb-1">{pdfLang === "hi" ? "बिल किसको (Bill To):" : "Bill To:"}</p>
              <h2 className="text-xl font-bold text-[#1E1E1E] mb-1">{entryData.customerName}</h2>
              <p className="text-sm text-gray-700">+91 {entryData.mobileNumber}</p>
              <p className="text-sm text-gray-700 mt-1 max-w-[250px] leading-snug">{entryData.address}</p>
            </div>
            <div className="w-1/2 text-right">
              <div className="mb-2">
                <p className="text-gray-500 font-bold text-sm inline-block mr-2">{pdfLang === "hi" ? "दिनांक (Date):" : "Date:"}</p>
                <span className="text-base font-bold text-[#1E1E1E]">{formattedDate}</span>
              </div>
              <div>
                <p className="text-gray-500 font-bold text-sm inline-block mr-2">{pdfLang === "hi" ? "इनवॉइस नंबर:" : "Invoice No:"}</p>
                <span className="text-base font-bold text-[#1E1E1E]">#INV-{Date.now().toString().slice(-5)}</span>
              </div>
            </div>
          </div>

          {/* Job Details Bar */}
          <div className="bg-[#F5F5F5] rounded-lg p-4 mt-6 flex justify-between items-center border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 font-bold mb-1">{pdfLang === "hi" ? "मशीन (Machine)" : "Machine"}</p>
              <p className="text-lg font-bold text-black">{machineName || "N/A"}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-bold mb-1">{pdfLang === "hi" ? "कार्य (Job Work)" : "Job Work"}</p>
              <p className="text-lg font-bold text-black">{entryData.jobWork || "N/A"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-bold mb-1">{pdfLang === "hi" ? "ऑपरेटर (Operator)" : "Operator"}</p>
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
                  <p className="text-gray-500 font-bold mt-1 text-xs">{pdfLang === "hi" ? "भुगतान के लिए स्कैन करें" : "Scan to Pay"}</p>
                </>
              ) : (
                <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">No QR</div>
              )}
            </div>

            {/* Total Box */}
            <div className="bg-[#F5F5F5] rounded-xl p-5 w-72 border border-gray-200">
              <div className="flex justify-between mb-2">
                <p className="text-gray-600 font-bold text-sm">{pdfLang === "hi" ? "जमा राशि (Paid):" : "Paid Amount:"}</p>
                <p className="text-green-600 font-bold text-sm">Rs {entryData.paidAmount.toLocaleString()}</p>
              </div>
              <div className="flex justify-between mb-3">
                <p className="text-gray-600 font-bold text-sm">{pdfLang === "hi" ? "बकाया राशि (Due):" : "Pending Due:"}</p>
                <p className="text-red-600 font-bold text-sm">Rs {entryData.pendingAmount.toLocaleString()}</p>
              </div>
              <div className="border-t border-gray-300 my-3"></div>
              <div className="flex justify-between items-center">
                <p className="text-gray-800 font-extrabold text-lg">{pdfLang === "hi" ? "कुल (Total):" : "Total:"}</p>
                <p className="text-[var(--primary)] font-black text-xl drop-shadow-sm">Rs {totalAmountVal.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* FIXED FOOTER POSITIONING (Absolute locking to the bottom of the A4 page container) */}
          <div className="absolute bottom-[40px] left-[40px] right-[40px] text-center border-t-2 border-gray-200 pt-5">
              <p className="text-gray-500 font-bold text-lg mb-4">
              {pdfLang === "hi" ? "धन्यवाद! पुनः पधारें।" : "Thank you for your business!"}
              </p>
              {/* Promotion Banner */}
              <div className="bg-gray-100 inline-flex items-center justify-center gap-3 px-6 py-2.5 rounded-full border border-gray-300">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">Powered By</span>
                <span className="text-[#1E1E1E] font-black text-xl tracking-tight">Rent Veda<span className="text-[var(--primary)]">Veda</span></span>
                <span className="text-gray-400">|</span>
                <span className="text-blue-600 font-bold text-sm">{currentAppUrl}</span>
              </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Invoice;