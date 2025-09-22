import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/image/assest";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();
  return (
    <div className="relative bg-[#0E0E0E] min-h-screen flex flex-col items-center overflow-hidden">
      {/* Animated background accents */}
      <motion.div
        className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side,#FEC11160,#FEC11110,transparent)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side,#22d3ee50,#22d3ee10,transparent)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
      />

      <motion.div
        className="relative z-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero / Intro */}
        <motion.div
          className="bg-[#161616]/80 backdrop-blur-md border border-white/10 text-white p-6 sm:p-10 rounded-2xl shadow-2xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-[#FEC111] text-center text-2xl sm:text-4xl font-extrabold tracking-tight"
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t("aboutUs")}
          </motion.h1>

          <motion.div
            className="text-center mt-4 sm:mt-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-xl sm:text-3xl font-semibold text-white">
              {t("welcomeToTechDiary")}
            </h2>
            <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-300 leading-relaxed mx-auto max-w-3xl">
              {t("aboutDescription")}
            </p>
          </motion.div>

          {/* Mission / Vision */}
          <motion.div
            className="grid md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            {[{
              title: t("ourMission"),
              desc: t("missionDescription"),
              accent: "#FEC111"
            }, {
              title: t("ourVision"),
              desc: t("visionDescription"),
              accent: "#22d3ee"
            }].map((card, idx) => (
              <motion.div
                key={idx}
                className="group relative overflow-hidden bg-[#1E1E1E] p-6 sm:p-8 rounded-xl shadow-xl border border-white/10"
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: `linear-gradient(135deg, ${card.accent}, transparent)` }} />
                
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: card.accent }}>
                  {card.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-300">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Team */}
          <motion.h3
            className="text-2xl sm:text-3xl text-[#FEC111] font-semibold text-center mt-10 sm:mt-14"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t("meetTheTeam")}
          </motion.h3>

          <motion.div
            className="mt-5 sm:mt-8 flex flex-wrap justify-center gap-6 sm:gap-10"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } }
            }}
          >
            {[
              { img: assets.amanPitcher, name: t("amanName"), role: t("amanRole") },
              { img: assets.kuldeepPitcher, name: t("kuldeepName"), role: t("kuldeepRole") },
              { img: assets.AzharSirPitcher, name: t("azharName"), role: t("azharRole") }
            ].map((member, index) => (
              <motion.div
                key={index}
                className="bg-[#101010] text-center p-4 sm:p-6 rounded-xl w-48 sm:w-64 shadow-lg border border-white/10"
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -6, rotate: -0.4 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <div className="relative mx-auto mb-3 sm:mb-4 w-20 sm:w-28 h-20 sm:h-28">
                  <motion.img
                    src={member.img}
                    alt={member.name}
                    className="w-20 sm:w-28 h-20 sm:h-28 rounded-full border-2 border-[#FEC111] object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  />
                  <motion.span
                    className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border border-[#0E0E0E]"
                    style={{ backgroundColor: "#22c55e" }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
                  />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-white">{member.name}</h4>
                <p className="text-xs sm:text-sm text-gray-400">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center mt-10 sm:mt-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <a
              href="/contact"
              className="inline-block rounded-full px-6 py-3 text-sm sm:text-base font-semibold text-black"
              style={{ background: "linear-gradient(90deg,#FEC111,#facc15)" }}
            >
              {t("contactUs")}
            </a>
          </motion.div>

          {/* Footer */}
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-xs sm:text-sm text-gray-400">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>

  );
};

export default AboutUs;
