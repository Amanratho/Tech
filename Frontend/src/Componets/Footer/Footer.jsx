import React from "react";
import { Link, NavLink } from "react-router-dom";

import {
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Footer = () => {
   const { t } = useTranslation();
  return (
    <footer className="bg-[#4C4C4D] text-white py-10 relative">
      <div className="container mx-auto px-6 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {/* Logo and Tagline */}
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-extrabold text-yellow-500 mb-2">
              {t("tech_diary")}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="items-center flex flex-col">
            <ul className="text-lg font-semibold text-yellow-500 flex flex-col items-start">
              {t("explore")}
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-yellow-400 no-underline transition duration-300 text-sm font-medium"
                >
                  {t("contact_us")}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-yellow-400 no-underline transition duration-300 text-sm font-medium"
                >
                  {t("about_us")}
                </Link>
              </li>
              <li>
                <Link
                  to="/machinery"
                  className="text-gray-400 hover:text-yellow-400 no-underline transition duration-300 text-sm font-medium"
                >
                  {t("explore_machinery")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-yellow-500 mb-1">
              {t("contact_us")}
            </h3>
            <div className="flex gap-1 text-gray-400">
              <FaEnvelope size={12} className="mt-2" />
              <p>techdiary562@gmail.com</p>
            </div>
            <div className="flex gap-1 text-gray-400">
              <FaPhone
                size={12}
                style={{ transform: "scaleX(-1)" }}
                className="mt-1"
              />
              <p className="text-sm">+91 7879686558</p>
            </div>
            <div className="flex gap-1 text-gray-400">
              <FaPhone
                size={12}
                style={{ transform: "scaleX(-1)" }}
                className="mt-1"
              />
              <p className="text-sm">+91 9109124564</p>
            </div>
            <div className="flex gap-1 text-gray-400">
              <FaMapMarkerAlt size={12} className="mt-1" />
              <p className="text-sm">{t("address")}</p>
            </div>
          </div>

          {/* Social Media and Newsletter */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-yellow-500 mb-3">
              {t("stay_connected")}
            </h3>
            <div className="mt-4 flex justify-center space-x-4">
              <a
                href="https://www.instagram.com/techdiary44/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500"
              >
                <FaInstagram size={20} />
              </a>
              <NavLink
                to={"/contact"}
                className="text-gray-400 hover:text-yellow-500"
              >
                <FaEnvelope size={20} />
              </NavLink>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500"
              >
                <FaTwitter size={20} />
              </a>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 my-6" />

        <div className="text-center text-gray-500 text-sm animate-slide-up">
          &copy; {new Date().getFullYear()} {t("tech_diary")}.{" "}
          {t("all_rights_reserved")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
