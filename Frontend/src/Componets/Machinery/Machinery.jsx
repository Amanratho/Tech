import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Machinary.css";

function Machinery() {
  const [machines, setMachines] = useState([]);
  const navigate = useNavigate();

  const handleButtonClick = (machine) => {
    navigate("/start-entry", {
      state: {
        rentType: machine.RentType,
        machineId: machine.Machine_id,
        machineName: machine.Machine_name,
      },
    });
  };

  useEffect(() => {
   
    const fetchMachines = async () => {
      try {
        const uid = localStorage.getItem("uid");
        if (uid) {
          const response = await axios.post(
            "http://localhost:3000/api/machines",
            { uid }
          );
          console.log("client data :", response);
          setMachines(response.data);
        }
        else{
          console.log("user not log in");
          
        }

        
      } catch (error) {
        console.log("Error fetching machine data:", error);
      }
    };

    fetchMachines();
  }, []);

  return (
    <div className="bg-[#4C4C4D] px-3 py-2">
    <h2
      className="text-center text-[#FEC111] 
          text-lg sm:text-xl md:text-3xl 
          font-extrabold mb-6"
    >
      Explore Our Machines
    </h2>
  
    <div className="overflow-x-auto overflow-auto scrollbar-none">
      <div className="flex space-x-4 px-1 py-4">
        {(machines.length > 0 ? machines : [{ _id: "dummy", Machine_name: "Please Add Your Machine", image: "/placeholder.jpg" }]).map((item) => (
          <motion.div
            key={item._id}
            className="flex-shrink-0 bg-[#333333] text-[#F5F5F5] rounded-lg shadow-lg"
            style={{ width: "14rem" }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img
              className="h-36 w-full object-cover rounded-t-lg"
              src={item.image}
              alt={`Machine ${item._id}`}
            />
            <div className="p-4">
              <h5 className="text-sm font-semibold text-[#FEC111] flex justify-center items-start">
                {item.Machine_name}
              </h5>
              {item._id === "dummy" ? (
                <button
                  onClick={() => window.location.href = "/add-machinery"}
                  className="w-full bg-[#F8981D] text-[#4C4C4D] py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
                >
                  Add Machine
                </button>
              ) : (
                <button
                  onClick={() => handleButtonClick(item)}
                  className="w-full bg-[#F8981D] text-[#4C4C4D] py-1 rounded-md font-semibold hover:bg-[#D9781A] transition-all"
                >
                  New Entry
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
  
  
  );
}

export default Machinery;
