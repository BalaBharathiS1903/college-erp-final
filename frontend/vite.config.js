import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to Spring Boot backend during development
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Code splitting — each page loads independently
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ["react", "react-dom", "react-router-dom"],
          admin:   ["./src/pages/AdminDashboard.jsx"],
          staff:   ["./src/pages/StaffDashboard.jsx"],
          student: ["./src/pages/StudentDashboard.jsx"],
        },
      },
    },
  },
});
