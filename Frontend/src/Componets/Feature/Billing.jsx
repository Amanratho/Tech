// import React, { useState, useEffect } from "react";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { useTranslation } from "react-i18next";
// import { useGetPaymentsQuery } from "../../redux/functional/paymentApiSlice";
// import hindiFont from "../../assets/fonts/hindiFont";


// const Billing = () => {
//   const { t } = useTranslation();
//   const [billData, setBillData] = useState([]);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [sortField, setSortField] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchField, setSearchField] = useState("customerName"); 
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
//   const [machines_bill, setMachinesBill] = useState([]);

//   const uid = localStorage.getItem("uid");
//   const { data: paymentData = [], refetch } = useGetPaymentsQuery(uid, { skip: !uid });
  

//     React.useEffect(() => {
//       if (!uid) return; 
    
//       const fetchRentals = async () => {
//         try {
//           setIsLoading(true);
          
//           setMachinesBill(paymentData);
//           console.log("client data :", paymentData);
    
//           const formattedData = paymentData.map((bill) => ({
//             ...bill,
//             paidAmount: bill.paidAmount || 0,
//             pendingAmount: bill.pendingAmount || 0,
//             customerAddress: bill.address || "...",
//             operatorName: bill.operatorName || "...",
//           }));
    
//           const sortedData = formattedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//           setBillData(sortedData);
//           setFilteredData(sortedData);
          
//         } catch (err) {
//           setError(err.message);
//         } finally {
//           setIsLoading(false);
//         }
//       };
    
//       fetchRentals();
//     }, [uid, paymentData]); 
    

//   const handleSort = (field) => {
//     const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
//     setSortField(field);
//     setSortOrder(order);

//     const sortedData = [...filteredData].sort((a, b) => {
//       if (field === "paidAmount" || field === "pendingAmount") {
//         return order === "asc" ? a[field] - b[field] : b[field] - a[field];
//       } else {
//         return order === "asc"
//           ? a[field].toString().localeCompare(b[field].toString())
//           : b[field].toString().localeCompare(a[field].toString());
//       }
//     });

//     setFilteredData(sortedData); // Update filtered data after sorting
//   };

//   const handleSearch = (event) => {
//     const value = event.target.value.toLowerCase();
//     setSearchTerm(value);

//     const filtered = billData.filter((bill) =>
//       bill[searchField]?.toLowerCase().includes(value)
//     );

//     setFilteredData(filtered); // Update filtered data after search
//   };
//   const downloadPDF = (bill) => {
//     const doc = new jsPDF();

//     // ✅ Hindi Font Load Karo
//     doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", hindiFont);
//     doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSans", "normal");
//     doc.setFont("NotoSans"); // 🔥 Ensure Hindi Font is Used

//     // ✅ Title
//     doc.setFontSize(22);
//     doc.text("अपडेटेड बिल / Updated Bill", 105, 20, { align: "center" });

//     doc.setFontSize(12);
//     doc.text(`🔹 बिल दिनांक / Bill Date: ${new Date().toLocaleDateString()}`, 14, 30);
//     doc.text(`🔹 ग्राहक का नाम / Customer Name: ${bill.customerName}`, 14, 40);
//     doc.text(`🔹 पता / Address: ${bill.customerAddress}`, 14, 50);
//     doc.text(`🔹 मोबाइल नंबर / Mobile Number: ${bill.mobileNumber}`, 14, 60);

//     // ✅ Table for Amount Details
//     doc.autoTable({
//         startY: 70,
//         head: [["📝 विवरण (Description)", "💰 राशि (Amount)"]],
//         body: [
//             ["✅ भुगतान राशि (Paid Amount)", `${bill.paidAmount}`],
//             ["⏳ बकाया राशि (Pending Amount)", `${bill.pendingAmount}`],
//             ["💵 कुल राशि (Total Amount)", `${bill.paidAmount + bill.pendingAmount}`],
//         ],
//         theme: "grid",
//         styles: { font: "NotoSans", fontSize: 12 },
//         headStyles: { fillColor: [0, 102, 204] }, // Blue Header Background
//     });

//     const finalY = doc.lastAutoTable.finalY + 10;
//     doc.text("🙏 धन्यवाद! / Thank You!", 105, finalY, { align: "center" });

//     // ✅ Save the PDF
//     doc.save(`${bill.customerName}-invoice.pdf`);
// };

//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   const closeDropdown = () => {
//     setIsDropdownOpen(false);
//   };

//   // Focus the input field after selecting a dropdown item
//   const handleSearchFieldChange = (field) => {
//     setSearchField(field);
//     closeDropdown();

//     // Focus the search input field after selection
//     setTimeout(() => {
//       document.getElementById("search-input").focus();
//     }, 0);
//   };

//   // Close dropdown if clicked outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       const dropdown = document.getElementById("search-dropdown");
  
//       // ✅ Check if dropdown exists before calling `contains`
//       if (dropdown && !dropdown.contains(e.target) && !e.target.closest("input")) {
//         closeDropdown();
//       }
//     };
  
