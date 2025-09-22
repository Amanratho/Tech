import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useTranslation } from "react-i18next";
import { useGetPaymentsQuery } from "../../redux/functional/paymentApiSlice";
import hindiFont from "../../assets/fonts/hindiFont";


const Billing = () => {
  const { t } = useTranslation();
  const [billData, setBillData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchField, setSearchField] = useState("customerName"); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const [machines_bill, setMachinesBill] = useState([]);

  const uid = localStorage.getItem("uid");
  const { data: paymentData = [], refetch } = useGetPaymentsQuery(uid, { skip: !uid });
    // const [updatePayment] = useUpdatePaymentMutation();

    React.useEffect(() => {
      if (!uid) return; // Agar UID nahi hai to API call mat karo
    
      const fetchRentals = async () => {
        try {
          setIsLoading(true);
          
          setMachinesBill(paymentData);
          console.log("client data :", paymentData);
    
          const formattedData = paymentData.map((bill) => ({
            ...bill,
            paidAmount: bill.paidAmount || 0,
            pendingAmount: bill.pendingAmount || 0,
            customerAddress: bill.address || "...",
            operatorName: bill.operatorName || "...",
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
    }, [uid, paymentData]); // ✅ Dependencies update kiye
    

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedData = [...filteredData].sort((a, b) => {
      if (field === "paidAmount" || field === "pendingAmount") {
        return order === "asc" ? a[field] - b[field] : b[field] - a[field];
      } else {
        return order === "asc"
          ? a[field].toString().localeCompare(b[field].toString())
          : b[field].toString().localeCompare(a[field].toString());
      }
    });

    setFilteredData(sortedData); // Update filtered data after sorting
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = billData.filter((bill) =>
      bill[searchField]?.toLowerCase().includes(value)
    );

    setFilteredData(filtered); // Update filtered data after search
  };
  const downloadPDF = (bill) => {
    const doc = new jsPDF();

    // ✅ Hindi Font Load Karo
    doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", hindiFont);
    doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSans", "normal");
    doc.setFont("NotoSans"); // 🔥 Ensure Hindi Font is Used

    // ✅ Title
    doc.setFontSize(22);
    doc.text("अपडेटेड बिल / Updated Bill", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`🔹 बिल दिनांक / Bill Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`🔹 ग्राहक का नाम / Customer Name: ${bill.customerName}`, 14, 40);
    doc.text(`🔹 पता / Address: ${bill.customerAddress}`, 14, 50);
    doc.text(`🔹 मोबाइल नंबर / Mobile Number: ${bill.mobileNumber}`, 14, 60);

    // ✅ Table for Amount Details
    doc.autoTable({
        startY: 70,
        head: [["📝 विवरण (Description)", "💰 राशि (Amount)"]],
        body: [
            ["✅ भुगतान राशि (Paid Amount)", `${bill.paidAmount}`],
            ["⏳ बकाया राशि (Pending Amount)", `${bill.pendingAmount}`],
            ["💵 कुल राशि (Total Amount)", `${bill.paidAmount + bill.pendingAmount}`],
        ],
        theme: "grid",
        styles: { font: "NotoSans", fontSize: 12 },
        headStyles: { fillColor: [0, 102, 204] }, // Blue Header Background
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text("🙏 धन्यवाद! / Thank You!", 105, finalY, { align: "center" });

    // ✅ Save the PDF
    doc.save(`${bill.customerName}-invoice.pdf`);
};

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Focus the input field after selecting a dropdown item
  const handleSearchFieldChange = (field) => {
    setSearchField(field);
    closeDropdown();

    // Focus the search input field after selection
    setTimeout(() => {
      document.getElementById("search-input").focus();
    }, 0);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const dropdown = document.getElementById("search-dropdown");
  
      // ✅ Check if dropdown exists before calling `contains`
      if (dropdown && !dropdown.contains(e.target) && !e.target.closest("input")) {
        closeDropdown();
      }
    };
  
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="pt-4 mt-12 bg-[#4C4C4D] min-h-screen">
    <h2 className="text-[#FEC111] text-xl font-bold text-center py-2 px-4 rounded-lg mb-6">
    {t('billingHistoryTitle')}
    </h2>
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            onClick={toggleDropdown}
            placeholder={t('searchPlaceholder1')}
            className="border border-[#F5F5F5] px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F5F5F5]"
          />
          {/* Dropdown Menu for Search Fields */}
          {isDropdownOpen && (
            <div
              id="search-dropdown"
              className="absolute top-12 left-0 bg-white border border-[#F5F5F5] rounded-md shadow-lg w-full z-10"
            >
              <div
                className=" cursor-pointer hover:bg-gray-200"
                onClick={() => handleSearchFieldChange("customerName")}
              >
               {t('searchPlaceholder1')}
              </div>
              <div
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSearchFieldChange("operatorName")}
              >
                 {t('operatorName')}
              </div>
              <div
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSearchFieldChange("customerAddress")}
              >
                {t('searchByCustomerAddress')}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="text-sm text-[#F5F5F5]">
        <b> {t('totalBills')} {filteredData.length}</b>
      </div>
    </div>
    {error && <div className="text-red-500 text-center my-4">{error}</div>}
    {isLoading ? (
      <div className="text-center text-[#F5F5F5]">{t('loadingText')}</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-[#F5F5F5] table-auto">
          <thead className="sticky top-0 bg-[#4C4C4D]">
            <tr className="bg-slate-400 text-sm text-[#F5F5F5]">
              <th
                className="border py-2 text-center cursor-pointer"
                onClick={() => handleSort("customerName")}
              >
                {t('customerNamept')}{" "}
                {sortField === "customerName" &&
                  (sortOrder === "asc" ? " (A-Z)" : "(Z-A)")}
              </th>
              <th
                className="border text-center cursor-pointer"
                onClick={() => handleSort("paidAmount")}
              >
                {t('totalAmount')}{" "}
                {sortField === "paidAmount" &&
                  (sortOrder === "asc" ? "(↑)" : "(↓)")}
              </th>
              <th className="border text-center">{t('searchByOperatorName')}</th>
              <th className="border text-center"> {t('contactNumber')}</th>
              <th className="border text-center">{t('searchByCustomerAddress')}</th>
              <th className="border text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((bill, index) => (
              <tr
                key={bill.id}
                className={`text-sm text-black hover:font-semibold hover:cursor-pointer hover:bg-slate-400 transition duration-150  ${
                  index % 2 === 0 ? "bg-gray-300" : "bg-white"
                }`}
              >
                <td className="border text-center py-2  ">{bill.customerName}</td>
                <td className="border text-center ">
                  ₹{bill.paidAmount + bill.pendingAmount}
                </td>
                <td className="border text-center ">{bill.operatorName}</td>
                <td className="border text-center ">
                  <a className="no-underline" href={`tel:${bill.mobileNumber}`}>
                    {bill.mobileNumber}
                  </a>
                </td>
                <td className="border text-center ">{bill.customerAddress}</td>
                <td className="border text-center ">
                  <button
                    onClick={() => downloadPDF(bill)}
                    className="bg-[#F8981D] text-[#4C4C4D] px-2 rounded-md transition duration-300 hover:bg-[#D9781A] hover:text-[#FEC111] focus:outline-none"
                  >
                   {t('downloadInvoiceButton')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
  
  );
};

export default Billing;
 