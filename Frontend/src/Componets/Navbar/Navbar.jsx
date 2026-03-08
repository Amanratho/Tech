import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

function Navbar() {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const uid = localStorage.getItem("uid");

  const { i18n, t } = useTranslation();

  // const changeLanguage = (lng) => {
  //   i18n.changeLanguage(lng);
  //   localStorage.setItem("selectedLanguage", lng);
  // };
  useEffect(() => {
    initializeLanguage();
  }, []);
  
  const initializeLanguage = () => {
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    i18n.changeLanguage(savedLanguage);
  };
  
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

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ToastContainer style={{ zIndex: "999" }} />
      <div className="bg-yellow-600 fixed top-0 m-0 w-full z-50 h-16 shadow-lg backdrop-blur-md">
        <div className="flex justify-between items-center px-6 h-14 text-yellow-400">
          <div className="font-semibold text-4xl flex flex-row gap-4 items-center justify-center">
            <h2 className=" text-white text-base sm:text-sm md:text-lg lg:text-xl tracking-wide pt-1">
              <NavLink
                to="/"
                className={
                  "block no-underline py-2 px-4 font-bold text-white mx-auto"
                }
              >
               Tech Diary
              </NavLink>
            </h2>
          </div>

          <button
            className="lg:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          <div
            className={`${
              isOpen ? "block" : "hidden"
            } lg:flex lg:items-center lg:space-x-6 absolute lg:static top-14 left-0 w-full lg:w-auto lg:bg-transparent transform transition-all duration-300 pt-3 ${
              isOpen
                ? "bg-yellow-500 text-slate-500"
                : "bg-slate-500 text-yellow-500"
            }`}
          >
            <ul className="flex flex-col lg:flex-row lg:space-x-6 lg:space-y-0 space-y-4 px-2 lg:px-0 py-4 lg:py-0">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "block no-underline py-2 px-4 font-semibold text-white mx-auto"
                      : "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
                  }
                  onClick={closeMenu}
                >
                  {t("home")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    isActive
                      ? "block no-underline py-2 px-4 font-semibold text-white mx-auto"
                      : "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
                  }
                  onClick={closeMenu}
                >
                  {t("contact")}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive
                      ? "block no-underline py-2 px-4 font-semibold text-white mx-auto"
                      : "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
                  }
                  onClick={closeMenu}
                >
                  {t("about")}
                </NavLink>
              </li>

              {/* Language Switcher */}
              <li>
                <button
                  onClick={toggleLanguage}
                  className={ 
                    "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
                  }
                >
                  {i18n.language === "en" ? "हिन्दी" : "English"}
                </button>
              </li>

              <li>
                {uid ? (
                  <div className="font-semibold text-4xl flex flex-row gap-4 items-center justify-start ml-7">
                    <NavLink to="/profile" onClick={closeMenu}>
                      <FaUserCircle className="border-2 rounded-full border-slate-500 p-1 transform transition-all duration-300 text-slate-700" />
                    </NavLink>
                  </div>
                ) : (
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive
                        ? "block no-underline py-2 px-4 font-semibold text-white mx-auto"
                        : "block no-underline py-2 px-4 text-gray-600 font-semibold hover:text-white lg:hover:bg-transparent transition-all duration-300 transform hover:scale-110"
                    }
                    onClick={closeMenu}
                  >
                    {t("login")}
                  </NavLink>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
