// import React, { useState, useEffect } from "react";
// import { Link, NavLink } from "react-router-dom";
// import { FaUserCircle } from "react-icons/fa";
// import { useSelector, useDispatch } from "react-redux";
// import { ToastContainer } from "react-toastify";
// import { useTranslation } from "react-i18next";

// function Navbar() {
//   const dispatch = useDispatch();
//   const [isOpen, setIsOpen] = useState(false);
//   const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
//   const uid = localStorage.getItem("uid");

//   const { i18n, t } = useTranslation();

//   // const changeLanguage = (lng) => {
//   //   i18n.changeLanguage(lng);
//   //   localStorage.setItem("selectedLanguage", lng);
//   // };
//   useEffect(() => {
//     initializeLanguage();
//   }, []);
  
//   const initializeLanguage = () => {
//     const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
//     i18n.changeLanguage(savedLanguage);
//   };
  
//   const toggleLanguage = () => {
//     const newLang = i18n.language === "en" ? "hi" : "en";
//     i18n.changeLanguage(newLang);
//     localStorage.setItem("selectedLanguage", newLang);
//   };
  
  

//   useEffect(() => {
//     const storedLoginState = localStorage.getItem("isLoggedIn");
//     if (storedLoginState === "true" && !isLoggedIn) {
//       dispatch({ type: "LOGIN" });
//     }
//   }, [dispatch, isLoggedIn]);

//   const closeMenu = () => {
//     setIsOpen(false);
//   };

//   return (
//     <>
//       <ToastContainer style={{ zIndex: "999" }} />
//       <div className="bg-yellow-600 fixed top-0 m-0 w-full z-50 h-16 shadow-lg backdrop-blur-md">
//         <div className="flex justify-between items-center px-6 h-14 text-yellow-400">
//           <div className="font-semibold text-4xl flex flex-row gap-4 items-center justify-center">
//             <h2 className=" text-white text-base sm:text-sm md:text-lg lg:text-xl tracking-wide pt-1">
//               <NavLink
//                 to="/"
//                 className={
//                   "block no-underline py-2 px-4 font-bold text-white mx-auto"
//                 }
//               >
//                Tech Diary
//               </NavLink>
//             </h2>
//           </div>

//           <button
//             className="lg:hidden text-white"
//             onClick={() => setIsOpen(!isOpen)}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
//               />
//             </svg>
//           </button>

//           <div
//             className={`${
//               isOpen ? "block" : "hidden"
//             } lg:flex lg:items-center lg:space-x-6 absolute lg:static top-14 left-0 w-full lg:w-auto lg:bg-transparent transform transition-all duration-300 pt-3 ${
//               isOpen
//                 ? "bg-yellow-500 text-slate-500"
//                 : "bg-slate-500 text-yellow-500"
//             }`}
//           >
//             <ul className="flex flex-col lg:flex-row lg:space-x-6 lg:space-y-0 space-y-4 px-2 lg:px-0 py-4 lg:py-0">
//               <li>
//                 <NavLink
//                   to="/"
//                   className={({ isActive }) =>
//                     isActive
//                       ? "block no-underline py-2 px-4 font-semibold text-white mx-auto"
//                       : "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
//                   }
//                   onClick={closeMenu}
//                 >
//                   {t("home")}
//                 </NavLink>
//               </li>
//               <li>
//                 <NavLink
//                   to="/contact"
//                   className={({ isActive }) =>
//                     isActive
//                       ? "block no-underline py-2 px-4 font-semibold text-white mx-auto"
//                       : "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
//                   }
//                   onClick={closeMenu}
//                 >
//                   {t("contact")}
//                 </NavLink>
//               </li>
//               <li>
//                 <NavLink
//                   to="/about"
//                   className={({ isActive }) =>
//                     isActive
//                       ? "block no-underline py-2 px-4 font-semibold text-white mx-auto"
//                       : "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
//                   }
//                   onClick={closeMenu}
//                 >
//                   {t("about")}
//                 </NavLink>
//               </li>

//               {/* Language Switcher */}
//               <li>
//                 <button
//                   onClick={toggleLanguage}
//                   className={ 
//                     "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
//                   }
//                 >
//                   {i18n.language === "en" ? "हिन्दी" : "English"}
//                 </button>
//               </li>

//               <li>
//                 {uid ? (
//                   <div className="font-semibold text-4xl flex flex-row gap-4 items-center justify-start ml-7">
//                     <NavLink to="/profile" onClick={closeMenu}>
//                       <FaUserCircle className="border-2 rounded-full border-slate-500 p-1 transform transition-all duration-300 text-slate-700" />
//                     </NavLink>
//                   </div>
//                 ) : (
//                   <NavLink
//                     to="/login"
//                     className={({ isActive }) =>
//                       isActive
//                         ? "block no-underline py-2 px-4 font-semibold text-white mx-auto"
//                         : "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
//                     }
//                     onClick={closeMenu}
//                   >
//                     {t("login")}
//                   </NavLink>
//                 )}
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Navbar;


