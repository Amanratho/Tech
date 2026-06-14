/**
 * Centralized API Configuration
 * 
 * Single source of truth for the backend API base URL.
 * Reads from VITE_BACKEND_URL env variable with a localhost fallback for development.
 * 
 * Usage:
 *   import { API_BASE_URL } from "../config";  // adjust path as needed
 *   axios.get(`${API_BASE_URL}/api/some-endpoint`)
 */

export const API_BASE_URL = "http://localhost:3000"
// export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
