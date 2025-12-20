// import React from "react";
// import { motion } from "framer-motion";
// import { assets } from "../../assets/image/assest";
// import { useTranslation } from "react-i18next";

// const AboutUs = () => {
//   const { t } = useTranslation();
//   return (
//     <div className="relative bg-[#0E0E0E] min-h-screen flex flex-col items-center overflow-hidden">
//       {/* Animated background accents */}
//       <motion.div
//         className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full blur-3xl"
//         style={{ background: "radial-gradient(closest-side,#FEC11160,#FEC11110,transparent)" }}
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 1.2, ease: "easeOut" }}
//       />
//       <motion.div
//         className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full blur-3xl"
//         style={{ background: "radial-gradient(closest-side,#22d3ee50,#22d3ee10,transparent)" }}
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
//       />

//       <motion.div
//         className="relative z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
//         initial={{ opacity: 0, y: 24 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         {/* Hero / Intro */}
//         <motion.div
//           className="bg-[#161616]/80 backdrop-blur-md border border-white/10 text-white p-6 sm:p-10 rounded-2xl shadow-2xl"
//           initial={{ opacity: 0, y: 24 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.3 }}
//           transition={{ duration: 0.8 }}
//         >
//           <motion.h1
//             className="text-[#FEC111] text-center text-2xl sm:text-4xl font-extrabold tracking-tight"
//             initial={{ scale: 0.95, opacity: 0 }}
//             whileInView={{ scale: 1, opacity: 1 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//           >
//             {t("aboutUs")}
//           </motion.h1>

//           <motion.div
//             className="text-center mt-4 sm:mt-6"
//             initial={{ opacity: 0, y: 16 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6, delay: 0.1 }}
//           >
//             <h2 className="text-xl sm:text-3xl font-semibold text-white">
//               {t("welcomeToTechDiary")}
//             </h2>
//             <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-300 leading-relaxed mx-auto max-w-3xl">
//               {t("aboutDescription")}
//             </p>
//           </motion.div>

//           {/* Mission / Vision */}
//           <motion.div
//             className="grid md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12"
//             initial="hidden"
//             whileInView="show"
//             viewport={{ once: true, amount: 0.2 }}
//             variants={{
//               hidden: {},
//               show: {
//                 transition: { staggerChildren: 0.15 }
//               }
//             }}
//           >
//             {[{
//               title: t("ourMission"),
//               desc: t("missionDescription"),
//               accent: "#FEC111"
//             }, {
//               title: t("ourVision"),
//               desc: t("visionDescription"),
//               accent: "#22d3ee"
//             }].map((card, idx) => (
//               <motion.div
//                 key={idx}
//                 className="group relative overflow-hidden bg-[#1E1E1E] p-6 sm:p-8 rounded-xl shadow-xl border border-white/10"
//                 variants={{
//                   hidden: { opacity: 0, y: 24 },
//                   show: { opacity: 1, y: 0 }
//                 }}
//                 whileHover={{ y: -4 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 18 }}
//               >
//                 <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: `linear-gradient(135deg, ${card.accent}, transparent)` }} />
                
//                 <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: card.accent }}>
//                   {card.title}
//                 </h3>
//                 <p className="text-base sm:text-lg text-gray-300">
//                   {card.desc}
//                 </p>
//               </motion.div>
//             ))}
//           </motion.div>

//           {/* Team */}
//           <motion.h3
//             className="text-2xl sm:text-3xl text-[#FEC111] font-semibold text-center mt-10 sm:mt-14"
//             initial={{ opacity: 0, y: 12 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//           >
//             {t("meetTheTeam")}
//           </motion.h3>

//           <motion.div
//             className="mt-5 sm:mt-8 flex flex-wrap justify-center gap-6 sm:gap-10"
//             initial="hidden"
//             whileInView="show"
//             viewport={{ once: true, amount: 0.2 }}
//             variants={{
//               hidden: {},
//               show: { transition: { staggerChildren: 0.12 } }
//             }}
//           >
//             {[
//               { img: assets.amanPitcher, name: t("amanName"), role: t("amanRole") },
//               { img: assets.kuldeepPitcher, name: t("kuldeepName"), role: t("kuldeepRole") },
//               { img: assets.AzharSirPitcher, name: t("azharName"), role: t("azharRole") }
//             ].map((member, index) => (
//               <motion.div
//                 key={index}
//                 className="bg-[#101010] text-center p-4 sm:p-6 rounded-xl w-48 sm:w-64 shadow-lg border border-white/10"
//                 variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
//                 whileHover={{ y: -6, rotate: -0.4 }}
//                 transition={{ type: "spring", stiffness: 200, damping: 18 }}
//               >
//                 <div className="relative mx-auto mb-3 sm:mb-4 w-20 sm:w-28 h-20 sm:h-28">
//                   <motion.img
//                     src={member.img}
//                     alt={member.name}
//                     className="w-20 sm:w-28 h-20 sm:h-28 rounded-full border-2 border-[#FEC111] object-cover"
//                     whileHover={{ scale: 1.05 }}
//                     transition={{ type: "spring", stiffness: 200, damping: 16 }}
//                   />
//                   <motion.span
//                     className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border border-[#0E0E0E]"
//                     style={{ backgroundColor: "#22c55e" }}
//                     initial={{ scale: 0 }}
//                     whileInView={{ scale: 1 }}
//                     viewport={{ once: true }}
//                     transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
//                   />
//                 </div>
//                 <h4 className="text-lg sm:text-xl font-semibold text-white">{member.name}</h4>
//                 <p className="text-xs sm:text-sm text-gray-400">{member.role}</p>
//               </motion.div>
//             ))}
//           </motion.div>

