import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/image/assest";

const AboutUs = () => {
  return (
    <div className="bg-[#1E1E1E] min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-6xl w-full bg-[#2A2A2A] text-white p-6 sm:p-10 rounded-2xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-[#FEC111] text-center text-2xl sm:text-4xl font-bold mb-6 sm:mb-8">
          About Us
        </h1>

        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-semibold text-white">
            Welcome to Tech Diary
          </h2>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-300 leading-relaxed">
            At Tech Diary, we are committed to revolutionizing machinery rental
            management. Our easy-to-use platform helps businesses streamline
            operations, ensuring efficiency and transparency in rental tracking.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-[#333] p-6 sm:p-8 rounded-xl shadow-md text-center">
            <h3 className="text-xl sm:text-2xl text-[#FEC111] font-semibold mb-2 sm:mb-4">
              Our Mission
            </h3>
            <p className="text-base sm:text-lg text-gray-300">
              To simplify machinery rentals by offering a seamless, digital
              management experience that enhances efficiency and transparency.
            </p>
          </div>

          <div className="bg-[#333] p-6 sm:p-8 rounded-xl shadow-md text-center">
            <h3 className="text-xl sm:text-2xl text-[#FEC111] font-semibold mb-2 sm:mb-4">
              Our Vision
            </h3>
            <p className="text-base sm:text-lg text-gray-300">
              Empower businesses of all sizes with the tools to optimize their
              rental operations and maximize profitability.
            </p>
          </div>
        </div>

        <h3 className="text-2xl sm:text-3xl text-[#FEC111] font-semibold text-center mt-8 sm:mt-12 mb-4 sm:mb-6">
          Meet the Team
        </h3>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {[
            {
              img: assets.amanPitcher,
              name: "Aman Rathod",
              role: "CEO & Founder",
            },
            {
              img: assets.kuldeepPitcher,
              name: "Kuldeep Mangrola",
              role: "Co-Founder & CTO",
            },

            {
              img: assets.AzharSirPitcher,
              name: "Mr. Azhar Ali",
              role: "Mentor",
            },
          ].map((member, index) => (
            <div
              key={index}
              className="bg-[#2A2A2A] text-center p-4 sm:p-6 rounded-xl w-48 sm:w-64 shadow-lg"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-20 sm:w-28 h-20 sm:h-28 mx-auto rounded-full border-2 border-[#FEC111] mb-2 sm:mb-4"
              />
              <h4 className="text-lg sm:text-xl font-semibold text-[#FEC111]">
                {member.name}
              </h4>
              <p className="text-xs sm:text-sm text-gray-300">{member.role}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <p className="text-xs sm:text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Tech Diary. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