//     document.addEventListener("click", handleClickOutside);
//     return () => {
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="pt-4 mt-12 bg-[#4C4C4D] min-h-screen">
//     <h2 className="text-[#FEC111] text-xl font-bold text-center py-2 px-4 rounded-lg mb-6">
//     {t('billingHistoryTitle')}
//     </h2>
//     <div className="">
//       <div className="flex justify-between items-center mb-4">
//         <div className="relative">
//           <input
//             id="search-input"
//             type="text"
//             value={searchTerm}
//             onChange={handleSearch}
//             onClick={toggleDropdown}
//             placeholder={t('searchPlaceholder1')}
//             className="border border-[#F5F5F5] px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F5F5F5]"
//           />
//           {/* Dropdown Menu for Search Fields */}
//           {isDropdownOpen && (
//             <div
//               id="search-dropdown"
//               className="absolute top-12 left-0 bg-white border border-[#F5F5F5] rounded-md shadow-lg w-full z-10"
//             >
//               <div
//                 className=" cursor-pointer hover:bg-gray-200"
//                 onClick={() => handleSearchFieldChange("customerName")}
//               >
//                {t('searchPlaceholder1')}
//               </div>
//               <div
//                 className="px-4 py-2 cursor-pointer hover:bg-gray-200"
//                 onClick={() => handleSearchFieldChange("operatorName")}
//               >
//                  {t('operatorName')}
//               </div>
//               <div
//                 className="px-4 py-2 cursor-pointer hover:bg-gray-200"
//                 onClick={() => handleSearchFieldChange("customerAddress")}
//               >
//                 {t('searchByCustomerAddress')}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="text-sm text-[#F5F5F5]">
//         <b> {t('totalBills')} {filteredData.length}</b>
//       </div>
//     </div>
//     {error && <div className="text-red-500 text-center my-4">{error}</div>}
//     {isLoading ? (
//       <div className="text-center text-[#F5F5F5]">{t('loadingText')}</div>
//     ) : (
//       <div className="overflow-x-auto">
//         <table className="min-w-full border border-[#F5F5F5] table-auto">
//           <thead className="sticky top-0 bg-[#4C4C4D]">
//             <tr className="bg-slate-400 text-sm text-[#F5F5F5]">
//               <th
//                 className="border py-2 text-center cursor-pointer"
//                 onClick={() => handleSort("customerName")}
//               >
//                 {t('customerNamept')}{" "}
//                 {sortField === "customerName" &&
//                   (sortOrder === "asc" ? " (A-Z)" : "(Z-A)")}
//               </th>
//               <th
//                 className="border text-center cursor-pointer"
//                 onClick={() => handleSort("paidAmount")}
//               >
//                 {t('totalAmount')}{" "}
//                 {sortField === "paidAmount" &&
//                   (sortOrder === "asc" ? "(↑)" : "(↓)")}
//               </th>
//               <th className="border text-center">{t('searchByOperatorName')}</th>
//               <th className="border text-center"> {t('contactNumber')}</th>
//               <th className="border text-center">{t('searchByCustomerAddress')}</th>
//               <th className="border text-center">{t('actions')}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredData.map((bill, index) => (
//               <tr
//                 key={bill.id}
//                 className={`text-sm text-black hover:font-semibold hover:cursor-pointer hover:bg-slate-400 transition duration-150  ${
//                   index % 2 === 0 ? "bg-gray-300" : "bg-white"
//                 }`}
//               >
//                 <td className="border text-center py-2  ">{bill.customerName}</td>
//                 <td className="border text-center ">
//                   ₹{bill.paidAmount + bill.pendingAmount}
//                 </td>
//                 <td className="border text-center ">{bill.operatorName}</td>
//                 <td className="border text-center ">
//                   <a className="no-underline" href={`tel:${bill.mobileNumber}`}>
//                     {bill.mobileNumber}
//                   </a>
//                 </td>
//                 <td className="border text-center ">{bill.customerAddress}</td>
//                 <td className="border text-center ">
//                   <button
//                     onClick={() => downloadPDF(bill)}
//                     className="bg-[#F8981D] text-[#4C4C4D] px-2 rounded-md transition duration-300 hover:bg-[#D9781A] hover:text-[#FEC111] focus:outline-none"
//                   >
//                    {t('downloadInvoiceButton')}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     )}
//   </div>
  
//   );
// };

