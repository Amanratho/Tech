import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/otp/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully!");
        setSuccess("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" }); // Reset form
      } else {
        toast.error(data.error || "Failed to send message.");
        setSuccess(data.error || "Failed to send message.");
      }
    } catch (error) {
      // console.error("Error:", error);
      setSuccess("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#4C4C4D] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="bg-[#333333] p-4 rounded-xl shadow-lg w-full max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1
          className="text-[#FEC111] text-center text-base sm:text-lg md:text-3xl font-extrabold mb-6"
        >
          Contact Us
        </h1>

        {success && (
          <p
            className={`text-center text-lg ${
              success.includes("successfully")
                ? "text-[#FEC111]"
                : "text-[#F5F5F5]"
            } mb-4`}
          >
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#F5F5F5]"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-[#F5F5F5] shadow-sm p-1 focus:ring-[#FEC111] focus:border-[#FEC111]"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#F5F5F5]"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-[#F5F5F5] shadow-sm p-1 focus:ring-[#FEC111] focus:border-[#FEC111]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-[#F5F5F5]"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="6"
              className="mt-1 block w-full rounded-md border-[#F5F5F5] shadow-sm p-1 focus:ring-[#FEC111] focus:border-[#FEC111]"
              placeholder="Write your message"
            />
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="submit"
              disabled={loading}
              className={`w-full bg-[#F8981D] text-[#F5F5F5] py-1 rounded-md font-semibold transition-all ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#D9781A]"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;