//           {/* CTA */}
//           <motion.div
//             className="text-center mt-10 sm:mt-14"
//             initial={{ opacity: 0, y: 16 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//           >
//             <a
//               href="/contact"
//               className="inline-block rounded-full px-6 py-3 text-sm sm:text-base font-semibold text-black"
//               style={{ background: "linear-gradient(90deg,#FEC111,#facc15)" }}
//             >
//               {t("contactUs")}
//             </a>
//           </motion.div>

//           {/* Footer */}
//           <div className="text-center mt-8 sm:mt-12">
//             <p className="text-xs sm:text-sm text-gray-400">
//               {t("copyright", { year: new Date().getFullYear() })}
//             </p>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>

//   );
// };

// export default AboutUs;


import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/image/assest";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaBullseye, FaEye, FaUsers, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Assuming you use react-router

const AboutUs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Hook for navigation

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    // 1. MAIN CONTAINER
    <div className="min-h-screen flex flex-col bg-[#121212] text-white font-sans overflow-hidden">
      
      {/* 2. APP HEADER */}
      <div className="px-4 py-3 flex items-center justify-between sticky top-0 z-20 bg-[#121212] border-b border-[#2C2C2C]">
        <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-[#2C2C2C]">
                <FaChevronLeft className="text-lg text-white" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-wide">{t("aboutUs")}</h1>
        </div>
      </div>

      {/* 3. SCROLLABLE CONTENT */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto pb-24 no-scrollbar"
      >
        
        {/* HERO SECTION */}
        <motion.div variants={item} className="px-5 pt-6 pb-2 text-center">
            {/* Logo Placeholder or Icon */}
            <div className="w-20 h-20 mx-auto bg-[#1E1E1E] rounded-3xl flex items-center justify-center mb-4 border border-[#333] shadow-[0_0_15px_rgba(254,193,17,0.2)]">
                <span className="text-3xl font-bold text-[var(--primary)]">R</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t("welcomeToTechDiary")}</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t("aboutDescription")}
            </p>
        </motion.div>

        {/* MISSION & VISION (Vertical Cards) */}
        <div className="px-5 mt-8 space-y-4">
            
            {/* Mission Card */}
            <motion.div variants={item} className="bg-[#1E1E1E] p-5 rounded-3xl border border-[#2C2C2C] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FaBullseye className="text-6xl text-[var(--primary)]" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#2C2C2C] rounded-full text-[var(--primary)]">
                        <FaBullseye />
                    </div>
                    <h3 className="font-bold text-lg">{t("ourMission")}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed relative z-10">
                    {t("missionDescription")}
                </p>
            </motion.div>

            {/* Vision Card */}
            <motion.div variants={item} className="bg-[#1E1E1E] p-5 rounded-3xl border border-[#2C2C2C] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FaEye className="text-6xl text-cyan-400" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#2C2C2C] rounded-full text-cyan-400">
                        <FaEye />
                    </div>
                    <h3 className="font-bold text-lg">{t("ourVision")}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed relative z-10">
                    {t("visionDescription")}
                </p>
            </motion.div>
        </div>

        {/* TEAM SECTION (Horizontal Scroll) */}
        <div className="mt-8 pl-5">
            <motion.div variants={item} className="flex items-center justify-between pr-5 mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <FaUsers className="text-[var(--primary)] text-sm"/> {t("meetTheTeam")}
                </h3>
                <span className="text-xs text-gray-500">Swipe &rarr;</span>
            </motion.div>
            
            {/* Horizontal Scroll Container */}
            <motion.div 
                className="flex gap-4 overflow-x-auto pb-4 pr-5 no-scrollbar"
                variants={item}
            >
                {[
                  { img: assets.amanPitcher, name: t("amanName"), role: t("amanRole") },
                  { img: assets.kuldeepPitcher, name: t("kuldeepName"), role: t("kuldeepRole") },
                  { img: assets.AzharSirPitcher, name: t("azharName"), role: t("azharRole") }
                ].map((member, index) => (
                    <div key={index} className="flex-shrink-0 w-36 bg-[#1E1E1E] p-3 rounded-2xl border border-[#2C2C2C] text-center">
                        <div className="w-16 h-16 mx-auto mb-3 relative">
                            <img 
                                src={member.img} 
                                alt={member.name} 
                                className="w-full h-full rounded-full object-cover border-2 border-[var(--primary)]"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-[#1E1E1E]"></div>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{member.name}</h4>
                        <p className="text-[10px] text-gray-400 truncate">{member.role}</p>
                    </div>
                ))}
            </motion.div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 pb-4">
             <p className="text-[10px] text-gray-600">
               © {new Date().getFullYear()} RentVeda. All rights reserved.
             </p>
        </div>

      </motion.div>

      {/* 4. STICKY BOTTOM BUTTON */}
      <div className="p-4 bg-[#121212] sticky bottom-0 border-t border-[#222]">
        <a 
            href="/contact"
            className="w-full h-11 rounded-full font-semibold text-sm shadow-md flex items-center justify-center gap-2 text-black bg-[var(--primary)]"
        >
          {t("contactUs")} <FaArrowRight className="text-xs"/>
        </a>
      </div>

    </div>
  );
};

export default AboutUs;