// export default Billing;
 
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useTranslation } from "react-i18next";
import { useGetPaymentsQuery } from "../../redux/functional/paymentApiSlice";
import hindiFont from "../../assets/fonts/hindiFont";
import { motion } from "framer-motion";
import { 
    FaSearch, 
    FaFilePdf, 
    FaMapMarkerAlt, 
    FaPhoneAlt, 
    FaSortAmountDown, 
    FaUserTie 
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

  const uid = localStorage.getItem("uid");
  const { data: paymentData = [], refetch } = useGetPaymentsQuery(uid, { skip: !uid });

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

  const downloadPDF = (bill) => {
    const doc = new jsPDF();
    doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", hindiFont);
    doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSans", "normal");
    doc.setFont("NotoSans");

    doc.setFillColor(254, 193, 17); 
    doc.rect(0, 0, 210, 10, "F"); 
    
    doc.setFontSize(22);
    doc.text("INVOICE / बिल", 105, 25, { align: "center" });

    doc.setFontSize(10);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`CUSTOMER: ${bill.customerName}`, 14, 45);
    doc.text(`MOBILE: ${bill.mobileNumber}`, 14, 55);
    doc.text(`ADDRESS: ${bill.customerAddress}`, 14, 65);

    doc.autoTable({
        startY: 75,
        head: [["Description (विवरण)", "Amount (राशि)"]],
        body: [
            ["Paid Amount (जमा राशि)", `${bill.paidAmount}`],
            ["Pending Amount (बकाया राशि)", `${bill.pendingAmount}`],
            ["Total (कुल)", `${bill.paidAmount + bill.pendingAmount}`],
        ],
        theme: "grid",
        styles: { font: "NotoSans" },
        headStyles: { fillColor: [20, 20, 20] }, 
    });

    doc.save(`${bill.customerName}_RentVeda.pdf`);
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
    <div className="bg-[#121212] mt-16 min-h-screen pb-20">
      
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 z-30 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] pb-2">
        <div className="px-4 py-2 flex justify-between items-center">
            <h2 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                {t('billingHistoryTitle') || "BILLING HISTORY"}
            </h2>
            <span className="text-[9px] bg-[#1E1E1E] text-[var(--primary)] px-1.5 py-0.5 rounded border border-[#333]">
                Total: {filteredData.length}
            </span>
        </div>

        <div className="px-4 mb-2">
            <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-gray-500 text-xs" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder={`Search by ${searchField.replace('Name', '')}...`}
                    className="w-full bg-[#1E1E1E] text-white pl-9 pr-3 py-2 rounded-full text-xs outline-none border border-[#333] focus:border-[var(--primary)] transition-colors placeholder-gray-600"
                />
            </div>
        </div>

        <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
                { label: t("customerNamept") || "Customer", id: "customerName" },
                { label: t("operatorName") || "Operator", id: "operatorName" },
                { label: t("searchByCustomerAddress") || "Address", id: "customerAddress" }
            ].map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => handleFilterChange(filter.id)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-[9px] font-bold tracking-wide border transition-all ${
                        searchField === filter.id 
                        ? "bg-[var(--primary)] text-black border-[var(--primary)]" 
                        : "bg-transparent text-gray-500 border-[#333]"
                    }`}
                >
                    {filter.label}
                </button>
            ))}
            <button 
                onClick={toggleSort}
                className="ml-auto w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-[#1E1E1E] border border-[#333] text-gray-400 active:text-[var(--primary)]"
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
                    <div key={i} className="h-16 bg-[#1E1E1E] rounded-lg animate-pulse border border-[#222]" />
                ))}
            </div>
        ) : filteredData.length === 0 ? (
            <div className="text-center py-20 text-gray-600 text-xs">
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
                        className="bg-[#1E1E1E] p-2.5 rounded-lg border border-[#2C2C2C] flex justify-between items-center active:bg-[#222]"
                    >
                        {/* Left Side: INFO + CALL BUTTON */}
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            
                            {/* UPDATED: Calling Icon (Clickable) */}
                            <a 
                                href={`tel:${bill.mobileNumber}`}
                                className="w-8 h-8 rounded-full bg-[#1A2E1A] border border-[#2C5E2C] flex items-center justify-center flex-shrink-0 text-green-500 active:bg-green-600 active:text-white transition-colors"
                            >
                                <FaPhoneAlt size={12} />
                            </a>
                            
                            <div className="min-w-0">
                                <h3 className="text-white text-xs font-bold truncate">
                                    {bill.customerName}
                                </h3>
                                
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="flex items-center gap-1 text-[9px] text-gray-500">
                                        <FaMapMarkerAlt size={8} /> 
                                        <span className="truncate max-w-[70px]">{bill.customerAddress}</span>
                                    </div>
                                    <span className="text-gray-700 text-[8px]">•</span>
                                    <div className="flex items-center gap-1 text-[9px] text-gray-500">
                                        <FaUserTie size={8} /> 
                                        <span className="truncate max-w-[50px]">{bill.operatorName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Amount & PDF */}
                        <div className="flex items-center gap-3 pl-1">
                            <div className="text-right">
                                <span className="block text-[10px] text-gray-400">Total</span>
                                <span className="block text-xs font-bold text-[var(--primary)]">
                                    ₹{(bill.paidAmount + bill.pendingAmount).toLocaleString()}
                                </span>
                            </div>

                            <button 
                                onClick={() => downloadPDF(bill)}
                                className="w-7 h-7 rounded-full bg-[#252525] text-red-400 flex items-center justify-center border border-[#333] active:bg-red-500 active:text-white transition-colors"
                            >
                                <FaFilePdf size={12} />
                            </button>
                        </div>

                    </motion.div>
                ))}
            </motion.div>
        )}
      </div>
    </div>
  );
};

export default Billing;