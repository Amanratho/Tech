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

const Footer = () => {
  return (
    <footer className="bg-[#4C4C4D] text-white py-10 relative">
      <div className="container mx-auto px-6 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {/* Logo and Tagline */}
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-extrabold text-yellow-500 mb-2">
              Tech Diary
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Revolutionizing machinery rentals with simplicity and efficiency.
              Your success, our priority.
            </p>
          </div>

          {/* Navigation Links */}
           <div className="items-center flex flex-col">
            {/* <h3 className="text-xl font-semibold text-yellow-500 mb-4">Explore</h3> */}
            <ul className="text-lg font-semibold text-yellow-500  flex flex-col items-start ">
              {" "}
              Explore
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-yellow-400 no-underline transition duration-300 text-sm font-medium "
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-yellow-400 no-underline transition duration-300 text-sm font-medium text-left"
                >
                  About Us
                </Link>
              </li>
              {/* <li><Link to="/feature" className="text-white hover:text-yellow-400 no-underline transition duration-300 text-sm font-medium text-left">Features</Link></li> */}
              <li>
                <Link
                  to="/machinery"
                  className="text-gray-400 hover:text-yellow-400 no-underline transition duration-300 text-sm font-medium text-left"
                >
                  Explore Machinery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-yellow-500 mb-1">
              Contact Us
            </h3>
            <div className="flex gap-1 text-gray-400">
            <FaEnvelope 
                size={12}
               
                className="mt-2"
              ></FaEnvelope >
            <p className="">
              techdiary562@gmail.com
            </p>
            </div>
            <div className="flex gap-1 text-gray-400">
              <FaPhone
                size={12}
                style={{ transform: "scaleX(-1)" }}
                className="mt-1"
              ></FaPhone>
              <p className=" text-sm m"> +91 7879686558</p>
            </div>
            <div className="flex gap-1 text-gray-400 ">
              <FaPhone
                size={12}
                style={{ transform: "scaleX(-1)" }}
                className="mt-1"
              ></FaPhone>
              <p className=" text-sm m"> +91 9109124564</p>
            </div>
            <div className="flex gap-1 text-gray-400">
            <FaMapMarkerAlt
                size={12}
                
                className="mt-1"
              ></FaMapMarkerAlt>
              <p className=" text-sm">
                Address: Khal,Khategaon,Dewas,MP
              </p>
              
            </div>
          </div>

          {/* Social Media and Newsletter */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-yellow-500 mb-3">
              Stay Connected
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
                rel="noopener noreferrer"
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
          &copy; {new Date().getFullYear()} Tech Diary. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