import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaPhoneAlt, 
  FaInfoCircle, 
  FaUserCircle, 
  FaSignInAlt,
  FaLanguage,
  FaFileInvoice
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation(); // To track current active path
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const uid = localStorage.getItem("uid");

  const { i18n, t } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);
  
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("selectedLanguage", newLang);
  };

  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    if (storedLoginState === "true" && !isLoggedIn) {
      dispatch({ type: "LOGIN" });
    }
  }, [dispatch, isLoggedIn]);

  // Menu items config for mapping
  const navItems = [
    { name: t("home") || "Home", path: "/", icon: FaHome },
    // { name: t("contact") || "Contact", path: "/contact", icon: FaPhoneAlt },
    { name: "Statement", path: "/statement", icon: FaFileInvoice },
    { name: t("about") || "About", path: "/about", icon: FaInfoCircle },
  ];

  return (
    <>
      <ToastContainer style={{ zIndex: "9999" }} theme="dark" />
      
      {/* =========================================
          1. TOP APP BAR (Logo & Language)
          ========================================= */}
      <div className="fixed top-0 left-0 w-full h-16 bg-[#121212]/95 backdrop-blur-md border-b border-[#2C2C2C] z-50 flex items-center justify-between px-4 sm:px-6">
        
        {/* Logo - Updated to RentVeda */}
        <NavLink to="/" className="flex items-center gap-2 no-underline hover:no-underline">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <span className="text-black font-black text-lg">R</span>
          </div>
          <span className="text-white font-extrabold text-lg tracking-wide">
            Rent<span className="text-[var(--primary)]">Veda</span>
          </span>
        </NavLink>

        {/* Desktop Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-bold no-underline hover:no-underline transition-all ${
                  isActive ? "text-[var(--primary)]" : "text-gray-400 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Right Section: Language & Profile(Desktop) */}
        <div className="flex items-center gap-3">
          {/* Language Toggle Pill */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-[#1E1E1E] border border-[#333] hover:border-[var(--primary)] px-3 py-1.5 rounded-full transition-all active:scale-95 text-xs font-bold text-gray-300"
          >
            <FaLanguage className="text-[var(--primary)]" size={14}/>
            {i18n.language === "en" ? "हिन्दी" : "ENG"}
          </button>

          {/* Desktop Profile Icon (Hidden on Mobile) */}
          <div className="hidden md:block border-l border-[#333] pl-3 ml-1">
            {uid ? (
              <NavLink to="/profile" className="no-underline hover:no-underline">
                <FaUserCircle size={26} className="text-gray-400 hover:text-[var(--primary)] transition-colors" />
              </NavLink>
            ) : (
              <NavLink to="/login" className="bg-[var(--primary)] text-black px-4 py-1.5 rounded-lg text-sm font-bold no-underline hover:no-underline hover:bg-yellow-500 transition-colors">
                {t("login") || "Login"}
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          2. BOTTOM TAB BAR (Mobile Only)
          ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#1E1E1E]/95 backdrop-blur-lg border-t border-[#2C2C2C] z-50 flex justify-around items-center px-2 pb-safe">
        
        {/* Render Nav Items */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center w-16 h-full relative no-underline hover:no-underline focus:no-underline"
            >
              {/* Active Indicator Dot/Glow */}
              {isActive && (
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1 w-8 h-1 bg-[var(--primary)] rounded-b-full shadow-[0_2px_10px_var(--primary)]"
                />
              )}
              
              <item.icon 
                size={isActive ? 22 : 20} 
                className={`mb-1 transition-all duration-300 ${
                  isActive ? "text-[var(--primary)]" : "text-gray-500"
                }`} 
              />
              <span className={`text-[9px] font-bold no-underline transition-all duration-300 ${
                isActive ? "text-[var(--primary)]" : "text-gray-500"
              }`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}

        {/* Profile / Login Tab */}
        <NavLink
          to={uid ? "/profile" : "/login"}
          className="flex flex-col items-center justify-center w-16 h-full relative no-underline hover:no-underline focus:no-underline"
        >
          {location.pathname === "/profile" || location.pathname === "/login" ? (
            <motion.div 
              layoutId="bottomNavIndicator"
              className="absolute -top-1 w-8 h-1 bg-[var(--primary)] rounded-b-full shadow-[0_2px_10px_var(--primary)]"
            />
          ) : null}
          
          {uid ? (
            <FaUserCircle size={location.pathname === "/profile" ? 22 : 20} className={`mb-1 transition-all duration-300 ${location.pathname === "/profile" ? "text-[var(--primary)]" : "text-gray-500"}`} />
          ) : (
            <FaSignInAlt size={location.pathname === "/login" ? 22 : 20} className={`mb-1 transition-all duration-300 ${location.pathname === "/login" ? "text-[var(--primary)]" : "text-gray-500"}`} />
          )}
          <span className={`text-[9px] font-bold no-underline transition-all duration-300 ${
            location.pathname === "/profile" || location.pathname === "/login" ? "text-[var(--primary)]" : "text-gray-500"
          }`}>
            {uid ? (t("profile") || "Profile") : (t("login") || "Login")}
          </span>
        </NavLink>
        
      </div>
    </>
  );
}

export default Navbar;