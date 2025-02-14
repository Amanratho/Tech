import React from "react";
import { jsPDF } from "jspdf";
import { useLocation } from "react-router-dom";

import { useEffect, useState } from "react";
import axios from "axios";
// import { b } from "framer-motion/client";

const Invoice = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        toast.error("User ID not found. Please log in again.");
        window.location.href = "/login";
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`
        );
        setUser(response.data);
      } catch (error) {
        toast.error("Failed to fetch user profile");
      }
    };

    fetchUserProfile();
  }, []);

  const currentDate = new Date();

  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  let hours = currentDate.getHours();
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  const formattedDate = `${day}/${month}/${year}`;
  const formattedTime = `${hours}:${minutes} ${ampm}`;

  const location = useLocation();
  const { entryData, machineName } = location.state || {};

  if (!entryData) {
    return <div>No data found! Please fill the form first.</div>;
  }

  const billData = [
    {
      hours: entryData.quantity,
      price: entryData.price,
      quantity: entryData.quantity,
      operatorName: entryData.operatorName,
      amount: entryData.paidAmount + entryData.pendingAmount,
      paid: entryData.paidAmount,
      pending: entryData.pendingAmount,
      rentType: entryData.rentType,
    },
  ];

  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Set Background Color (Gray-800)
    doc.setFillColor(55, 65, 81); // Gray-800
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.height, "F");

    // Add Title (Yellow-400)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 179, 8); // Yellow-400
    doc.text("Bill", pageWidth / 2, margin, { align: "center" });

    // Company Info Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255); // White
    doc.text(`Date: ${formattedDate}`, margin, margin + 10);
    doc.text(`Owner Name: ${user.username}`, margin, margin + 20);
    doc.text(`Company Name: ${user.companyName}`, margin, margin + 30);
    doc.text(`Phone No.: +91 ${user.mobileNo}`, margin, margin + 40);
    entryData.operatorName &&
      doc.text(`Operator Name: ${entryData.operatorName}`, margin, margin + 50);

      let qrCodeImage;

      // Check if user.qrCodeUrl exists and is a string
      if (user?.qrCodeUrl?.startsWith?.("http")) {
        try {
          const response = await fetch(user.qrCodeUrl);
          const blob = await response.blob();
          const reader = new FileReader();
      
          qrCodeImage = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Failed to load QR code image:", error);
          qrCodeImage = "No QR Code Uploaded"; // Default message
        }
      } else {
        qrCodeImage = user?.qrCodeUrl || "No QR Code Uploaded"; // Default message
      }
      
     

    // Add QR Code Image
    if (qrCodeImage) {
      doc.text("Pay On", margin, margin + 155);
      doc.addImage(qrCodeImage, "JPEG", 20, 180, 50, 50);
    } else {
      doc.setTextColor(239, 68, 68); // Red
      doc.text("QR Code could not be loaded", 20, 180);
    }

    // Rest of the code remains unchanged...
    // Add separator
    doc.setLineWidth(0.5);
    doc.setDrawColor(234, 179, 8); // Yellow-400
    doc.line(margin, margin + 55, pageWidth - margin, margin + 55);

    // Bill To Section
    doc.setTextColor(255, 255, 255); // White
    doc.text("Bill To:", margin, margin + 70);
    doc.text(`Name : ${entryData.customerName}`, margin, margin + 80);
    doc.text(`Address: ${entryData.address}`, margin, margin + 90);
    doc.text(`Phone No.: ${entryData.mobileNumber}`, margin, margin + 100);
    doc.text(`Machine Name : ${machineName}`, margin, margin + 110);

    // Add Separator
    doc.line(margin, margin + 120, pageWidth - margin, margin + 120);

    // Rent Charges Table Header
    const tableStartY = margin + 130;
    doc.setFontSize(12);
    doc.setTextColor(234, 179, 8); // Yellow-400
    doc.text(`${entryData.rentType}`, margin, tableStartY);
    doc.text(`Per / ${entryData.rentType}`, margin + 30, tableStartY);
    doc.text(`Paid`, margin + 70, tableStartY);
    doc.text(`Pending`, margin + 100, tableStartY);
    doc.text("Amount", margin + 130, tableStartY);

    // Table Rows
    billData.forEach((bill, index) => {
      const yPosition = tableStartY + (index + 1) * 10;

      // Alternate Row Background
      if (index % 2 === 0) {
        doc.setFillColor(75, 85, 99); // Gray-600
        doc.rect(
          margin - 5,
          yPosition - 5,
          pageWidth - 2 * margin + 10,
          10,
          "F"
        );
      }

      // Hours
      doc.setTextColor(255, 255, 255); // White
      doc.text(String(bill.hours), margin, yPosition);

      // Price
      doc.text(String(bill.price), margin + 30, yPosition);

      // Paid
      if (bill.paid > 0) {
        doc.setTextColor(34, 197, 94); // Green-500
      } else {
        doc.setTextColor(239, 68, 68); // Red-500
      }
      doc.text(String(bill.paid), margin + 68, yPosition);

      // Pending
      if (bill.pending > 0) {
        doc.setTextColor(250, 204, 21); // Yellow-500
      } else {
        doc.setTextColor(34, 197, 94); // Green-500
      }
      doc.text(String(bill.pending), margin + 104, yPosition);

      // Amount
      doc.setTextColor(255, 255, 255); // White
      doc.text(String(bill.amount), margin + 130, yPosition);
    });

    // Final Total
    const totalAmount = billData.reduce(
      (total, bill) => total + bill.amount,
      0
    );
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 179, 8); // Yellow-400
    doc.text(
      `Total: ${totalAmount}`,
      margin,
      tableStartY + (billData.length + 1) * 10
    );

    // PDF Output (Optional: Image conversion or saving)
    const pdfImage = doc.output("dataurlstring", { format: "png", width: 800 });

    // Convert dataurlstring to Blob
    const base64Data = pdfImage.split(",")[1]; // Extract base64 part
    const binaryData = atob(base64Data);
    const arrayBuffer = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      arrayBuffer[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: "png" });

    const formData = new FormData();
    formData.append("file", blob, "invoice.png"); // Append Blob as file
    formData.append("upload_preset", "pdf_uploads");
    formData.append("folder", "invoices"); // Folder path for Cloudinary

    try {
      // Cloudinary par PNG upload karte hain
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dhflsyxxy/image/upload",
        formData
      );

      // Cloudinary se PNG ka URL mil gaya
      let pdfUrl = response.data.secure_url;
      let pngUrl = pdfUrl
        .replace("/upload/", "/upload/f_auto,q_auto/")
        .replace(".pdf", ".png");

      // alert("Invoice uploaded successfully!");
      // console.log("Invoice URL:", pngUrl);

      // Customer ko WhatsApp par message bhejna
      const whatsappMessage = `Click on the link to view your invoice (Tech Diary): ${pngUrl}`;
      const customerMobile = entryData.mobileNumber;

      // WhatsApp link banate hain
      const whatsappUrl = `https://wa.me/91${customerMobile}?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      doc.save(`${entryData.customerName} invoice.pdf`);
      // Automatically WhatsApp link open karte hain
      window.open(whatsappUrl, "_blank");
      window.location.href = "/";
      // window.location.href = whatsappUrl;
    } catch (error) {
      // console.error("Error uploading Invoice:", error);
      // alert("Failed to upload Invoice to Cloudinary.");
    }
  };

  return (
    <div className="p-4 sm:p-6 mt-6 sm:mt-12 bg-gray-100 flex justify-center">
    <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600">INVOICE</h1>
          <p className="text-gray-500 text-sm sm:text-base">Date: {formattedDate}</p>
        </div>
        <div className="text-left sm:text-right mt-2 sm:mt-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-700">{user?.companyName || "Company Name"}</h2>
          <p className="text-gray-500 text-sm">Owner: {user?.username || "Loading..."}</p>
          <p className="text-gray-500 text-sm">Contact: +91 {user?.mobileNo || "Loading..."}</p>
        </div>
      </div>
  
      {/* Bill To */}
      <div className="mt-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700">Bill To:</h2>
        <p className="text-gray-600 text-sm sm:text-base">Name: <b>{entryData.customerName}</b></p>
        <p className="text-gray-600 text-sm sm:text-base">Address: <b>{entryData.address}</b></p>
        <p className="text-gray-600 text-sm sm:text-base">Contact: <b>{entryData.mobileNumber}</b></p>
      </div>
  
      {/* Table */}
      <div className="mt-4 sm:mt-6 border rounded-lg overflow-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">Machine Name</th>
              <th className="p-2">Operator</th>
              <th className="p-2">{entryData.rentType}</th>
              <th className="p-2">Price</th>
              <th className="p-2 text-red-500">Pending</th>
              <th className="p-2 text-green-500">Paid</th>
            </tr>
          </thead>
          <tbody>
            {billData.map((item, index) => (
              <tr key={index} className="border-b text-center">
                <td className="p-2">{machineName || "---"}</td>
                <td className="p-2">{item.operatorName || "---"}</td>
                <td className="p-2">{item.quantity || "0"}</td>
                <td className="p-2">₹ {item.price || "0"}</td>
                <td className="p-2 text-red-600">₹ {item.pending || "0"}</td>
                <td className="p-2 text-green-600">₹ {item.paid || "0"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Payment Info */}
      <div className="mt-4 sm:mt-6">
        <h2 className="text-base sm:text-lg font-bold">Payment Details:</h2>
        {user?.qrCodeUrl ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <img
              src={user.qrCodeUrl}
              alt="QR Code"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-gray-300 rounded-lg"
            />
            <p className="text-gray-600 text-sm">Scan to Pay</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No QR Code Uploaded</p>
        )}
        <p className="text-gray-600 mt-2 text-sm">Pay On: <b>{user?.mobileNo || "No contact available"}</b></p>
      </div>
  
      {/* Total Amount */}
      <div className="mt-4 sm:mt-6 flex justify-end">
        <div>
          <h3 className="text-base sm:text-lg font-bold">Total Amount:</h3>
          <p className="text-xl sm:text-2xl text-black font-bold">
            ₹ {entryData.pendingAmount + entryData.paidAmount}
          </p>
        </div>
      </div>
  
      {/* Button */}
      <div className="mt-4 sm:mt-6 flex justify-center">
        <button
          onClick={generatePDF}
          className="bg-gray-800 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-yellow-400 transition-all text-sm sm:text-base"
        >
          Download & Share PDF
        </button>
      </div>
    </div>
  </div>
  
  );
};

export default Invoice;
