import axios from "axios";

// Function to send a keep-alive request every 10 minutes
export const keepAlive = () => {
  setInterval(async () => {
    try {
      await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ping`);
      console.log("🔄 Keep-alive request sent");
    } catch (error) {
      console.error("❌ Keep-alive request failed:", error.message);
    }
  }, 600000); // Every 10 minutes (600,000 ms)
};
