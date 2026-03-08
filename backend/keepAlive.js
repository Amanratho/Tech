import axios from "axios";

// Function to send a keep-alive request every 10 minutes
export const keepAlive = () => {
  setInterval(async () => {
    try {
      const backendUrl = process.env.VITE_BACKEND_URL || "http://localhost:3000";

      // Backend pe hi direct API call
      const response = await axios.get(`${backendUrl}/ping`);
      console.log("🔄 Keep-alive request sent to:", backendUrl);
      console.log("✅ Server Response:", response.data);
    } catch (error) {
      console.error("❌ Keep-alive request failed:", error.message);
    }
  }, 1200000); // Every 12 minutes (600,000 ms)
};
