import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

const Billing = () => {
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

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const uid = localStorage.getItem("uid");
    
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rentals`, { uid });
        
 
        if (!response || response.status !== 200 || !response.data) {
          throw new Error("Failed to fetch rentals");
        }
    
        setMachinesBill(response.data);
        console.log("client data :", response.data);
    
        const formattedData = response.data.map((bill) => ({
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
  }, []);

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
    doc.setFontSize(22);
    doc.text("Updated Bill", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`BIll Date: ${new Date().toLocaleDateString()}`, 14, 30);
     // doc.text(`Invoice Number: ${bill.id || "XXXX"}`, 14, 40);
    doc.text(`Customer Name: ${bill.customerName}`, 14, 50);
    doc.text(`Customer Address: ${bill.customerAddress}`, 14, 60);
    doc.text(`Mobile Number: ${bill.mobileNumber}`, 14, 70);
    doc.autoTable({
      startY: 80,
      head: [["Description", "Amount"]],
      body: [
        ["Paid Amount", `${bill.paidAmount}`],
        ["Pending Amount", `${bill.pendingAmount}`],
        ["Total Amount", `${bill.paidAmount + bill.pendingAmount}`],
      ],
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    // doc.text("Thank you for your business!", 105, finalY, { align: "center" });
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
      if (
        !document.getElementById("search-dropdown").contains(e.target) &&
        !e.target.closest("input")
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 mt-12 bg-[#4C4C4D] min-h-screen">
    <h2 className="text-[#FEC111] text-xl font-bold text-center py-2 px-4 rounded-lg mb-6">
      Billing History
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
            placeholder="🔍 Filter and Search..."
            className="border border-[#F5F5F5] px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F5F5F5]"
          />
          {/* Dropdown Menu for Search Fields */}
          {isDropdownOpen && (
            <div
              id="search-dropdown"
              className="absolute top-12 left-0 bg-white border border-[#F5F5F5] rounded-md shadow-lg w-full z-10"
            >
              <div
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSearchFieldChange("customerName")}
              >
                Customer Name
              </div>
              <div
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSearchFieldChange("operatorName")}
              >
                Operator Name
              </div>
              <div
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSearchFieldChange("customerAddress")}
              >
                Customer Address
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="text-sm text-[#F5F5F5]">
        <b>Total Bills: {filteredData.length}</b>
      </div>
    </div>
    {error && <div className="text-red-500 text-center my-4">{error}</div>}
    {isLoading ? (
      <div className="text-center text-[#F5F5F5]">Loading...</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-[#F5F5F5] table-auto">
          <thead className="sticky top-0 bg-[#4C4C4D]">
            <tr className="bg-slate-400 text-sm text-[#F5F5F5]">
              <th
                className="border py-2 text-center cursor-pointer"
                onClick={() => handleSort("customerName")}
              >
                Customer Name{" "}
                {sortField === "customerName" &&
                  (sortOrder === "asc" ? " (A-Z)" : "(Z-A)")}
              </th>
              <th
                className="border text-center cursor-pointer"
                onClick={() => handleSort("paidAmount")}
              >
                Total Amount{" "}
                {sortField === "paidAmount" &&
                  (sortOrder === "asc" ? "(↑)" : "(↓)")}
              </th>
              <th className="border text-center">Operator Name</th>
              <th className="border text-center">Mobile Number</th>
              <th className="border text-center">Customer Address</th>
              <th className="border text-center">Actions</th>
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
                    Download Invoice
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
 