import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FaUserCircle, FaPencilAlt, FaSignOutAlt, FaCog } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // dispatch({ type: "LOGOUT" });
    //             localStorage.removeItem("token");
    //             localStorage.removeItem("uid");
    //             closeToast();
    //             window.location.href = "/login";

    const fetchUserProfile = async () => {
      const uid = localStorage.getItem("uid");
      if (!uid) {
        toast.error("User ID not found. Please log in again.");
        window.location.href = "/login";
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/${uid}`
        );
        setUser(response.data);
      } catch (error) {
        toast.error("Failed to fetch user profile");
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <p className="text-gray-800 font-medium">
            Are you sure you want to log out?
          </p>
          <div className="flex justify-end gap-4">
            <button
              className="bg-yellow-500 text-gray-800 px-4 py-1 rounded hover:bg-yellow-600"
              onClick={() => {
                dispatch({ type: "LOGOUT" });
                localStorage.removeItem("token");
                localStorage.removeItem("uid");
                closeToast();
                window.location.href = "/login";
              }}
            >
              Yes
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
              onClick={closeToast}
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#4C4C4D] mt-16 text-[#F5F5F5]">
      <div className="max-w-6xl mx-auto p-6">
        {!user ? (
          <p className="text-center text-[#F5F5F5]">Loading...</p>
        ) : (
          <>
            <motion.div
              className="flex flex-col md:flex-row justify-between items-center mb-10 p-8 bg-[#333333] rounded-xl shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="border-4 border-[#FEC111] rounded-full p-6 mb-4"
                >
                  <FaUserCircle className="text-6xl text-[#F5F5F5]" />
                </motion.div>

                <motion.h1
                  className="text-3xl font-bold text-[#FEC111]"
                  whileHover={{ scale: 1.1 }}
                >
                  {user.username}
                </motion.h1>
                <p className="text-lg text-[#F5F5F5]">{user.mobileNo}</p>
                <p className="text-sm text-[#F5F5F5]">
                  <b>{user.email}</b>
                </p>
                <p className="text-sm text-[#F5F5F5]">
                  <b>{user.companyName}</b>
                </p>
              </div>

              <div className="flex flex-col justify-center text-center mt-8 md:mt-0 space-y-6">
                <div className="flex flex-col items-center bg-[#333333] py-2 px-8 rounded-lg shadow-md">
                  {user.qrCodeUrl ? (
                    <img
                      src={user.qrCodeUrl}
                      alt="QR Code Preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                  ) : (
                    <p className="text-[#F5F5F5] text-sm">
                      No QR uploaded yet.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              <Link
                to={"/Machinery-Update"}
                className="bg-[#F8981D] text-[#4C4C4D] px-6 no-underline rounded-lg flex items-center justify-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#F8981D] text-[#4C4C4D] px-6 rounded-lg flex items-center justify-center gap-3"
                >
                  <FaPencilAlt className="text-xl" />
                  Update Machinery
                </motion.button>
              </Link>

              <Link
                to={"/EditProfile"}
                className="bg-[#F8981D] text-[#4C4C4D] px-6 no-underline rounded-lg flex items-center justify-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#F8981D] text-[#4C4C4D] px-6 rounded-lg flex items-center justify-center gap-3 "
                >
                  <FaCog className="text-xl" />
                  Edit Profile
                </motion.button>
              </Link>

              <motion.button
                // whileHover={{ scale: 1.05 }}
                onClick={handleLogout}
                className="bg-[#F8981D] text-[#4C4C4D] py-3 px-6 rounded-lg flex items-center justify-center gap-3 hover:bg-[#D9781A]"
              >
                <FaSignOutAlt className="text-xl" />
                Logout
                {/* <ToastContainer /> */}
              </motion.button>
            </motion.div>

            <footer className="text-center text-[#F5F5F5] mb-6">
              <p>&copy; 2024 {user.username}. All rights reserved.</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
